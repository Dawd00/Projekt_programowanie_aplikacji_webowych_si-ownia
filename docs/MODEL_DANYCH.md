# Model Danych - Panel Siłowni

## Diagram ERD

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    User     │────────<│     Pass     │         │   Trainer   │
│             │   1:N   │              │         │             │
│ - id        │         │ - id         │         │ - id        │
│ - email     │         │ - userId     │         │ - userId    │
│ - password  │         │ - type       │         │ - specialty │
│ - firstName │         │ - price      │         │ - bio       │
│ - lastName  │         │ - startDate  │         │ - rating    │
│ - role      │         │ - endDate    │         │             │
│ - createdAt │         │ - createdAt  │         │ - createdAt │
│ - updatedAt │         │ - updatedAt  │         └─────────────┘
└─────────────┘         └──────────────┘                │
       │                                                │
       │ 1:1                                            │ 1:N
       │                                                │
       │         ┌─────────────┐                       │
       └────────>│  Employee   │                       │
                 │             │                       │
                 │ - id        │                       │
                 │ - userId    │                       │
                 │ - position  │                       │
                 │ - department│                       │
                 │ - salary    │                       │
                 │ - hireDate  │                       │
                 │ - isActive  │                       │
                 │ - createdAt │                       │
                 │ - updatedAt │                       │
                 └─────────────┘                       │
                                                        │
       │ 1:N                                            │
       │                                                │
       │         ┌──────────────┐         ┌─────────────┐
       └────────>│   Booking    │<────────┼─  Session   │
                 │              │         │             │
                 │ - id         │         │ - id        │
                 │ - userId     │         │ - trainerId │
                 │ - sessionId  │         │ - date      │
                 │ - status     │         │ - startTime │
                 │ - createdAt  │         │ - endTime   │
                 │ - updatedAt  │         │ - maxSlots  │
                 └──────────────┘         │ - price     │
                                          │ - createdAt │
                                          │ - updatedAt │
                                          └─────────────┘
                                                 │
                                                 │ 1:N
                                                 │
                                          ┌─────────────┐
                                          │    Room     │
                                          │             │
                                          │ - id        │
                                          │ - name      │
                                          │ - capacity  │
                                          │ - equipment │
                                          │ - price     │
                                          │ - createdAt │
                                          │ - updatedAt │
                                          └─────────────┘
