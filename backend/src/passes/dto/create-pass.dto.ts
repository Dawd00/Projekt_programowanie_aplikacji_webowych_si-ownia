import { IsEnum, IsUUID, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PassType } from '../entities/pass.entity';

export class CreatePassDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: PassType })
  @IsEnum(PassType)
  type: PassType;

  @ApiProperty({ example: 150.0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-01-31' })
  @IsDateString()
  endDate: string;
}

