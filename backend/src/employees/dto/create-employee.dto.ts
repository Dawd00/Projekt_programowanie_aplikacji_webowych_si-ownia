import { IsUUID, IsEnum, IsNumber, IsString, IsOptional, IsDateString, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmployeePosition } from '../entities/employee.entity';

export class CreateEmployeeDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: EmployeePosition, default: EmployeePosition.RECEPTIONIST })
  @IsEnum(EmployeePosition)
  position: EmployeePosition;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ example: 5000.0 })
  @IsNumber()
  @Min(0)
  salary: number;

  @ApiProperty({ example: '2024-01-01', required: false })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

