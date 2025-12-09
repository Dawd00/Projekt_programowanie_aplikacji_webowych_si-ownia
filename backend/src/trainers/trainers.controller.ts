import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TrainersService } from './trainers.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { SessionsService } from '../sessions/sessions.service';

@ApiTags('trainers')
@Controller('trainers')
export class TrainersController {
  constructor(
    private readonly trainersService: TrainersService,
    private readonly sessionsService: SessionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new trainer' })
  create(@Body() createTrainerDto: CreateTrainerDto) {
    return this.trainersService.create(createTrainerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trainers with pagination' })
  findAll(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.trainersService.findAll(limit, offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trainer by ID' })
  findOne(@Param('id') id: string) {
    return this.trainersService.findOne(id);
  }

  @Get(':id/sessions')
  @ApiOperation({ summary: 'Get sessions for a trainer' })
  getTrainerSessions(@Param('id') id: string) {
    return this.sessionsService.findByTrainerId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update trainer' })
  update(@Param('id') id: string, @Body() updateTrainerDto: UpdateTrainerDto) {
    return this.trainersService.update(id, updateTrainerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete trainer' })
  remove(@Param('id') id: string) {
    return this.trainersService.remove(id);
  }
}
