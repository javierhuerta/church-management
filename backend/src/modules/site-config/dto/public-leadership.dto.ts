import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrincipalLeaderResponseDto } from './principal-leader-response.dto';

export class MinistryLeadershipDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  sigla: string | null;

  @ApiProperty() color: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Nombres de los responsables/directores, unidos por " y ".',
  })
  leaders: string | null;
}

/**
 * Carga única para la sección "Liderazgo" del sitio público (PageNosotros).
 */
export class PublicLeadershipDto {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'URL de la foto grupal de la junta de iglesia.',
  })
  boardPhotoUrl: string | null;

  @ApiProperty({
    type: [PrincipalLeaderResponseDto],
    description: 'Junta directiva / responsables principales.',
  })
  board: PrincipalLeaderResponseDto[];

  @ApiProperty({
    type: [MinistryLeadershipDto],
    description: 'Ministerios (departamentos) con sus responsables.',
  })
  ministries: MinistryLeadershipDto[];
}
