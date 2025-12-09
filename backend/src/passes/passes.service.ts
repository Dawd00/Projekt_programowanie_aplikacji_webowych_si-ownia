import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pass } from './entities/pass.entity';
import { CreatePassDto } from './dto/create-pass.dto';
import { UpdatePassDto } from './dto/update-pass.dto';

@Injectable()
export class PassesService {
  constructor(
    @InjectRepository(Pass)
    private passesRepository: Repository<Pass>,
  ) {}

  async create(createPassDto: CreatePassDto): Promise<Pass> {
    const pass = this.passesRepository.create(createPassDto);
    return await this.passesRepository.save(pass);
  }

  async findAll(limit = 20, offset = 0, userId?: string, isActive?: boolean) {
    const queryBuilder = this.passesRepository.createQueryBuilder('pass');

    if (userId) {
      queryBuilder.where('pass.userId = :userId', { userId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('pass.isActive = :isActive', { isActive });
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

  async findOne(id: string): Promise<Pass> {
    const pass = await this.passesRepository.findOne({ where: { id } });
    if (!pass) {
      throw new NotFoundException(`Pass with ID ${id} not found`);
    }
    return pass;
  }

  async update(id: string, updatePassDto: UpdatePassDto): Promise<Pass> {
    const pass = await this.findOne(id);
    Object.assign(pass, updatePassDto);
    return await this.passesRepository.save(pass);
  }

  async remove(id: string): Promise<void> {
    const pass = await this.findOne(id);
    await this.passesRepository.remove(pass);
  }

  async findByUserId(userId: string) {
    return await this.passesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}

