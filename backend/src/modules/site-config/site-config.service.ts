import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThanOrEqual, Like } from 'typeorm';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { PrincipalLeader } from './entities/principal-leader.entity';
import { SiteSetting } from './entities/site-setting.entity';
import { Event } from '../calendar/entities/event.entity';
import { EventStatus } from '../calendar/entities/event-status.enum';
import { CreatePrincipalLeaderDto } from './dto/create-principal-leader.dto';
import { UpdatePrincipalLeaderDto } from './dto/update-principal-leader.dto';
import { PrincipalLeaderResponseDto } from './dto/principal-leader-response.dto';
import {
  MinistryLeadershipDto,
  PublicLeadershipDto,
} from './dto/public-leadership.dto';
import { PublicHomeDto } from './dto/public-home.dto';
import { ReadHomeConfigDto, UpdateHomeConfigDto } from './dto/home-config.dto';
import { SITE_UPLOAD_SUBDIR } from './config/upload.config';

const BOARD_PHOTO_KEY = 'leadership.board_photo';

const HOME_KEYS = {
  HERO_TITLE: 'inicio.hero_title',
  HERO_TITLE_ACCENT: 'inicio.hero_title_accent',
  HERO_SUBTITLE: 'inicio.hero_subtitle',
  HERO_MAIN_IMAGE: 'inicio.hero_main_image',
  HERO_SMALL_IMAGE: 'inicio.hero_small_image',
  VERSE_TEXT: 'inicio.verse_text',
  VERSE_REFERENCE: 'inicio.verse_reference',
  SCHEDULE_TITLE: 'inicio.schedule_title',
  SCHEDULE_SUBTITLE: 'inicio.schedule_subtitle',
  FACEBOOK_URL: 'inicio.facebook_url',
  INSTAGRAM_URL: 'inicio.instagram_url',
  YOUTUBE_URL: 'inicio.youtube_url',
  FOOTER_CTA_TITLE: 'inicio.footer_cta_title',
  FOOTER_CTA_SUBTITLE: 'inicio.footer_cta_subtitle',
  FOOTER_CTA_BUTTON: 'inicio.footer_cta_button',
  NEXT_SERVICE_IMAGE: 'inicio.next_service_image',
  CONTACT_ADDRESS: 'inicio.contact_address',
  CONTACT_CITY: 'inicio.contact_city',
  CONTACT_EMAIL: 'inicio.contact_email',
  CONTACT_PHONE: 'inicio.contact_phone',
};

@Injectable()
export class SiteConfigService {
  private readonly logger = new Logger(SiteConfigService.name);

