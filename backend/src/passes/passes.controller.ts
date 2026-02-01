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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PassesService } from './passes.service';
import { CreatePassDto } from './dto/create-pass.dto';
import { UpdatePassDto } from './dto/update-pass.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('passes')
@Controller('passes')
export class PassesController {
  constructor(private readonly passesService: PassesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pass' })
  create(@Body() createPassDto: CreatePassDto, @CurrentUser() user: any) {
    if (user?.role === 'CLIENT') {
      createPassDto.userId = user.userId;
    }
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
    @CurrentUser() user?: any,
  ) {
    const effectiveUserId =
      user?.role === 'CLIENT' ? user.userId : userId;
    return this.passesService.findAll(limit, offset, effectiveUserId, isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pass by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const pass = await this.passesService.findOne(id);
    if (user?.role === 'CLIENT' && pass.userId !== user.userId) {
      throw new ForbiddenException('Brak dostępu do karnetu innego użytkownika');
    }
    return pass;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update pass' })
  update(
    @Param('id') id: string,
    @Body() updatePassDto: UpdatePassDto,
    @CurrentUser() user: any,
  ) {
    if (user?.role === 'CLIENT') {
      throw new ForbiddenException('Brak uprawnień do edycji karnetów');
    }
    return this.passesService.update(id, updatePassDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete pass' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    if (user?.role === 'CLIENT') {
      throw new ForbiddenException('Brak uprawnień do usuwania karnetów');
    }
    return this.passesService.remove(id);
  }
}

