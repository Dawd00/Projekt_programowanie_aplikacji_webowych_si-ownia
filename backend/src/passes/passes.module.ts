import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassesService } from './passes.service';
import { PassesController } from './passes.controller';
import { Pass } from './entities/pass.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pass])],
  controllers: [PassesController],
  providers: [PassesService],
  exports: [PassesService],
})
export class PassesModule {}
