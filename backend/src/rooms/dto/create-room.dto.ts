import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ example: 'Sala A' })
  @IsString()
  name: string;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(1)
  capacity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  equipment?: string;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

