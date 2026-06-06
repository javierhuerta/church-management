import { PartialType } from '@nestjs/swagger';
import { CreateSermonVideoDto } from './create-sermon-video.dto';

export class UpdateSermonVideoDto extends PartialType(CreateSermonVideoDto) {}