  constructor(
    @InjectRepository(PrincipalLeader)
    private readonly leaderRepo: Repository<PrincipalLeader>,
    @InjectRepository(SiteSetting)
    private readonly settingRepo: Repository<SiteSetting>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
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

  // ─── Sección Inicio ────────────────────────────────────────────────────────

  async getPublicHome(): Promise<PublicHomeDto> {
    const [settings, nextEvent] = await Promise.all([
      this.settingRepo.find({
        where: { key: Like('inicio.%') },
      }),
      this.eventRepo.findOne({
        where: {
          status: EventStatus.Published,
          startDate: MoreThanOrEqual(new Date()),
        },
        order: { startDate: 'ASC' },
      }),
    ]);

    const s = (key: string) => settings.find((r) => r.key === key)?.value ?? null;

    return {
      hero: {
        title: s(HOME_KEYS.HERO_TITLE),
        titleAccent: s(HOME_KEYS.HERO_TITLE_ACCENT),
        subtitle: s(HOME_KEYS.HERO_SUBTITLE),
        mainImageUrl: this.toUrl(s(HOME_KEYS.HERO_MAIN_IMAGE)),
        smallImageUrl: this.toUrl(s(HOME_KEYS.HERO_SMALL_IMAGE)),
      },
      verse: {
        text: s(HOME_KEYS.VERSE_TEXT),
        reference: s(HOME_KEYS.VERSE_REFERENCE),
      },
      schedule: {
        title: s(HOME_KEYS.SCHEDULE_TITLE),
        subtitle: s(HOME_KEYS.SCHEDULE_SUBTITLE),
      },
      social: {
        facebookUrl: s(HOME_KEYS.FACEBOOK_URL),
        instagramUrl: s(HOME_KEYS.INSTAGRAM_URL),
        youtubeUrl: s(HOME_KEYS.YOUTUBE_URL),
      },
      footerCta: {
        title: s(HOME_KEYS.FOOTER_CTA_TITLE),
        subtitle: s(HOME_KEYS.FOOTER_CTA_SUBTITLE),
        buttonText: s(HOME_KEYS.FOOTER_CTA_BUTTON),
      },
      contact: {
        address: s(HOME_KEYS.CONTACT_ADDRESS),
        city: s(HOME_KEYS.CONTACT_CITY),
        email: s(HOME_KEYS.CONTACT_EMAIL),
        phone: s(HOME_KEYS.CONTACT_PHONE),
      },
      nextService: nextEvent
        ? {
            title: nextEvent.title,
            date: nextEvent.startDate.toISOString(),
            location: nextEvent.location,
            imageUrl: this.toUrl(s(HOME_KEYS.NEXT_SERVICE_IMAGE)),
          }
        : null,
    };
  }

  async getHomeConfig(): Promise<ReadHomeConfigDto> {
    const settings = await this.settingRepo.find({
      where: { key: Like('inicio.%') },
    });
    const s = (key: string) => settings.find((r) => r.key === key)?.value ?? null;

    return {
      heroTitle: s(HOME_KEYS.HERO_TITLE) ?? '',
      heroTitleAccent: s(HOME_KEYS.HERO_TITLE_ACCENT) ?? '',
      heroSubtitle: s(HOME_KEYS.HERO_SUBTITLE) ?? '',
      verseText: s(HOME_KEYS.VERSE_TEXT) ?? '',
      verseReference: s(HOME_KEYS.VERSE_REFERENCE) ?? '',
      scheduleTitle: s(HOME_KEYS.SCHEDULE_TITLE) ?? '',
      scheduleSubtitle: s(HOME_KEYS.SCHEDULE_SUBTITLE) ?? '',
      facebookUrl: s(HOME_KEYS.FACEBOOK_URL) ?? '',
      instagramUrl: s(HOME_KEYS.INSTAGRAM_URL) ?? '',
      youtubeUrl: s(HOME_KEYS.YOUTUBE_URL) ?? '',
      footerCtaTitle: s(HOME_KEYS.FOOTER_CTA_TITLE) ?? '',
      footerCtaSubtitle: s(HOME_KEYS.FOOTER_CTA_SUBTITLE) ?? '',
      footerCtaButtonText: s(HOME_KEYS.FOOTER_CTA_BUTTON) ?? '',
      contactAddress: s(HOME_KEYS.CONTACT_ADDRESS) ?? '',
      contactCity: s(HOME_KEYS.CONTACT_CITY) ?? '',
      contactEmail: s(HOME_KEYS.CONTACT_EMAIL) ?? '',
      contactPhone: s(HOME_KEYS.CONTACT_PHONE) ?? '',
      heroMainImageUrl: this.toUrl(s(HOME_KEYS.HERO_MAIN_IMAGE)),
      heroSmallImageUrl: this.toUrl(s(HOME_KEYS.HERO_SMALL_IMAGE)),
      nextServiceImageUrl: this.toUrl(s(HOME_KEYS.NEXT_SERVICE_IMAGE)),
    };
  }

  async saveHomeConfig(dto: UpdateHomeConfigDto): Promise<void> {
    const updates: Promise<void>[] = [];

    if (dto.heroTitle !== undefined) updates.push(this.setSetting(HOME_KEYS.HERO_TITLE, dto.heroTitle));
    if (dto.heroTitleAccent !== undefined) updates.push(this.setSetting(HOME_KEYS.HERO_TITLE_ACCENT, dto.heroTitleAccent));
    if (dto.heroSubtitle !== undefined) updates.push(this.setSetting(HOME_KEYS.HERO_SUBTITLE, dto.heroSubtitle));
    if (dto.verseText !== undefined) updates.push(this.setSetting(HOME_KEYS.VERSE_TEXT, dto.verseText));
    if (dto.verseReference !== undefined) updates.push(this.setSetting(HOME_KEYS.VERSE_REFERENCE, dto.verseReference));
    if (dto.scheduleTitle !== undefined) updates.push(this.setSetting(HOME_KEYS.SCHEDULE_TITLE, dto.scheduleTitle));
    if (dto.scheduleSubtitle !== undefined) updates.push(this.setSetting(HOME_KEYS.SCHEDULE_SUBTITLE, dto.scheduleSubtitle));
    if (dto.facebookUrl !== undefined) updates.push(this.setSetting(HOME_KEYS.FACEBOOK_URL, dto.facebookUrl));
    if (dto.instagramUrl !== undefined) updates.push(this.setSetting(HOME_KEYS.INSTAGRAM_URL, dto.instagramUrl));
    if (dto.youtubeUrl !== undefined) updates.push(this.setSetting(HOME_KEYS.YOUTUBE_URL, dto.youtubeUrl));
    if (dto.footerCtaTitle !== undefined) updates.push(this.setSetting(HOME_KEYS.FOOTER_CTA_TITLE, dto.footerCtaTitle));
    if (dto.footerCtaSubtitle !== undefined) updates.push(this.setSetting(HOME_KEYS.FOOTER_CTA_SUBTITLE, dto.footerCtaSubtitle));
    if (dto.footerCtaButtonText !== undefined) updates.push(this.setSetting(HOME_KEYS.FOOTER_CTA_BUTTON, dto.footerCtaButtonText));
    if (dto.contactAddress !== undefined) updates.push(this.setSetting(HOME_KEYS.CONTACT_ADDRESS, dto.contactAddress));
    if (dto.contactCity !== undefined) updates.push(this.setSetting(HOME_KEYS.CONTACT_CITY, dto.contactCity));
    if (dto.contactEmail !== undefined) updates.push(this.setSetting(HOME_KEYS.CONTACT_EMAIL, dto.contactEmail));
    if (dto.contactPhone !== undefined) updates.push(this.setSetting(HOME_KEYS.CONTACT_PHONE, dto.contactPhone));

    await Promise.all(updates);
  }

  async setHomeImage(
    slot: 'main' | 'small' | 'next-service',
    file: Express.Multer.File,
  ): Promise<{ url: string | null }> {
    let key = '';
    if (slot === 'main') key = HOME_KEYS.HERO_MAIN_IMAGE;
    else if (slot === 'small') key = HOME_KEYS.HERO_SMALL_IMAGE;
    else if (slot === 'next-service') key = HOME_KEYS.NEXT_SERVICE_IMAGE;
    else throw new NotFoundException('Slot de imagen inválido');

    const previous = await this.getSetting(key);
    await this.removeFile(previous);

    const path = `${SITE_UPLOAD_SUBDIR}/${file.filename}`;
    await this.setSetting(key, path);
    return { url: this.toUrl(path) };
  }
}
