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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  create(@Body() createBookingDto: CreateBookingDto, @CurrentUser() user: any) {
    if (user?.role === 'CLIENT') {
      createBookingDto.userId = user.userId;
    }
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings with pagination' })
  findAll(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('userId') userId?: string,
    @Query('sessionId') sessionId?: string,
    @Query('status') status?: string,
    @CurrentUser() user?: any,
  ) {
    const effectiveUserId =
      user?.role === 'CLIENT' ? user.userId : userId;
    return this.bookingsService.findAll(
      limit,
      offset,
      effectiveUserId,
      sessionId,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking' })
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @CurrentUser() user: any,
  ) {
    if (user?.role === 'CLIENT' && updateBookingDto.status) {
      throw new ForbiddenException('Brak uprawnień do zmiany statusu');
    }

    if (user?.role === 'CLIENT') {
      const booking = await this.bookingsService.findOne(id);
      if (booking.userId !== user.userId) {
        throw new ForbiddenException('Brak dostępu do rezerwacji innego użytkownika');
      }
    }

    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete booking' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    if (user?.role === 'CLIENT') {
      const booking = await this.bookingsService.findOne(id);
      if (booking.userId !== user.userId) {
        throw new ForbiddenException('Brak dostępu do rezerwacji innego użytkownika');
      }
    }
    return this.bookingsService.remove(id);
  }
}

