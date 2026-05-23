import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddSmallGroupMemberDto {
  @ApiProperty({ type: String, description: 'UUID de la Persona a agregar como integrante' })
  @IsUUID()
  personId: string;
}
