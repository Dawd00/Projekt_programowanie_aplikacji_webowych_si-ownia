import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../users/entities/user.entity';
import { Pass, PassType } from '../../passes/entities/pass.entity';
import { Trainer } from '../../trainers/entities/trainer.entity';
import { Employee, EmployeePosition } from '../../employees/entities/employee.entity';
import { Room } from '../../rooms/entities/room.entity';
import { Session, SessionType } from '../../sessions/entities/session.entity';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Pass)
    private passesRepository: Repository<Pass>,
    @InjectRepository(Trainer)
    private trainersRepository: Repository<Trainer>,
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  async seed() {
    console.log('🌱 Rozpoczynam seedowanie bazy danych...');

    // Czyszczenie bazy (opcjonalnie - można zakomentować)
    await this.clearDatabase();

    // Tworzenie danych
    const users = await this.createUsers();
    const rooms = await this.createRooms();
    const trainers = await this.createTrainers(users);
    const employees = await this.createEmployees(users);
    const passes = await this.createPasses(users);
    const sessions = await this.createSessions(trainers, rooms);
    const bookings = await this.createBookings(users, sessions);

    console.log('✅ Seedowanie zakończone pomyślnie!');
    console.log(`📊 Utworzono:`);
    console.log(`   - ${users.length} użytkowników`);
    console.log(`   - ${rooms.length} sal`);
    console.log(`   - ${trainers.length} trenerów`);
    console.log(`   - ${employees.length} pracowników`);
    console.log(`   - ${passes.length} karnetów`);
    console.log(`   - ${sessions.length} sesji`);
    console.log(`   - ${bookings.length} rezerwacji`);
  }

  private async clearDatabase() {
    console.log('🧹 Czyszczenie bazy danych...');
    // Usuwanie w kolejności uwzględniającej klucze obce
    await this.bookingsRepository.createQueryBuilder().delete().execute();
    await this.sessionsRepository.createQueryBuilder().delete().execute();
    await this.passesRepository.createQueryBuilder().delete().execute();
    await this.trainersRepository.createQueryBuilder().delete().execute();
    await this.employeesRepository.createQueryBuilder().delete().execute();
    await this.roomsRepository.createQueryBuilder().delete().execute();
    await this.usersRepository.createQueryBuilder().delete().execute();
  }

  private async createUsers(): Promise<User[]> {
    console.log('👥 Tworzenie użytkowników...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const usersData = [
      // Admin
      {
        email: 'admin@gym.pl',
        password: hashedPassword,
        firstName: 'Jan',
        lastName: 'Kowalski',
        role: UserRole.ADMIN,
        phone: '+48123456789',
      },
      // Klienci
      {
        email: 'klient1@gym.pl',
        password: hashedPassword,
        firstName: 'Anna',
        lastName: 'Nowak',
        role: UserRole.CLIENT,
        phone: '+48987654321',
      },
      {
        email: 'klient2@gym.pl',
        password: hashedPassword,
        firstName: 'Piotr',
        lastName: 'Wiśniewski',
        role: UserRole.CLIENT,
        phone: '+48111222333',
      },
      {
        email: 'klient3@gym.pl',
        password: hashedPassword,
        firstName: 'Maria',
        lastName: 'Dąbrowska',
        role: UserRole.CLIENT,
        phone: '+48444555666',
      },
      // Trenerzy
      {
        email: 'trener1@gym.pl',
        password: hashedPassword,
        firstName: 'Michał',
        lastName: 'Lewandowski',
        role: UserRole.TRAINER,
        phone: '+48777888999',
      },
      {
        email: 'trener2@gym.pl',
        password: hashedPassword,
        firstName: 'Katarzyna',
        lastName: 'Wójcik',
        role: UserRole.TRAINER,
        phone: '+48111222334',
      },
      // Pracownicy
      {
        email: 'pracownik1@gym.pl',
        password: hashedPassword,
        firstName: 'Tomasz',
        lastName: 'Kamiński',
        role: UserRole.EMPLOYEE,
        phone: '+48555666777',
      },
    ];

    const users = await this.usersRepository.save(usersData);
    return users;
  }

  private async createRooms(): Promise<Room[]> {
    console.log('🏠 Tworzenie sal...');
    const roomsData = [
      {
        name: 'Sala A - Siłownia',
        capacity: 30,
        equipment: 'Maszyny do ćwiczeń, hantle, sztangi',
        price: 50.0,
        isAvailable: true,
      },
      {
        name: 'Sala B - Cardio',
        capacity: 20,
        equipment: 'Bieżnie, rowerki, orbitreki',
        price: 40.0,
        isAvailable: true,
      },
      {
        name: 'Sala C - Joga',
        capacity: 15,
        equipment: 'Mata, klocki, paski',
        price: 30.0,
        isAvailable: true,
      },
      {
        name: 'Sala D - Crossfit',
        capacity: 25,
        equipment: 'Kettlebells, liny, boxy',
        price: 60.0,
        isAvailable: true,
      },
    ];

    const rooms = await this.roomsRepository.save(roomsData);
    return rooms;
  }

  private async createTrainers(users: User[]): Promise<Trainer[]> {
    console.log('💪 Tworzenie trenerów...');
    const trainers = users.filter((u) => u.role === UserRole.TRAINER);

    const trainersData = [
      {
        userId: trainers[0].id,
        specialty: 'Trening siłowy',
        bio: 'Doświadczony trener personalny specjalizujący się w treningu siłowym i budowaniu masy mięśniowej.',
        rating: 4.8,
        hourlyRate: 150.0,
      },
      {
        userId: trainers[1].id,
        specialty: 'Trening funkcjonalny',
        bio: 'Trenerka specjalizująca się w treningu funkcjonalnym i poprawie mobilności.',
        rating: 4.9,
        hourlyRate: 140.0,
      },
    ];

    const createdTrainers = await this.trainersRepository.save(trainersData);
    return createdTrainers;
  }

  private async createEmployees(users: User[]): Promise<Employee[]> {
    console.log('👔 Tworzenie pracowników...');
    const employees = users.filter((u) => u.role === UserRole.EMPLOYEE);

    const employeesData = [
      {
        userId: employees[0].id,
        position: EmployeePosition.MANAGER,
        department: 'Zarządzanie',
        salary: 8000.0,
        hireDate: new Date('2023-01-15'),
        isActive: true,
      },
    ];

    const createdEmployees = await this.employeesRepository.save(employeesData);
    return createdEmployees;
  }

  private async createPasses(users: User[]): Promise<Pass[]> {
    console.log('🎫 Tworzenie karnetów...');
    const clients = users.filter((u) => u.role === UserRole.CLIENT);

    const today = new Date();
    const passesData = [
      {
        userId: clients[0].id,
        type: PassType.MONTHLY,
        price: 150.0,
        startDate: new Date(today.getFullYear(), today.getMonth(), 1),
        endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0),
        isActive: true,
      },
      {
        userId: clients[0].id,
        type: PassType.QUARTERLY,
        price: 400.0,
        // QUARTERLY zaczyna się po zakończeniu MONTHLY, żeby uniknąć nakładania się
        startDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
        endDate: new Date(today.getFullYear(), today.getMonth() + 4, 0),
        isActive: true,
      },
      {
        userId: clients[1].id,
        type: PassType.YEARLY,
        price: 1200.0,
        startDate: new Date(today.getFullYear(), 0, 1),
        endDate: new Date(today.getFullYear(), 11, 31),
        isActive: true,
      },
      {
        userId: clients[2].id,
        type: PassType.SINGLE,
        price: 20.0,
        startDate: today,
        endDate: today,
        isActive: true,
      },
    ];

    const passes = await this.passesRepository.save(passesData);
    return passes;
  }

  private async createSessions(
    trainers: Trainer[],
    rooms: Room[],
  ): Promise<Session[]> {
    console.log('📅 Tworzenie sesji...');
    const today = new Date();
    const sessionsData = [];

    // Sesje na najbliższe dni
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Sesje trenera 1
      sessionsData.push({
        trainerId: trainers[0].id,
        type: SessionType.PERSONAL,
        date: date,
        startTime: '10:00',
        endTime: '11:00',
        maxSlots: 1,
        price: 150.0,
        roomId: rooms[0].id,
      });

      sessionsData.push({
        trainerId: trainers[0].id,
        type: SessionType.GROUP,
        date: date,
        startTime: '18:00',
        endTime: '19:00',
        maxSlots: 10,
        price: 50.0,
        roomId: rooms[3].id,
      });

      // Sesje trenera 2
      sessionsData.push({
        trainerId: trainers[1].id,
        type: SessionType.PERSONAL,
        date: date,
        startTime: '14:00',
        endTime: '15:00',
        maxSlots: 1,
        price: 140.0,
        roomId: rooms[1].id,
      });

      sessionsData.push({
        trainerId: trainers[1].id,
        type: SessionType.GROUP,
        date: date,
        startTime: '19:00',
        endTime: '20:00',
        maxSlots: 15,
        price: 40.0,
        roomId: rooms[2].id,
      });
    }

    const sessions = await this.sessionsRepository.save(sessionsData);
    return sessions;
  }

  private async createBookings(
    users: User[],
    sessions: Session[],
  ): Promise<Booking[]> {
    console.log('📝 Tworzenie rezerwacji...');
    const clients = users.filter((u) => u.role === UserRole.CLIENT);

    const bookingsData = [
      {
        userId: clients[0].id,
        sessionId: sessions[0].id,
        status: BookingStatus.CONFIRMED,
        notes: 'Pierwsza wizyta',
      },
      {
        userId: clients[0].id,
        sessionId: sessions[4].id,
        status: BookingStatus.PENDING,
        notes: null,
      },
      {
        userId: clients[1].id,
        sessionId: sessions[1].id,
        status: BookingStatus.CONFIRMED,
        notes: 'Regularne zajęcia',
      },
      {
        userId: clients[2].id,
        sessionId: sessions[8].id,
        status: BookingStatus.CONFIRMED,
        notes: null,
      },
    ];

    const bookings = await this.bookingsRepository.save(bookingsData);
    return bookings;
  }
}

