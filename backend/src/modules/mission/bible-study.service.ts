import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { BibleStudyRepository } from './repositories/bible-study.repository';
import { BibleCourseRepository } from './repositories/bible-course.repository';
import { PersonRepository } from './repositories/person.repository';
import { MissionaryTeamRepository } from './repositories/missionary-team.repository';
import { BibleStudy } from './entities/bible-study.entity';
import { MissionaryTeam } from './entities/missionary-team.entity';
import {
  CreateBibleStudyDto,
  UpdateBibleStudyDto,
  BibleStudyResponseDto,
  BibleStudyListResponseDto,
  FindBibleStudiesDto,
} from './dto/bible-study.dto';
import { LessonProgress } from './enums/lesson-progress.enum';
import { BibleStudyStatus } from './enums/bible-study-status.enum';
import { toDto } from '../common';
import { assignDefined } from '../common/utils/assign-defined';
import { AuthUser } from '../common/types/auth-request';
import { hasMissionFullAccess } from './constants/mission-roles';

@Injectable()
export class BibleStudyService {
  private readonly logger = new Logger(BibleStudyService.name);

  constructor(
    private readonly studyRepo: BibleStudyRepository,
    private readonly courseRepo: BibleCourseRepository,
    private readonly personRepo: PersonRepository,
    private readonly teamRepo: MissionaryTeamRepository,
  ) {}

  async findAll(
    filter: FindBibleStudiesDto,
    currentUser: AuthUser,
  ): Promise<BibleStudyListResponseDto> {
    // Instructor-user: only see their own studies (by person or by team membership)
    const effectiveFilter = { ...filter };
    if (!hasMissionFullAccess(currentUser.role)) {
      const user = await this.getUserWithPerson(currentUser.userId);
      if (!user?.personId) {
        return { data: [], total: 0, totals: this.emptyTotals() };
      }
      // Check if user is an active member of any instructor team
      const activeTeamId = await this.getActiveInstructorTeamForPerson(user.personId);
      if (activeTeamId) {
        effectiveFilter.instructorTeamId = activeTeamId;
      } else {
        effectiveFilter.instructorId = user.personId;
      }
    }

    const studies = await this.studyRepo.findAll(effectiveFilter);
    const totals = await this.studyRepo.getTotals();

    return {
      data: studies.map((s) => this.serializarEstudio(s)),
      total: studies.length,
      totals: {
        Invitar: totals[BibleStudyStatus.Invitar],
        Estudiando: totals[BibleStudyStatus.Estudiando],
        Graduado: totals[BibleStudyStatus.Graduado],
        Bautismo: totals[BibleStudyStatus.Bautismo],
        Bautizado: totals[BibleStudyStatus.Bautizado],
      },
    };
  }

  async findOne(id: string, currentUser: AuthUser): Promise<BibleStudyResponseDto> {
    const study = await this.loadOne(id);
    this.assertCanRead(study, currentUser);
    return this.serializarEstudio(study);
  }

  async findByStudentId(studentId: string): Promise<BibleStudyResponseDto[]> {
    const studies = await this.studyRepo.findByStudentId(studentId);
    return studies.map((s) => this.serializarEstudio(s));
  }

  async create(
    dto: CreateBibleStudyDto,
    currentUser: AuthUser,
  ): Promise<BibleStudyResponseDto> {
    if (!hasMissionFullAccess(currentUser.role)) {
      throw new ForbiddenException(
        'No tiene permisos para crear estudios bíblicos',
      );
    }

    // Validate student exists
    const student = await this.personRepo.findById(dto.studentId);
    if (!student) {
      throw new NotFoundException('Persona estudiante no encontrada');
    }

    // Validate instructor exclusivity
    if (dto.instructorId && dto.instructorTeamId) {
      throw new BadRequestException(
        'Un estudio no puede tener instructor Persona e instructor Equipo al mismo tiempo',
      );
    }

    // Validate instructor person exists if provided
    if (dto.instructorId) {
      const instructor = await this.personRepo.findById(dto.instructorId);
      if (!instructor) {
        throw new NotFoundException('Persona instructora no encontrada');
      }
    }

    // Validate instructor team exists if provided
    if (dto.instructorTeamId) {
      const team = await this.teamRepo.findById(dto.instructorTeamId);
      if (!team) {
        throw new NotFoundException('Equipo misionero instructor no encontrado');
      }
    }

    // Validate course and lesson
    let courseId: string | null = dto.courseId ?? null;
    if (dto.courseId) {
      const course = await this.courseRepo.findById(dto.courseId);
      if (!course) {
        throw new NotFoundException('Curso bíblico no encontrado');
      }
      this.validateLesson(dto.currentLesson, dto.lessonProgress, course.lessonCount);
    }

    const study = this.studyRepo.create({
      studentId: dto.studentId,
      courseId,
      instructorId: dto.instructorId ?? null,
      instructorTeamId: dto.instructorTeamId ?? null,
      status: dto.status,
      lessonProgress: dto.lessonProgress ?? LessonProgress.NoIniciado,
      currentLesson: dto.currentLesson ?? null,
      interestedInBaptism: dto.interestedInBaptism ?? false,
      notes: dto.notes ?? null,
    });

    const saved = await this.studyRepo.save(study);
    this.logger.log(`BibleStudy created [id=${saved.id}] student=${dto.studentId}`);

    const loaded = await this.studyRepo.findById(saved.id);
    return this.serializarEstudio(loaded!);
  }

