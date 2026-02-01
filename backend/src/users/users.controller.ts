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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PassesService } from '../passes/passes.service';
import { BookingsService } from '../bookings/bookings.service';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Roles('ADMIN', 'EMPLOYEE')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly passesService: PassesService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, type: String })
  findAll(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('role') role?: string,
  ) {
    return this.usersService.findAll(limit, offset, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get(':id/passes')
  @ApiOperation({ summary: 'Get passes for a user' })
  getUserPasses(@Param('id') id: string) {
    return this.passesService.findByUserId(id);
  }

  @Get(':id/bookings')
  @ApiOperation({ summary: 'Get bookings for a user' })
  getUserBookings(@Param('id') id: string) {
    return this.bookingsService.findByUserId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
