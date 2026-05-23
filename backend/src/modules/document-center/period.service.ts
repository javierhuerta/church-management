import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Period, RotationMode } from './entities/period.entity';
import { ElderShift } from './entities/elder-shift.entity';
import { ElderRotationService } from './elder-rotation.service';
import { User } from '@/modules/auth/entities/user.entity';
import { UserRole } from '@/modules/common/entities/user-role.enum';
import { CreatePeriodDto } from './dto/create-period.dto';

@Injectable()
export class PeriodService {
  constructor(
    @InjectRepository(Period)
    private periodRepository: Repository<Period>,
    @InjectRepository(ElderShift)
    private elderShiftRepository: Repository<ElderShift>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private elderRotationService: ElderRotationService,
  ) {}

  async createPeriod(dto: CreatePeriodDto): Promise<Period> {
    const existingPeriod = await this.periodRepository.findOne({ where: { year: dto.year } });
    if (existingPeriod) {
      throw new BadRequestException(`Ya existe un período para el año ${dto.year}`);
    }

    // Start date: use provided value or default to Jan 1 of the year.
    // Stored as a plain YYYY-MM-DD string to avoid timezone drift on `date` columns.
    const startDate = dto.startDate ?? `${dto.year}-01-01`;
    const endDate = `${dto.year}-12-31`;

    const period = this.periodRepository.create({
      year: dto.year,
      startDate: startDate as any,
      endDate: endDate as any,
      pastorId: dto.pastorId,
      rotationMode: dto.rotationMode ?? RotationMode.AUTOMATIC,
      shiftWeeks: dto.shiftWeeks ?? 2,
      notes: dto.notes,
      rotationGroups: dto.rotationGroups ?? null,
    });

    const savedPeriod = await this.periodRepository.save(period);

    if (savedPeriod.rotationMode === RotationMode.AUTOMATIC) {
      await this.generateAutomaticRotation(savedPeriod.id);
    }

    return this.findOne(savedPeriod.id);
  }

  /**
   * Generates shifts from period.rotationGroups (or falls back to individuals).
   * Always reads from the saved period — no parameter needed.
   */
  private async generateAutomaticRotation(periodId: string): Promise<void> {
    const period = await this.periodRepository.findOne({ where: { id: periodId } });
    if (!period) return;

    let groups: string[][];

    if (period.rotationGroups && period.rotationGroups.length > 0) {
      groups = period.rotationGroups.filter((g) => g.length > 0);
    } else {
      // No groups defined — fallback: rotate every eligible user individually
      const eligible = await this.userRepository.find({
        where: [
          { role: UserRole.Anciano },
          { role: UserRole.CoordinadorMisionero },
          { role: UserRole.Admin },
        ],
        order: { name: 'ASC' },
      });
      if (eligible.length === 0) return;
      groups = eligible.map((u) => [u.id]);
    }

    if (groups.length === 0) return;

    const rotation = this.elderRotationService.calculateRotation(
      period.startDate,
      period.endDate,
      groups,
      period.shiftWeeks,
    );

    for (const shift of rotation) {
      await this.elderShiftRepository.save(
        this.elderShiftRepository.create({
          periodId,
          elderId: shift.elderId,
          weekStart: shift.weekStart,
          weekEnd: shift.weekEnd,
        }),
      );
    }
  }

  async addElderShift(periodId: string, elderId: string, weekStart: Date, weekEnd: Date): Promise<ElderShift> {
    const period = await this.periodRepository.findOne({ where: { id: periodId } });
    if (!period) throw new NotFoundException('Período no encontrado');

    const elder = await this.userRepository.findOne({ where: { id: elderId } });
    if (!elder) throw new NotFoundException('Usuario no encontrado');

    const shift = this.elderShiftRepository.create({
      periodId, elderId, weekStart, weekEnd,
    });
    return this.elderShiftRepository.save(shift);
  }

