# Panel Siłowni - System Zarządzania

System zarządzania siłownią umożliwiający klientom zakup karnetów, rezerwację zajęć z trenerem personalnym i wynajem sal, trenerom ustawienie dostępności, a pracownikom zarządzanie wszystkimi aspektami siłowni.

---

## 🚀 Quick Start

### Wymagania
- Docker & Docker Compose
- Git

### Instalacja i uruchomienie

1. **Sklonuj repozytorium**
```bash
git clone <repo-url>
cd Projekt_programowanie_aplikacji_webowych
```

2. **Skonfiguruj zmienne środowiskowe (opcjonalnie)**
```bash
cp .env.example .env
# Edytuj .env jeśli potrzebujesz zmienić domyślne wartości
```

3. **Uruchom aplikację**
```bash
docker compose up --build
```

4. **Dostęp do usług**
- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:3001/api
- **Swagger Docs**: http://localhost:3001/api/docs
- **Adminer (DB)**: http://localhost:8080
  - System: PostgreSQL
  - Serwer: `db`
  - Użytkownik: `gym_user` (lub z .env)
  - Hasło: `gym_password` (lub z .env)
  - Baza: `gym_db` (lub z .env)

### Pierwsze kroki

1. **Otwórz Frontend**: http://localhost:3002
   - Zostaniesz przekierowany na `/login`
   - Zarejestruj się lub użyj istniejącego konta

2. **Przetestuj API przez Swagger**: http://localhost:3001/api/docs
   - Kliknij "Authorize" i wklej token JWT po zalogowaniu

