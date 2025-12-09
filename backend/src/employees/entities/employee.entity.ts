import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum EmployeePosition {
  RECEPTIONIST = 'RECEPTIONIST',
  MANAGER = 'MANAGER',
  CLEANER = 'CLEANER',
  MAINTENANCE = 'MAINTENANCE',
  OTHER = 'OTHER',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  userId: string;

  @Column({
    type: 'enum',
    enum: EmployeePosition,
    default: EmployeePosition.RECEPTIONIST,
  })
  position: EmployeePosition;

  @Column({ length: 255, nullable: true })
  department: string;

  @Column('decimal', { precision: 10, scale: 2 })
  salary: number;

  @Column('date', { nullable: true })
  hireDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.employee)
  @JoinColumn({ name: 'userId' })
  user: User;
}

