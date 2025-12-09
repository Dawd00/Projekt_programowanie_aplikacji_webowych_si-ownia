import { PartialType } from '@nestjs/swagger';
import { CreatePassDto } from './create-pass.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePassDto extends PartialType(CreatePassDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

