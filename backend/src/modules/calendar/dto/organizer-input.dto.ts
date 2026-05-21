import { IsString, IsUUID, MaxLength, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Exactly one of `userId` or `displayName` must be provided. The XOR is
 * enforced in CalendarService (BadRequestException) since class-validator does
 * not ship a built-in @OneOf; ValidateIf below covers the "at least one" half.
 */
export class OrganizerInputDto {
  @ApiPropertyOptional({ type: String, description: 'User ID (UUID v4)' })
  @ValidateIf((o: OrganizerInputDto) => !o.displayName)
  @IsUUID('4')
  userId?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Free-text organizer name when not a system user',
  })
  @ValidateIf((o: OrganizerInputDto) => !o.userId)
  @IsString()
  @MaxLength(200)
  displayName?: string;
}