```

## Tabele i Encje

### 1. User (Użytkownik)
Główna tabela użytkowników - klienci, trenerzy, pracownicy.

| Pole | Typ | Opis | Wymagane |
|------|-----|------|----------|
| id | UUID | Unikalny identyfikator | Tak |
| email | String(255) | Email użytkownika (unikalny) | Tak |
| password | String(255) | Hasło (hash) | Tak |
| firstName | String(100) | Imię | Tak |
| lastName | String(100) | Nazwisko | Tak |
| role | Enum | Rola: CLIENT, TRAINER, EMPLOYEE, ADMIN | Tak |
| phone | String(20) | Numer telefonu | Nie |
| createdAt | DateTime | Data utworzenia | Tak |
| updatedAt | DateTime | Data aktualizacji | Tak |

**Relacje:**
- `1:N` z `Pass` (jeden użytkownik może mieć wiele karnetów)
- `1:N` z `Booking` (jeden użytkownik może mieć wiele rezerwacji)
- `1:1` z `Trainer` (jeśli rola = TRAINER)
- `1:1` z `Employee` (jeśli rola = EMPLOYEE)

### 2. Pass (Karnet)
Karnety zakupione przez klientów.

| Pole | Typ | Opis | Wymagane |
|------|-----|------|----------|
| id | UUID | Unikalny identyfikator | Tak |
| userId | UUID | ID użytkownika (FK) | Tak |
| type | Enum | Typ: MONTHLY, QUARTERLY, YEARLY, SINGLE | Tak |
| price | Decimal(10,2) | Cena karnetu | Tak |
| startDate | Date | Data rozpoczęcia | Tak |
| endDate | Date | Data zakończenia | Tak |
| isActive | Boolean | Czy karnet jest aktywny | Tak |
| createdAt | DateTime | Data utworzenia | Tak |
| updatedAt | DateTime | Data aktualizacji | Tak |

**Relacje:**
- `N:1` z `User` (wiele karnetów należy do jednego użytkownika)

### 3. Trainer (Trener Personalny)
Rozszerzenie użytkownika dla trenerów.

| Pole | Typ | Opis | Wymagane |
|------|-----|------|----------|
| id | UUID | Unikalny identyfikator | Tak |
| userId | UUID | ID użytkownika (FK, unikalny) | Tak |
| specialty | String(255) | Specjalizacja trenera | Nie |
| bio | Text | Opis/bio trenera | Nie |
| rating | Decimal(3,2) | Ocena trenera (0-5) | Nie |
| hourlyRate | Decimal(10,2) | Stawka godzinowa | Tak |
| createdAt | DateTime | Data utworzenia | Tak |
| updatedAt | DateTime | Data aktualizacji | Tak |

**Relacje:**
- `1:1` z `User` (jeden trener to jeden użytkownik)
- `1:N` z `Session` (jeden trener może mieć wiele sesji)

### 4. Employee (Pracownik)
Rozszerzenie użytkownika dla pracowników siłowni (recepcja, zarząd, konserwacja, etc.).

| Pole | Typ | Opis | Wymagane |
|------|-----|------|----------|
| id | UUID | Unikalny identyfikator | Tak |
| userId | UUID | ID użytkownika (FK, unikalny) | Tak |
| position | Enum | Stanowisko: RECEPTIONIST, MANAGER, CLEANER, MAINTENANCE, OTHER | Tak |
| department | String(255) | Dział | Nie |
| salary | Decimal(10,2) | Wynagrodzenie | Tak |
| hireDate | Date | Data zatrudnienia | Nie |
| isActive | Boolean | Czy pracownik jest aktywny | Tak |
| createdAt | DateTime | Data utworzenia | Tak |
| updatedAt | DateTime | Data aktualizacji | Tak |

**Relacje:**
- `1:1` z `User` (jeden pracownik to jeden użytkownik)

### 5. Session (Sesja/Termin)
Sesje z trenerem personalnym lub zajęcia grupowe.

| Pole | Typ | Opis | Wymagane |
|------|-----|------|----------|
| id | UUID | Unikalny identyfikator | Tak |
| trainerId | UUID | ID trenera (FK) | Tak |
| type | Enum | Typ: PERSONAL, GROUP | Tak |
| date | Date | Data sesji | Tak |
| startTime | Time | Godzina rozpoczęcia | Tak |
| endTime | Time | Godzina zakończenia | Tak |
| maxSlots | Integer | Maksymalna liczba miejsc | Tak |
| price | Decimal(10,2) | Cena za sesję | Tak |
| roomId | UUID | ID sali (FK) | Nie |
| createdAt | DateTime | Data utworzenia | Tak |
| updatedAt | DateTime | Data aktualizacji | Tak |

**Relacje:**
- `N:1` z `Trainer` (wiele sesji należy do jednego trenera)
- `N:1` z `Room` (wiele sesji może być w jednej sali)
- `1:N` z `Booking` (jedna sesja może mieć wiele rezerwacji)

### 6. Booking (Rezerwacja)
Rezerwacje sesji przez klientów.

| Pole | Typ | Opis | Wymagane |
|------|-----|------|----------|
| id | UUID | Unikalny identyfikator | Tak |
| userId | UUID | ID użytkownika (FK) | Tak |
| sessionId | UUID | ID sesji (FK) | Tak |
| status | Enum | Status: PENDING, CONFIRMED, CANCELLED, COMPLETED | Tak |
| notes | Text | Notatki klienta | Nie |
| createdAt | DateTime | Data utworzenia | Tak |
| updatedAt | DateTime | Data aktualizacji | Tak |

**Relacje:**
- `N:1` z `User` (wiele rezerwacji należy do jednego użytkownika)
- `N:1` z `Session` (wiele rezerwacji należy do jednej sesji)

### 7. Room (Sala)
Sale dostępne do wynajęcia.

| Pole | Typ | Opis | Wymagane |
|------|-----|------|----------|
| id | UUID | Unikalny identyfikator | Tak |
| name | String(100) | Nazwa sali | Tak |
| capacity | Integer | Pojemność sali | Tak |
| equipment | Text | Wyposażenie sali | Nie |
| price | Decimal(10,2) | Cena za godzinę | Tak |
| isAvailable | Boolean | Czy sala jest dostępna | Tak |
| createdAt | DateTime | Data utworzenia | Tak |
| updatedAt | DateTime | Data aktualizacji | Tak |

**Relacje:**
- `1:N` z `Session` (jedna sala może mieć wiele sesji)

## Typy Enum

### User.role
- `CLIENT` - Klient
- `TRAINER` - Trener personalny
- `EMPLOYEE` - Pracownik
- `ADMIN` - Administrator

### Pass.type
- `MONTHLY` - Miesięczny
- `QUARTERLY` - Kwartalny
- `YEARLY` - Roczny
- `SINGLE` - Jednorazowy

### Session.type
- `PERSONAL` - Zajęcia z trenerem personalnym
- `GROUP` - Zajęcia grupowe

### Booking.status
- `PENDING` - Oczekująca
- `CONFIRMED` - Potwierdzona
- `CANCELLED` - Anulowana
- `COMPLETED` - Zakończona

### Employee.position
- `RECEPTIONIST` - Recepcjonista
- `MANAGER` - Kierownik
- `CLEANER` - Sprzątacz
- `MAINTENANCE` - Konserwator
- `OTHER` - Inne

## Indeksy

- `User.email` - UNIQUE
- `User.role` - INDEX
- `Pass.userId` - INDEX
- `Pass.isActive` - INDEX
- `Trainer.userId` - UNIQUE
- `Employee.userId` - UNIQUE
- `Session.trainerId` - INDEX
- `Session.date` - INDEX
- `Booking.userId` - INDEX
- `Booking.sessionId` - INDEX
- `Booking.status` - INDEX

