import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsArray,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/entities/user-role.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'María López' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'maria@iglesia.cl' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'newpassword123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ type: [String], description: 'Department IDs where user is director' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  departmentIds?: string[];
}