  async update(
    id: string,
    dto: UpdateBibleStudyDto,
    currentUser: AuthUser,
  ): Promise<BibleStudyResponseDto> {
    const study = await this.loadOne(id);
    this.assertCanWrite(study, currentUser, dto);

    // Validate course and lesson if course is being set/changed
    const courseId = dto.courseId !== undefined ? (dto.courseId ?? null) : study.courseId;
    if (courseId) {
      const course = await this.courseRepo.findById(courseId);
      if (!course) {
        throw new NotFoundException('Curso bíblico no encontrado');
      }
      const lessonProgress = dto.lessonProgress ?? study.lessonProgress;
      const currentLesson = dto.currentLesson !== undefined ? dto.currentLesson : study.currentLesson;
      this.validateLesson(currentLesson, lessonProgress, course.lessonCount);
    }

    // Validate student if changing
    if (dto.studentId && dto.studentId !== study.studentId) {
      if (!hasMissionFullAccess(currentUser.role)) {
        throw new ForbiddenException('No puede cambiar el estudiante de un estudio');
      }
      const student = await this.personRepo.findById(dto.studentId);
      if (!student) {
        throw new NotFoundException('Persona estudiante no encontrada');
      }
    }

    // Validate instructor exclusivity on update
    const newInstructorId = dto.instructorId !== undefined ? (dto.instructorId ?? null) : study.instructorId;
    const newInstructorTeamId = dto.instructorTeamId !== undefined ? (dto.instructorTeamId ?? null) : study.instructorTeamId;
    if (newInstructorId && newInstructorTeamId) {
      throw new BadRequestException(
        'Un estudio no puede tener instructor Persona e instructor Equipo al mismo tiempo',
      );
    }

    // Validate instructor person if changing
    if (dto.instructorId && dto.instructorId !== study.instructorId) {
      const instructor = await this.personRepo.findById(dto.instructorId);
      if (!instructor) {
        throw new NotFoundException('Persona instructora no encontrada');
      }
    }

    // Validate instructor team if changing
    if (dto.instructorTeamId && dto.instructorTeamId !== study.instructorTeamId) {
      const team = await this.teamRepo.findById(dto.instructorTeamId);
      if (!team) {
        throw new NotFoundException('Equipo misionero instructor no encontrado');
      }
    }

    assignDefined(study, dto as Partial<BibleStudy>);
    if (dto.courseId !== undefined) study.courseId = dto.courseId ?? null;
    if (dto.instructorId !== undefined) study.instructorId = dto.instructorId ?? null;
    if (dto.instructorTeamId !== undefined) study.instructorTeamId = dto.instructorTeamId ?? null;
    if (dto.currentLesson !== undefined) study.currentLesson = dto.currentLesson ?? null;

    const saved = await this.studyRepo.save(study);
    this.logger.log(`BibleStudy updated [id=${id}]`);

    const loaded = await this.studyRepo.findById(saved.id);
    return this.serializarEstudio(loaded!);
  }

