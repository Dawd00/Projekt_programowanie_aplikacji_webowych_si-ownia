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
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PassesService } from './passes.service';
import { CreatePassDto } from './dto/create-pass.dto';
import { UpdatePassDto } from './dto/update-pass.dto';

@ApiTags('passes')
@Controller('passes')
export class PassesController {
  constructor(private readonly passesService: PassesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pass' })
  create(@Body() createPassDto: CreatePassDto) {
    return this.passesService.create(createPassDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all passes with pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('userId') userId?: string,
    @Query('isActive', new DefaultValuePipe(undefined)) isActive?: boolean,
  ) {
    return this.passesService.findAll(limit, offset, userId, isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pass by ID' })
  findOne(@Param('id') id: string) {
    return this.passesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update pass' })
  update(@Param('id') id: string, @Body() updatePassDto: UpdatePassDto) {
    return this.passesService.update(id, updatePassDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete pass' })
  remove(@Param('id') id: string) {
    return this.passesService.remove(id);
  }
}

