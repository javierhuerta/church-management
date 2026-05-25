import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Period, RotationMode } from './entities/period.entity';
import { ElderShift } from './entities/elder-shift.entity';
import { ElderRotationService } from './elder-rotation.service';
import { User } from '@/modules/auth/entities/user.entity';
import { UserRole } from '@/modules/common/entities/user-role.enum';
import { CreatePeriodDto } from './dto/create-period.dto';
import { PeriodResponseDto } from './dto/period-response.dto';
import { ElderShiftResponseDto } from './dto/elder-shift-response.dto';
import { toDto } from '@/modules/common';

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

  async createPeriod(dto: CreatePeriodDto): Promise<PeriodResponseDto> {
    const existingPeriod = await this.periodRepository.findOne({ where: { year: dto.year } });
    if (existingPeriod) {
      throw new BadRequestException(`Ya existe un período para el año ${dto.year}`);
    }

    // Fecha inicio: usar valor provisto o por defecto 1 de enero del año.
    // Se almacena como string YYYY-MM-DD para evitar drift de zona horaria en columnas `date`.
    const startDate = dto.startDate ?? `${dto.year}-01-01`;
    const endDate = `${dto.year}-12-31`;

    const period = this.periodRepository.create({
      year: dto.year,
      // TypeORM `date` columns accept ISO strings (YYYY-MM-DD) at runtime even
      // though the TypeScript type is `Date`. We cast via `unknown` to preserve
      // type safety without silencing the compiler with `any`.
      startDate: startDate as unknown as Date,
      endDate: endDate as unknown as Date,
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

    return this.serializarPeriodo(await this.cargarPeriodo(savedPeriod.id));
  }

  /**
   * Genera turnos desde period.rotationGroups (o fallback a individuos).
   * Siempre lee desde el período guardado — no necesita parámetro.
   */
  private async generateAutomaticRotation(periodId: string): Promise<void> {
    const period = await this.periodRepository.findOne({ where: { id: periodId } });
    if (!period) return;

    let groups: string[][];

    if (period.rotationGroups && period.rotationGroups.length > 0) {
      groups = period.rotationGroups.filter((g) => g.length > 0);
    } else {
      // Sin grupos definidos — fallback: rotar cada usuario elegible individualmente
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

  async addElderShift(periodId: string, elderId: string, weekStart: Date, weekEnd: Date): Promise<ElderShiftResponseDto> {
    const period = await this.periodRepository.findOne({ where: { id: periodId } });
    if (!period) throw new NotFoundException('Período no encontrado');

    const elder = await this.userRepository.findOne({ where: { id: elderId } });
    if (!elder) throw new NotFoundException('Usuario no encontrado');

    const shift = this.elderShiftRepository.create({
      periodId, elderId, weekStart, weekEnd,
    });
    const saved = await this.elderShiftRepository.save(shift);
    // Asignamos la relación elder directamente para evitar una consulta adicional.
    // ElderShift.elder es una relación TypeORM declarada en la entidad — la
    // asignamos post-save para que toDto() pueda serializar el campo sin hacer
    // una query adicional.
    saved.elder = elder;
    return toDto(ElderShiftResponseDto, saved);
  }

  async removeElderShift(shiftId: string): Promise<void> {
    const shift = await this.elderShiftRepository.findOne({ where: { id: shiftId } });
    if (!shift) throw new NotFoundException('Turno no encontrado');
    await this.elderShiftRepository.remove(shift);
  }

  async findAll(): Promise<PeriodResponseDto[]> {
    const items = await this.periodRepository.find({ order: { year: 'DESC' } });
    return toDto(PeriodResponseDto, items);
  }

  async findByYear(year: number): Promise<PeriodResponseDto | null> {
    const period = await this.periodRepository.findOne({
      where: { year },
      relations: ['pastor', 'elderShifts', 'elderShifts.elder'],
    });
    if (!period) return null;
    return this.serializarPeriodo(period);
  }

  async findOne(id: string): Promise<PeriodResponseDto> {
    const period = await this.cargarPeriodo(id);
    return this.serializarPeriodo(period);
  }

  async updatePeriod(
    id: string,
    pastorId: string | null,
    rotationMode?: RotationMode,
    shiftWeeks?: number,
    notes?: string,
    rotationGroups?: string[][],
    startDate?: string,
  ): Promise<PeriodResponseDto> {
    // Cargamos la entidad cruda para modificar y guardar
    const period = await this.cargarPeriodo(id);
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
    if (startDate !== undefined) period.startDate = startDate as unknown as Date;

    await this.periodRepository.save(period);

    // Regenerar cuando AUTOMATIC y algo relevante cambió
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
      // Grupos definidos por primera vez pero sin turnos existentes
      period.rotationMode === RotationMode.AUTOMATIC &&
      rotationGroups !== undefined &&
      rotationGroups.length > 0
    ) {
      const existingShifts = await this.elderShiftRepository.count({ where: { periodId: id } });
      if (existingShifts === 0) {
        await this.generateAutomaticRotation(id);
      }
    }

    return this.serializarPeriodo(await this.cargarPeriodo(id));
  }

  async regenerateRotation(
    id: string,
    shiftWeeks: number,
    rotationGroups?: string[][],
    startDate?: string,
  ): Promise<PeriodResponseDto> {
    const period = await this.cargarPeriodo(id);

    if (shiftWeeks !== period.shiftWeeks) period.shiftWeeks = shiftWeeks;
    if (rotationGroups !== undefined) {
      period.rotationGroups = rotationGroups.length > 0 ? rotationGroups : null;
    }
    if (startDate !== undefined) period.startDate = startDate as unknown as Date;
    await this.periodRepository.save(period);

    await this.elderShiftRepository.delete({ periodId: id });
    await this.generateAutomaticRotation(id);

    return this.serializarPeriodo(await this.cargarPeriodo(id));
  }

  /** Carga un período con todas sus relaciones (uso interno) */
  private async cargarPeriodo(id: string): Promise<Period> {
    const period = await this.periodRepository.findOne({
      where: { id },
      relations: ['pastor', 'elderShifts', 'elderShifts.elder'],
    });
    if (!period) throw new NotFoundException(`Período con ID ${id} no encontrado`);
    return period;
  }

  /** Serializa un período a DTO usando toDto() */
  private serializarPeriodo(period: Period): PeriodResponseDto {
    return toDto(PeriodResponseDto, period);
  }

  /** Normaliza un valor de fecha (Date o string) a string YYYY-MM-DD */
  private toDateString(d: Date | string): string {
    if (typeof d === 'string') return d.split('T')[0];
    return d.toISOString().split('T')[0];
  }
}
