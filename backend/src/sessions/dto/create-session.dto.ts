import { IsEnum, IsUUID, IsNumber, IsDateString, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SessionType } from '../entities/session.entity';

export class CreateSessionDto {
  @ApiProperty()
  @IsUUID()
  trainerId: string;

  @ApiProperty({ enum: SessionType })
  @IsEnum(SessionType)
  type: SessionType;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '11:00' })
  @IsString()
  endTime: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  maxSlots: number;

  @ApiProperty({ example: 100.0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  roomId?: string;
}

