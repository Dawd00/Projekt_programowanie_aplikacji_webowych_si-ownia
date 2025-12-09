# Szybki Start - Panel Siłowni

## Wymagania

- Docker & Docker Compose
- Git

## Instalacja i uruchomienie

### 1. Sklonuj repozytorium (jeśli jeszcze nie)

```bash
cd /Users/macdj/Desktop/Projekt_programowanie_aplikacji_webowych
```

### 2. Skonfiguruj zmienne środowiskowe

```bash
# Skopiuj przykładowy plik .env
cp .env.example .env

# Edytuj .env i ustaw odpowiednie wartości (opcjonalnie, domyślne działają)
```

### 3. Uruchom aplikację

```bash
docker compose up --build
```

To uruchomi:
- PostgreSQL (port 5432)
- Adminer (port 8080)
- Backend API (port 3001)
- Frontend (port 3000)

### 4. Dostęp do usług

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api/docs
- **Adminer (DB)**: http://localhost:8080
  - System: PostgreSQL
  - Serwer: db
  - Użytkownik: gym_user (lub z .env)
  - Hasło: gym_password (lub z .env)
  - Baza danych: gym_db (lub z .env)

## Pierwsze kroki

### 1. Sprawdź API przez Swagger

Otwórz http://localhost:3001/api/docs i przetestuj endpointy.

### 2. Utwórz pierwszego użytkownika

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

### 3. Zaloguj się

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### 4. Użyj tokena w kolejnych żądaniach

```bash
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Rozwój

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Zatrzymanie

```bash
docker compose down
```

## Usunięcie danych (włącznie z bazą)

```bash
docker compose down -v
```

## Troubleshooting

### Port już zajęty

Zmień porty w `docker-compose.yml` lub `.env`.

### Błędy połączenia z bazą

Poczekaj kilka sekund na uruchomienie PostgreSQL, sprawdź logi:
```bash
docker compose logs db
```

### Błędy kompilacji

Sprawdź czy wszystkie zależności są zainstalowane:
```bash
docker compose exec backend npm install
docker compose exec frontend npm install
```

