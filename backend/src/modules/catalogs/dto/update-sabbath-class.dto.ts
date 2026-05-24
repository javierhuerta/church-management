import { PartialType } from '@nestjs/swagger';
import { CreateSabbathClassDto } from './create-sabbath-class.dto';

export class UpdateSabbathClassDto extends PartialType(CreateSabbathClassDto) {}