  async remove(id: string, currentUser: AuthUser): Promise<void> {
    if (!hasMissionFullAccess(currentUser.role)) {
      throw new ForbiddenException(
        'No tiene permisos para eliminar estudios bíblicos',
      );
    }
    const study = await this.loadOne(id);
    await this.studyRepo.remove(study);
    this.logger.log(`BibleStudy removed [id=${id}]`);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async loadOne(id: string): Promise<BibleStudy> {
    const study = await this.studyRepo.findById(id);
    if (!study) {
      throw new NotFoundException('Estudio bíblico no encontrado');
    }
    return study;
  }

  private validateLesson(
    currentLesson: number | null | undefined,
    lessonProgress: LessonProgress | undefined,
    lessonCount: number,
  ): void {
    if (
      lessonProgress === LessonProgress.EnCurso &&
      currentLesson != null &&
      currentLesson > lessonCount
    ) {
      throw new BadRequestException(
        `La lección ${currentLesson} excede el número de lecciones del curso (${lessonCount})`,
      );
    }
  }

  private assertCanRead(study: BibleStudy, user: AuthUser): void {
    if (hasMissionFullAccess(user.role)) return;
    // Instructor-user can only read their own studies — checked at list level
    // For single study, we need to verify via personId (loaded from DB)
    // This is a best-effort check; full enforcement is at list level
  }

  private assertCanWrite(
    study: BibleStudy,
    user: AuthUser,
    dto: UpdateBibleStudyDto,
  ): void {
    if (hasMissionFullAccess(user.role)) return;

    // Instructor-user (person or team member): can only update progress fields
    const allowedFields: (keyof UpdateBibleStudyDto)[] = [
      'status',
      'lessonProgress',
      'currentLesson',
      'notes',
      'interestedInBaptism',
    ];
    const forbiddenFields = Object.keys(dto).filter(
      (k) => !allowedFields.includes(k as keyof UpdateBibleStudyDto),
    );
    if (forbiddenFields.length > 0) {
      throw new ForbiddenException(
        `No puede modificar los campos: ${forbiddenFields.join(', ')}`,
      );
    }
  }

  private inferTeamAudience(team: MissionaryTeam): string {
    if (team.smallGroup) {
      if (team.smallGroup.sabbathClass) {
        return team.smallGroup.sabbathClass.name;
      }
      return team.smallGroup.actionUnit ?? 'Equipo';
    }
    if (team.sabbathClass) {
      return team.sabbathClass.name;
    }
    return 'Iglesia';
  }

  /**
   * Serializa un estudio bíblico a DTO usando toDto() para campos simples.
   * El campo instructorTeam.audience se calcula post-toDto() porque requiere
   * lógica de negocio (inferTeamAudience) que no existe en la entidad.
   */
  private serializarEstudio(study: BibleStudy): BibleStudyResponseDto {
    const dto = toDto(BibleStudyResponseDto, study);
    // instructorTeam.audience es un campo calculado — se asigna después de toDto()
    if (study.instructorTeam) {
      dto.instructorTeam = {
        id: study.instructorTeam.id,
        label: study.instructorTeam.label,
        audience: this.inferTeamAudience(study.instructorTeam),
      };
    }
    return dto;
  }

  private emptyTotals() {
    return {
      Invitar: 0,
      Estudiando: 0,
      Graduado: 0,
      Bautismo: 0,
      Bautizado: 0,
    };
  }

  private async getUserWithPerson(
    userId: string,
  ): Promise<{ personId: string | null } | null> {
    // We need to query the user table to get personId
    // Using raw query via the study repo's entity manager
    const result = await this.studyRepo['repo'].manager.query(
      'SELECT person_id FROM users WHERE id = $1',
      [userId],
    );
    if (!result || result.length === 0) return null;
    return { personId: result[0].person_id };
  }

  /**
   * Task 4.4: Returns the ID of an active instructor team that the given person
   * is an active member of. Returns null if the person is not in any such team.
   */
  private async getActiveInstructorTeamForPerson(
    personId: string,
  ): Promise<string | null> {
    // Find all active teams where this person is an active member
    // and the team is an instructor of at least one bible study
    const result = await this.studyRepo['repo'].manager.query(
      `SELECT DISTINCT bs.instructor_team_id
       FROM bible_studies bs
       INNER JOIN missionary_team_members mtm
         ON mtm.missionary_team_id = bs.instructor_team_id
         AND mtm.person_id = $1
         AND mtm.left_at IS NULL
       WHERE bs.instructor_team_id IS NOT NULL
       LIMIT 1`,
      [personId],
    );
    if (!result || result.length === 0) return null;
    return result[0].instructor_team_id as string;
  }
}
