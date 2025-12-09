import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    const session = this.sessionsRepository.create(createSessionDto);
    return await this.sessionsRepository.save(session);
  }

  async findAll(limit = 20, offset = 0, trainerId?: string, type?: string, date?: string) {
    const queryBuilder = this.sessionsRepository.createQueryBuilder('session');

    if (trainerId) {
      queryBuilder.where('session.trainerId = :trainerId', { trainerId });
    }

    if (type) {
      queryBuilder.andWhere('session.type = :type', { type });
    }

    if (date) {
      queryBuilder.andWhere('session.date = :date', { date });
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

  async findOne(id: string): Promise<Session> {
    const session = await this.sessionsRepository.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
    return session;
  }

  async update(id: string, updateSessionDto: UpdateSessionDto): Promise<Session> {
    const session = await this.findOne(id);
    Object.assign(session, updateSessionDto);
    return await this.sessionsRepository.save(session);
  }

  async remove(id: string): Promise<void> {
    const session = await this.findOne(id);
    await this.sessionsRepository.remove(session);
  }

  async findByTrainerId(trainerId: string) {
    return await this.sessionsRepository.find({
      where: { trainerId },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }
}