  async removeElderShift(shiftId: string): Promise<void> {
    const shift = await this.elderShiftRepository.findOne({ where: { id: shiftId } });
    if (!shift) throw new NotFoundException('Turno no encontrado');
    await this.elderShiftRepository.remove(shift);
  }

  async findAll(): Promise<Period[]> {
    return this.periodRepository.find({ order: { year: 'DESC' } });
  }

  async findByYear(year: number): Promise<Period | null> {
    return this.periodRepository.findOne({
      where: { year },
      relations: ['pastor', 'elderShifts', 'elderShifts.elder'],
    });
  }

  async findOne(id: string): Promise<Period> {
    const period = await this.periodRepository.findOne({
      where: { id },
      relations: ['pastor', 'elderShifts', 'elderShifts.elder'],
    });
    if (!period) throw new NotFoundException(`Período con ID ${id} no encontrado`);
    return period;
  }

  async updatePeriod(
    id: string,
    pastorId: string | null,
    rotationMode?: RotationMode,
    shiftWeeks?: number,
    notes?: string,
    rotationGroups?: string[][],
    startDate?: string,
  ): Promise<Period> {
    const period = await this.findOne(id);
    const previousMode = period.rotationMode;
    const previousShiftWeeks = period.shiftWeeks;
    const previousGroups = JSON.stringify(period.rotationGroups ?? []);
    const previousStart = this.toDateString(period.startDate);

    period.pastorId = pastorId;
    period.pastor = pastorId ? await this.userRepository.findOne({ where: { id: pastorId } }) : null;
    if (rotationMode !== undefined) period.rotationMode = rotationMode;
    if (shiftWeeks !== undefined) period.shiftWeeks = shiftWeeks;
    if (notes !== undefined) period.notes = notes;
    if (rotationGroups !== undefined) period.rotationGroups = rotationGroups.length > 0 ? rotationGroups : null;
    if (startDate !== undefined) period.startDate = startDate as any;

    await this.periodRepository.save(period);

    // Regenerate when AUTOMATIC and something relevant changed
    const newGroups = JSON.stringify(period.rotationGroups ?? []);
    const newStart = this.toDateString(period.startDate);
    const shouldRegenerate =
      period.rotationMode === RotationMode.AUTOMATIC && (
        previousMode !== RotationMode.AUTOMATIC ||
        previousShiftWeeks !== period.shiftWeeks ||
        previousGroups !== newGroups ||
        previousStart !== newStart
      );

    if (shouldRegenerate) {
      await this.elderShiftRepository.delete({ periodId: id });
      await this.generateAutomaticRotation(id);
    } else if (
      // groups set for the first time but no shifts exist yet
      period.rotationMode === RotationMode.AUTOMATIC &&
      rotationGroups !== undefined &&
      rotationGroups.length > 0
    ) {
      const existingShifts = await this.elderShiftRepository.count({ where: { periodId: id } });
      if (existingShifts === 0) {
        await this.generateAutomaticRotation(id);
      }
    }

    return this.findOne(id);
  }

  async regenerateRotation(
    id: string,
    shiftWeeks: number,
    rotationGroups?: string[][],
    startDate?: string,
  ): Promise<Period> {
    const period = await this.findOne(id);

    if (shiftWeeks !== period.shiftWeeks) period.shiftWeeks = shiftWeeks;
    if (rotationGroups !== undefined) {
      period.rotationGroups = rotationGroups.length > 0 ? rotationGroups : null;
    }
    if (startDate !== undefined) period.startDate = startDate as any;
    await this.periodRepository.save(period);

    await this.elderShiftRepository.delete({ periodId: id });
    await this.generateAutomaticRotation(id);

    return this.findOne(id);
  }

  /** Normalizes a date value (Date or string) to a YYYY-MM-DD string. */
  private toDateString(d: Date | string): string {
    if (typeof d === 'string') return d.split('T')[0];
    return d.toISOString().split('T')[0];
  }
}
