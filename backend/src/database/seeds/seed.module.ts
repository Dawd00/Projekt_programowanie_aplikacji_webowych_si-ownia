import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../../users/entities/user.entity';
import { Pass } from '../../passes/entities/pass.entity';
import { Trainer } from '../../trainers/entities/trainer.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Room } from '../../rooms/entities/room.entity';
import { Session } from '../../sessions/entities/session.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Pass,
      Trainer,
      Employee,
      Room,
      Session,
      Booking,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}

