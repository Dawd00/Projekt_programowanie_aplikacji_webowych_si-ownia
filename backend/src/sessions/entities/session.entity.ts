import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Trainer } from '../../trainers/entities/trainer.entity';
import { Room } from '../../rooms/entities/room.entity';
import { Booking } from '../../bookings/entities/booking.entity';

export enum SessionType {
  PERSONAL = 'PERSONAL',
  GROUP = 'GROUP',
}

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  trainerId: string;

  @Column({
    type: 'enum',
    enum: SessionType,
  })
  type: SessionType;

  @Column('date')
  date: Date;

  @Column('time')
  startTime: string;

  @Column('time')
  endTime: string;

  @Column('int')
  maxSlots: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('uuid', { nullable: true })
  roomId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Trainer, (trainer) => trainer.sessions)
  @JoinColumn({ name: 'trainerId' })
  trainer: Trainer;

  @ManyToOne(() => Room, (room) => room.sessions, { nullable: true })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @OneToMany(() => Booking, (booking) => booking.session)
  bookings: Booking[];
}

