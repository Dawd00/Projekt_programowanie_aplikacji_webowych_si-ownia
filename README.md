# Panel Siłowni - System Zarządzania

## Opis Projektu

System zarządzania siłownią umożliwiający:
- **Klientom**: zakup karnetów, rezerwację zajęć z trenerem personalnym, wynajem sal
- **Trenerom personalnym**: ustawienie dostępności, zarządzanie zajęciami
- **Pracownikom**: zarządzanie wszystkimi aspektami siłowni
- **Zajęcia grupowe**: rezerwacja i zarządzanie

## Technologie

### Backend
- **Node.js** + **NestJS** (TypeScript)
- **TypeORM** + **PostgreSQL**
- **class-validator** (walidacja)
- **Swagger/OpenAPI** (dokumentacja API)

### Frontend
- **Vue 3** + **Vite** + **Vuetify**
- **Axios** (komunikacja z API)
- **Vee-Validate** (walidacja formularzy)

### Infrastruktura
- **Docker** + **docker-compose**
- **PostgreSQL** (baza danych)
- **Adminer** (narzędzie do zarządzania bazą)

## Struktura Projektu

```
.
├── backend/          # NestJS API
├── frontend/         # Vue + Vite + Vuetify
├── docker-compose.yml
├── .env.example
└── README.md
```

## Uruchomienie

### Wymagania
- Docker & Docker Compose
- Git

### Kroki

1. **Sklonuj repozytorium**
```bash
git clone <repo-url>
cd Projekt_programowanie_aplikacji_webowych
```

2. **Skonfiguruj zmienne środowiskowe**
```bash
cp .env.example .env
# Edytuj .env i ustaw odpowiednie wartości
```

3. **Uruchom aplikację**
```bash
docker compose up --build
```

4. **Dostęp do usług**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs (Swagger): http://localhost:3001/api/docs
- Adminer (DB): http://localhost:8080

## Model Danych

Zobacz [MODEL_DANYCH.md](./docs/MODEL_DANYCH.md) dla szczegółowego opisu modelu danych.

## API Endpoints

Zobacz [API_CONTRACT.md](./docs/API_CONTRACT.md) dla pełnej dokumentacji API.

## User Stories

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

## Git Workflow

- `main` - stabilna wersja, bez commitów "work in progress"
- `feature/*` - nowe funkcjonalności
- `fix/*` - poprawki błędów


