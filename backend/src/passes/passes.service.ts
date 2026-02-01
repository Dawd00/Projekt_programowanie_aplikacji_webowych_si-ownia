import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    // Sprawdź czy użytkownik nie ma już karnetu w nakładającym się zakresie dat
    const existingPasses = await this.passesRepository.find({
      where: { userId: createPassDto.userId },
    });

    const newStartDate = new Date(createPassDto.startDate);
    const newEndDate = new Date(createPassDto.endDate);

    for (const existingPass of existingPasses) {
      const existingStartDate = new Date(existingPass.startDate);
      const existingEndDate = new Date(existingPass.endDate);

      // Sprawdź czy zakresy dat się nakładają
      // Dwa zakresy nakładają się jeśli: startDate nowego <= endDate istniejącego AND endDate nowego >= startDate istniejącego
      if (
        newStartDate <= existingEndDate &&
        newEndDate >= existingStartDate
      ) {
        throw new BadRequestException(
          `Użytkownik ma już aktywny karnet w zakresie dat ${existingStartDate.toLocaleDateString('pl-PL')} - ${existingEndDate.toLocaleDateString('pl-PL')}. Zakresy dat nie mogą się nakładać.`,
        );
      }
    }

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

    const nextUserId = updatePassDto.userId || pass.userId;
    const nextStartDate = updatePassDto.startDate
      ? new Date(updatePassDto.startDate)
      : new Date(pass.startDate);
    const nextEndDate = updatePassDto.endDate
      ? new Date(updatePassDto.endDate)
      : new Date(pass.endDate);

    const existingPasses = await this.passesRepository.find({
      where: { userId: nextUserId },
    });

    for (const existingPass of existingPasses) {
      if (existingPass.id === pass.id) continue;
      const existingStartDate = new Date(existingPass.startDate);
      const existingEndDate = new Date(existingPass.endDate);
      if (nextStartDate <= existingEndDate && nextEndDate >= existingStartDate) {
        throw new BadRequestException(
          `Użytkownik ma już aktywny karnet w zakresie dat ${existingStartDate.toLocaleDateString('pl-PL')} - ${existingEndDate.toLocaleDateString('pl-PL')}. Zakresy dat nie mogą się nakładać.`,
        );
      }
    }

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