3. **Utwórz użytkownika przez API**:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }'
```

4. **Zaloguj się**:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Zatrzymanie
```bash
docker compose down
```

### Usunięcie danych (włącznie z bazą)
```bash
docker compose down -v
```

### Troubleshooting

**Port już zajęty?**
- Zmień porty w `docker-compose.yml` lub `.env`

**Błędy połączenia z bazą?**
- Poczekaj kilka sekund na uruchomienie PostgreSQL
- Sprawdź logi: `docker compose logs db`

**Błędy kompilacji?**
- Sprawdź czy wszystkie zależności są zainstalowane:
```bash
docker compose exec backend npm install
docker compose exec frontend npm install
```

---

## 📋 Technologie

### Backend
- **Node.js** + **NestJS** (TypeScript)
- **TypeORM** + **PostgreSQL**
- **JWT** (autoryzacja)
- **class-validator** (walidacja)
- **Swagger/OpenAPI** (dokumentacja API)

### Frontend
- **Vue 3** + **Vite** + **Vuetify**
- **Axios** (komunikacja z API)
- **Vee-Validate** + **Yup** (walidacja formularzy)
- **Vue Router** (routing z guards)
- **Pinia** (state management)

### Infrastruktura
- **Docker** + **docker-compose** (4 serwisy)
- **PostgreSQL** (baza danych)
- **Adminer** (narzędzie do zarządzania bazą)

---

## 🏗️ Struktura Projektu

```
.
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/        # Autoryzacja (JWT)
│   │   ├── users/       # Użytkownicy
│   │   ├── passes/      # Karnety
│   │   ├── trainers/    # Trenerzy
│   │   ├── employees/   # Pracownicy
│   │   ├── sessions/    # Sesje
│   │   ├── bookings/    # Rezerwacje
│   │   ├── rooms/       # Sale
│   │   └── common/      # Filtry, utils
│   └── package.json
├── frontend/             # Vue 3 + Vite + Vuetify
│   ├── src/
│   │   ├── views/       # Widoki (Home, Users, Passes, etc.)
│   │   ├── router/      # Routing + guards
│   │   ├── services/    # API service
│   │   └── composables/ # Composables (useToast)
│   └── package.json
├── docs/                 # Dokumentacja szczegółowa
├── docker-compose.yml
└── README.md
```

---

## 📁 Szczegółowy Spis Plików

### 📂 Główny katalog

| Plik | Opis |
|------|------|
| `README.md` | Główna dokumentacja projektu (z Quick Start) |
| `docker-compose.yml` | Konfiguracja Docker dla 4 serwisów (db, adminer, backend, frontend) |
| `.env.example` | Przykładowe zmienne środowiskowe |

### 📂 `backend/`

#### Główne pliki
| Plik | Opis |
|------|------|
| `package.json` | Zależności i skrypty backendu |
| `Dockerfile` | Obraz Docker dla NestJS |
| `tsconfig.json` | Konfiguracja TypeScript |
| `nest-cli.json` | Konfiguracja NestJS CLI |

#### `backend/src/`

| Plik | Opis |
|------|------|
| `main.ts` | Punkt wejścia aplikacji (CORS, walidacja, Swagger, exception filter) |
| `app.module.ts` | Główny moduł NestJS (importuje wszystkie moduły, globalny JwtAuthGuard) |
| `app.controller.ts` | Kontroler główny (`/health` endpoint) |
| `app.service.ts` | Serwis główny |

#### `backend/src/auth/` - Autoryzacja JWT
| Plik | Opis |
|------|------|
| `auth.module.ts` | Moduł autoryzacji (JWT, Passport) |
| `auth.service.ts` | Rejestracja, logowanie, generowanie tokenów JWT |
| `auth.controller.ts` | Endpointy: `/register`, `/login`, `/profile` |
| `dto/register.dto.ts` | DTO dla rejestracji |
| `dto/login.dto.ts` | DTO dla logowania |
| `guards/jwt-auth.guard.ts` | Guard chroniący endpointy (sprawdza token JWT) |
| `strategies/jwt.strategy.ts` | Strategia Passport dla JWT |
| `decorators/public.decorator.ts` | Dekorator `@Public()` dla publicznych endpointów |
| `decorators/current-user.decorator.ts` | Dekorator `@CurrentUser()` do pobierania użytkownika z requestu |

#### `backend/src/users/` - Użytkownicy
| Plik | Opis |
|------|------|
| `users.module.ts` | Moduł użytkowników |
| `users.service.ts` | Logika biznesowa (CRUD, paginacja) |
| `users.controller.ts` | Endpointy: `/users`, `/users/:id`, `/users/:id/passes`, `/users/:id/bookings` |
| `entities/user.entity.ts` | Encja User (TypeORM) |
| `dto/create-user.dto.ts` | DTO do tworzenia użytkownika |
| `dto/update-user.dto.ts` | DTO do aktualizacji użytkownika |

#### `backend/src/passes/` - Karnety
| Plik | Opis |
|------|------|
| `passes.module.ts` | Moduł karnetów |
| `passes.service.ts` | Logika biznesowa (CRUD, paginacja) |
| `passes.controller.ts` | Endpointy: `/passes` (GET, POST, PATCH, DELETE) |
| `entities/pass.entity.ts` | Encja Pass (TypeORM) |
| `dto/create-pass.dto.ts` | DTO do tworzenia karnetu |
| `dto/update-pass.dto.ts` | DTO do aktualizacji karnetu |

#### `backend/src/trainers/` - Trenerzy
| Plik | Opis |
|------|------|
| `trainers.module.ts` | Moduł trenerów |
| `trainers.service.ts` | Logika biznesowa (CRUD, paginacja) |
| `trainers.controller.ts` | Endpointy: `/trainers`, `/trainers/:id/sessions` |
| `entities/trainer.entity.ts` | Encja Trainer (TypeORM) |
| `dto/create-trainer.dto.ts` | DTO do tworzenia trenera |
| `dto/update-trainer.dto.ts` | DTO do aktualizacji trenera |

#### `backend/src/employees/` - Pracownicy
| Plik | Opis |
|------|------|
| `employees.module.ts` | Moduł pracowników |
| `employees.service.ts` | Logika biznesowa (CRUD, paginacja) |
| `employees.controller.ts` | Endpointy: `/employees` (GET, POST, PATCH, DELETE) |
| `entities/employee.entity.ts` | Encja Employee (TypeORM) |
| `dto/create-employee.dto.ts` | DTO do tworzenia pracownika |
| `dto/update-employee.dto.ts` | DTO do aktualizacji pracownika |

#### `backend/src/sessions/` - Sesje/Zajęcia
| Plik | Opis |
|------|------|
| `sessions.module.ts` | Moduł sesji |
| `sessions.service.ts` | Logika biznesowa (CRUD, paginacja) |
| `sessions.controller.ts` | Endpointy: `/sessions` (GET, POST, PATCH, DELETE) |
| `entities/session.entity.ts` | Encja Session (TypeORM) |
| `dto/create-session.dto.ts` | DTO do tworzenia sesji |
| `dto/update-session.dto.ts` | DTO do aktualizacji sesji |

#### `backend/src/bookings/` - Rezerwacje
| Plik | Opis |
|------|------|
| `bookings.module.ts` | Moduł rezerwacji |
| `bookings.service.ts` | Logika biznesowa (CRUD, paginacja) |
| `bookings.controller.ts` | Endpointy: `/bookings` (GET, POST, PATCH, DELETE) |
| `entities/booking.entity.ts` | Encja Booking (TypeORM) |
| `dto/create-booking.dto.ts` | DTO do tworzenia rezerwacji |
| `dto/update-booking.dto.ts` | DTO do aktualizacji rezerwacji |

#### `backend/src/rooms/` - Sale
| Plik | Opis |
|------|------|
| `rooms.module.ts` | Moduł sal |
| `rooms.service.ts` | Logika biznesowa (CRUD, paginacja) |
| `rooms.controller.ts` | Endpointy: `/rooms` (GET, POST, PATCH, DELETE) |
| `entities/room.entity.ts` | Encja Room (TypeORM) |
| `dto/create-room.dto.ts` | DTO do tworzenia sali |
| `dto/update-room.dto.ts` | DTO do aktualizacji sali |

#### `backend/src/common/` - Wspólne komponenty
| Plik | Opis |
|------|------|
| `filters/http-exception.filter.ts` | Globalny exception filter (spójny format błędów) |

#### `backend/src/database/` - Baza danych
| Plik | Opis |
|------|------|
| `database.module.ts` | Konfiguracja TypeORM z PostgreSQL |

### 📂 `frontend/`

#### Główne pliki
| Plik | Opis |
|------|------|
| `package.json` | Zależności i skrypty frontendu |
| `Dockerfile` | Obraz Docker dla Vue |
| `vite.config.js` | Konfiguracja Vite |
| `index.html` | Główny plik HTML |

#### `frontend/src/`

| Plik | Opis |
|------|------|
| `main.js` | Punkt wejścia aplikacji Vue (Vuetify, Router, Pinia) |
| `App.vue` | Główny komponent (nawigacja, snackbar dla toastów) |
| `style.css` | Globalne style CSS |

#### `frontend/src/views/` - Widoki
| Plik | Opis |
|------|------|
| `Home.vue` | Strona główna z kartami nawigacyjnymi |
| `Login.vue` | Formularz logowania (Vee-Validate + Yup) |
| `Users.vue` | Lista użytkowników z CRUD (tabela, dialogi, walidacja) |
| `Passes.vue` | Lista karnetów z CRUD (tabela, dialogi, walidacja) |
| `Bookings.vue` | Lista rezerwacji z CRUD (tabela, dialogi, walidacja) |
| `Employees.vue` | Lista pracowników z CRUD (tabela, dialogi, walidacja) |

#### `frontend/src/router/` - Routing
| Plik | Opis |
|------|------|
| `index.js` | Konfiguracja Vue Router (trasy, guards) |
| `guards.js` | Router guards (`requireAuth`, `requireGuest`) |

#### `frontend/src/services/` - Serwisy
| Plik | Opis |
|------|------|
| `api.js` | Instancja Axios z interceptors (dodawanie tokena, obsługa 401) |

#### `frontend/src/composables/` - Composables
| Plik | Opis |
|------|------|
| `useToast.js` | Composable do wyświetlania toast notifications (Vuetify snackbar) |

#### `frontend/src/plugins/` - Pluginy
| Plik | Opis |
|------|------|
| `vuetify.js` | Konfiguracja Vuetify (temat, komponenty) |

### 📂 `docs/` - Dokumentacja

| Plik | Opis |
|------|------|
| `MODEL_DANYCH.md` | Szczegółowy model danych z diagramem ERD i opisami 7 tabel |
| `API_CONTRACT.md` | Pełna dokumentacja wszystkich endpointów API (request/response, kody HTTP) |
| `UI_MOCKUPS.md` | Makiet interfejsu użytkownika dla głównych widoków |
| `DECISIONS.md` | Uzasadnienie decyzji projektowych (technologie, architektura) |

---

## 🗄️ Model Danych

System zawiera **7 tabel** z relacjami:

- **User** (1) — (N) **Pass** - Użytkownik może mieć wiele karnetów
- **User** (1) — (N) **Booking** - Użytkownik może mieć wiele rezerwacji
- **User** (1) — (1) **Trainer** - Użytkownik może być trenerem
- **User** (1) — (1) **Employee** - Użytkownik może być pracownikiem
- **Trainer** (1) — (N) **Session** - Trener prowadzi wiele sesji
- **Session** (1) — (N) **Booking** - Sesja może mieć wiele rezerwacji
- **Session** (N) — (1) **Room** - Sesja może być w sali

Szczegółowy opis: [docs/MODEL_DANYCH.md](./docs/MODEL_DANYCH.md)

---

## 🔌 API Endpoints

### Autoryzacja
- `POST /api/auth/register` - Rejestracja (publiczne)
- `POST /api/auth/login` - Logowanie (publiczne)

### Użytkownicy
- `GET /api/users` - Lista (paginacja, wymaga autoryzacji)
- `GET /api/users/:id` - Szczegóły
- `POST /api/users` - Utworzenie
- `PATCH /api/users/:id` - Aktualizacja
- `DELETE /api/users/:id` - Usunięcie
- `GET /api/users/:id/passes` - Karnety użytkownika
- `GET /api/users/:id/bookings` - Rezerwacje użytkownika

### Karnety, Rezerwacje, Trenerzy, Pracownicy, Sesje, Sale
- Pełny CRUD dla każdej encji (GET, POST, PATCH, DELETE)
- Wszystkie GET endpointy z paginacją (limit, offset, total, count)

**Pełna dokumentacja**: [docs/API_CONTRACT.md](./docs/API_CONTRACT.md)  
**Swagger UI**: http://localhost:3001/api/docs

---

## ✨ Funkcjonalności

### Backend
- ✅ **JWT Autoryzacja** - Wszystkie endpointy chronione (oprócz publicznych)
- ✅ **Walidacja** - class-validator w DTO
- ✅ **Exception Filter** - Spójny format błędów
- ✅ **Paginacja** - Wszystkie GET endpointy
- ✅ **Swagger** - Automatyczna dokumentacja API
- ✅ **Relacje** - TypeORM z relacjami między encjami

### Frontend
- ✅ **Autoryzacja** - Login, router guards, przechowywanie tokena
- ✅ **Walidacja formularzy** - Vee-Validate + Yup we wszystkich formularzach
- ✅ **Toast notifications** - Komunikaty sukcesu/błędu
- ✅ **CRUD** - Pełne operacje na wszystkich encjach
- ✅ **Responsywny design** - Vuetify Grid
- ✅ **Paginacja** - W tabelach danych

---

## 👥 User Stories

### Klient
- Jako klient mogę zarejestrować się w systemie
- Jako klient mogę kupić karnet
- Jako klient mogę zarezerwować zajęcia z trenerem personalnym
- Jako klient mogę wynająć salę
- Jako klient mogę zobaczyć moje rezerwacje

### Trener Personalny
- Jako trener mogę ustawić moją dostępność
- Jako trener mogę zobaczyć moje zajęcia
- Jako trener mogę potwierdzić/odwołać zajęcia

### Pracownik
- Jako pracownik mogę zarządzać klientami
- Jako pracownik mogę zarządzać trenerami
- Jako pracownik mogę zarządzać salami
- Jako pracownik mogę zarządzać karnetami
- Jako pracownik mogę zobaczyć wszystkie rezerwacje

---

## 🔧 Rozwój

### Backend (lokalnie)
```bash
cd backend
npm install
npm run start:dev
```

### Frontend (lokalnie)
```bash
cd frontend
npm install
npm run dev
```

### Testy
```bash
# Backend
cd backend
npm test

