import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsArray,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/entities/user-role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'María López' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'maria@iglesia.cl' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.Secretaria })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ type: [String], description: 'Department IDs where user is director' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  departmentIds?: string[];
}
