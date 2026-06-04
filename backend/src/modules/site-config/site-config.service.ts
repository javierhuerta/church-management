import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { PrincipalLeader } from './entities/principal-leader.entity';
import { SiteSetting } from './entities/site-setting.entity';
import { CreatePrincipalLeaderDto } from './dto/create-principal-leader.dto';
import { UpdatePrincipalLeaderDto } from './dto/update-principal-leader.dto';
import { PrincipalLeaderResponseDto } from './dto/principal-leader-response.dto';
import {
  MinistryLeadershipDto,
  PublicLeadershipDto,
} from './dto/public-leadership.dto';
import { SITE_UPLOAD_SUBDIR } from './config/upload.config';

const BOARD_PHOTO_KEY = 'leadership.board_photo';

@Injectable()
export class SiteConfigService {
  private readonly logger = new Logger(SiteConfigService.name);

  constructor(
    @InjectRepository(PrincipalLeader)
    private readonly leaderRepo: Repository<PrincipalLeader>,
    @InjectRepository(SiteSetting)
    private readonly settingRepo: Repository<SiteSetting>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private toUrl(path: string | null): string | null {
    return path ? `/uploads/${path}` : null;
  }

  private toLeaderDto(leader: PrincipalLeader): PrincipalLeaderResponseDto {
    return {
      id: leader.id,
      role: leader.role,
      name: leader.name,
      photoUrl: this.toUrl(leader.photoPath),
      displayOrder: leader.displayOrder,
      isActive: leader.isActive,
    };
  }

  private async removeFile(path: string | null): Promise<void> {
    if (!path) return;
    try {
      await unlink(join(process.cwd(), 'uploads', path));
    } catch {
      // archivo ya inexistente: no es un error fatal
    }
  }

  private async getSetting(key: string): Promise<string | null> {
    const row = await this.settingRepo.findOne({ where: { key } });
    return row?.value ?? null;
  }

  private async setSetting(key: string, value: string | null): Promise<void> {
    const existing = await this.settingRepo.findOne({ where: { key } });
    if (existing) {
      existing.value = value;
      await this.settingRepo.save(existing);
    } else {
      await this.settingRepo.save(this.settingRepo.create({ key, value }));
    }
  }

  // ─── Líderes principales (CRUD admin) ──────────────────────────────────────

  async listLeaders(): Promise<PrincipalLeaderResponseDto[]> {
    const leaders = await this.leaderRepo.find({
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
    return leaders.map((l) => this.toLeaderDto(l));
  }

  async createLeader(
    dto: CreatePrincipalLeaderDto,
  ): Promise<PrincipalLeaderResponseDto> {
    const leader = this.leaderRepo.create({
      role: dto.role,
      name: dto.name,
      displayOrder: dto.displayOrder ?? 0,
      isActive: dto.isActive ?? true,
      photoPath: null,
    });
    const saved = await this.leaderRepo.save(leader);
    this.logger.log(`Principal leader created [id=${saved.id}]`);
    return this.toLeaderDto(saved);
  }

  async updateLeader(
    id: string,
    dto: UpdatePrincipalLeaderDto,
  ): Promise<PrincipalLeaderResponseDto> {
    const leader = await this.loadLeader(id);
    if (dto.role !== undefined) leader.role = dto.role;
    if (dto.name !== undefined) leader.name = dto.name;
    if (dto.displayOrder !== undefined) leader.displayOrder = dto.displayOrder;
    if (dto.isActive !== undefined) leader.isActive = dto.isActive;
    const saved = await this.leaderRepo.save(leader);
    return this.toLeaderDto(saved);
  }

  async removeLeader(id: string): Promise<void> {
    const leader = await this.loadLeader(id);
    await this.removeFile(leader.photoPath);
    await this.leaderRepo.remove(leader);
    this.logger.log(`Principal leader removed [id=${id}]`);
  }

  async setLeaderPhoto(
    id: string,
    file: Express.Multer.File,
  ): Promise<PrincipalLeaderResponseDto> {
    const leader = await this.loadLeader(id);
    await this.removeFile(leader.photoPath);
    leader.photoPath = `${SITE_UPLOAD_SUBDIR}/${file.filename}`;
    const saved = await this.leaderRepo.save(leader);
    return this.toLeaderDto(saved);
  }

  private async loadLeader(id: string): Promise<PrincipalLeader> {
    const leader = await this.leaderRepo.findOne({ where: { id } });
    if (!leader) throw new NotFoundException('Líder principal no encontrado');
    return leader;
  }

  // ─── Foto de la junta (site setting) ───────────────────────────────────────

  async getBoardPhotoUrl(): Promise<string | null> {
    return this.toUrl(await this.getSetting(BOARD_PHOTO_KEY));
  }

  async setBoardPhoto(
    file: Express.Multer.File,
  ): Promise<{ boardPhotoUrl: string | null }> {
    const previous = await this.getSetting(BOARD_PHOTO_KEY);
    await this.removeFile(previous);
    const path = `${SITE_UPLOAD_SUBDIR}/${file.filename}`;
    await this.setSetting(BOARD_PHOTO_KEY, path);
    return { boardPhotoUrl: this.toUrl(path) };
  }

  // ─── Ministerios (derivados de departamentos + directores) ─────────────────

  async listMinistries(): Promise<MinistryLeadershipDto[]> {
    const rows = await this.dataSource.query<
      {
        id: string;
        name: string;
        sigla: string | null;
        color: string;
        leaders: string | null;
      }[]
    >(
      `SELECT d.id, d.name, d.sigla, d.color,
              string_agg(u.name, ' y ' ORDER BY u.name) AS leaders
       FROM departments d
       LEFT JOIN user_departments ud ON ud.department_id = d.id
       LEFT JOIN users u ON u.id = ud.user_id
       GROUP BY d.id, d.name, d.sigla, d.color
       ORDER BY d.name ASC`,
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      sigla: r.sigla,
      color: r.color,
      leaders: r.leaders,
    }));
  }

  // ─── Carga pública agregada para PageNosotros ──────────────────────────────

  async getPublicLeadership(): Promise<PublicLeadershipDto> {
    const [boardPhotoUrl, leaders, ministries] = await Promise.all([
      this.getBoardPhotoUrl(),
      this.leaderRepo.find({
        where: { isActive: true },
        order: { displayOrder: 'ASC', name: 'ASC' },
      }),
      this.listMinistries(),
    ]);

    return {
      boardPhotoUrl,
      board: leaders.map((l) => this.toLeaderDto(l)),
      ministries,
    };
  }
}
