import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const booking = this.bookingsRepository.create(createBookingDto);
    return await this.bookingsRepository.save(booking);
  }

  async findAll(limit = 20, offset = 0, userId?: string, sessionId?: string, status?: string) {
    const queryBuilder = this.bookingsRepository.createQueryBuilder('booking');

    if (userId) {
      queryBuilder.where('booking.userId = :userId', { userId });
    }

    if (sessionId) {
      queryBuilder.andWhere('booking.sessionId = :sessionId', { sessionId });
    }

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      pagination: {
        total,
        count: data.length,
        offset,
        limit,
      },
    };
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);
    Object.assign(booking, updateBookingDto);
    return await this.bookingsRepository.save(booking);
  }

  async remove(id: string): Promise<void> {
    const booking = await this.findOne(id);
    await this.bookingsRepository.remove(booking);
  }

  async findByUserId(userId: string) {
    return await this.bookingsRepository.find({
      where: { userId },
      relations: ['session'],
      order: { createdAt: 'DESC' },
    });
  }
}

