import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Session } from '../../sessions/entities/session.entity';

@Entity('trainers')
export class Trainer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  userId: string;

  @Column({ length: 255, nullable: true })
  specialty: string;

  @Column('text', { nullable: true })
  bio: string;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  rating: number;

  @Column('decimal', { precision: 10, scale: 2 })
  hourlyRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.trainer)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Session, (session) => session.trainer)
  sessions: Session[];
}

