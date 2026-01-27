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
