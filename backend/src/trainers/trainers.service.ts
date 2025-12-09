import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from './entities/trainer.entity';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';

@Injectable()
export class TrainersService {
  constructor(
    @InjectRepository(Trainer)
    private trainersRepository: Repository<Trainer>,
  ) {}

  async create(createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    const trainer = this.trainersRepository.create(createTrainerDto);
    return await this.trainersRepository.save(trainer);
  }

  async findAll(limit = 20, offset = 0) {
    const [data, total] = await this.trainersRepository.findAndCount({
      relations: ['user'],
      skip: offset,
      take: limit,
    });

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

  async findOne(id: string): Promise<Trainer> {
    const trainer = await this.trainersRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found`);
    }
    return trainer;
  }

  async update(id: string, updateTrainerDto: UpdateTrainerDto): Promise<Trainer> {
    const trainer = await this.findOne(id);
    Object.assign(trainer, updateTrainerDto);
    return await this.trainersRepository.save(trainer);
  }

  async remove(id: string): Promise<void> {
    const trainer = await this.findOne(id);
    await this.trainersRepository.remove(trainer);
  }
}