# Frontend (jeśli dodane)
cd frontend
npm test
```

---

## 📚 Dokumentacja

- [Model Danych](./docs/MODEL_DANYCH.md) - Diagram ERD i opisy tabel
- [API Contract](./docs/API_CONTRACT.md) - Pełna dokumentacja endpointów
- [UI Mockups](./docs/UI_MOCKUPS.md) - Makiet interfejsu
- [Decisions](./docs/DECISIONS.md) - Uzasadnienie decyzji projektowych

---

## 🔐 Autoryzacja

Wszystkie endpointy (oprócz `/api/auth/register`, `/api/auth/login`, `/api/health`) wymagają tokena JWT w nagłówku:

```
Authorization: Bearer <token>
```

Token otrzymujesz po zalogowaniu przez `/api/auth/login`.

---

## 📝 Git Workflow

- `main` - stabilna wersja, bez commitów "work in progress"
- `feature/*` - nowe funkcjonalności
- `fix/*` - poprawki błędów

Commity zgodne z [Conventional Commits](https://www.conventionalcommits.org/).

---

## 📊 Status Projektu

- **Ćwiczenie 5**: 100% ✅
- **Ćwiczenie 6**: 100% ✅
- **Ćwiczenie 7**: 80% ✅ (brak testów - opcjonalne)

**Ogólny postęp: ~95%** - Projekt gotowy do prezentacji!

---

## 🐛 Znane Problemy / TODO

- Testy jednostkowe (opcjonalnie)
- Role-based Access Control (opcjonalnie)
- Migracje TypeORM dla produkcji

---

## 📄 Licencja

MIT

---

## 👨‍💻 Autorzy

Projekt na potrzeby kursu Programowania Aplikacji Webowych.
