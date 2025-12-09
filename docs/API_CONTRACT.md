# Kontrakt API - Panel Siłowni

## Base URL
```
http://localhost:3001/api
```

## Autoryzacja
Wszystkie endpointy (oprócz rejestracji/logowania) wymagają nagłówka:
```
Authorization: Bearer <API_KEY>
```

## Format Odpowiedzi

### Sukces
```json
{
  "data": { ... },
  "message": "Success"
}
```

### Błąd
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email must be a valid email"
    }
  ]
}
```

### Paginacja
```json
{
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "count": 20,
    "offset": 0,
    "limit": 20
  }
}
```

## Endpointy

### 1. Autoryzacja

#### POST /auth/register
Rejestracja nowego użytkownika.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "role": "CLIENT",
  "phone": "+48123456789"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "role": "CLIENT"
  },
  "message": "User registered successfully"
}
```

#### POST /auth/login
Logowanie użytkownika.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "CLIENT"
    }
  }
}
```

---

### 2. Użytkownicy (Users)

#### GET /users
Lista użytkowników z paginacją.

**Query Parameters:**
- `limit` (number, default: 20, max: 100) - Liczba wyników
- `offset` (number, default: 0) - Przesunięcie
- `role` (string, optional) - Filtrowanie po roli

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Jan",
      "lastName": "Kowalski",
      "role": "CLIENT",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "count": 20,
    "offset": 0,
    "limit": 20
  }
}
```

#### GET /users/:id
Szczegóły użytkownika.

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "role": "CLIENT",
    "phone": "+48123456789",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /users/:id
Aktualizacja użytkownika.

**Request Body:**
```json
{
  "firstName": "Jan",
  "lastName": "Nowak",
  "phone": "+48123456789"
}
```

**Response:** `200 OK`

#### DELETE /users/:id
Usunięcie użytkownika.

**Response:** `200 OK`

---

### 3. Karnety (Passes)

#### POST /passes
Utworzenie nowego karnetu.

**Request Body:**
```json
{
  "userId": "uuid",
  "type": "MONTHLY",
  "price": 150.00,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Response:** `201 Created`

#### GET /passes
Lista karnetów z paginacją.

**Query Parameters:**
- `limit` (number, default: 20)
- `offset` (number, default: 0)
- `userId` (uuid, optional) - Filtrowanie po użytkowniku
- `isActive` (boolean, optional) - Filtrowanie aktywnych

**Response:** `200 OK`

#### GET /passes/:id
Szczegóły karnetu.

**Response:** `200 OK`

#### PUT /passes/:id
Aktualizacja karnetu.

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:** `200 OK`

#### DELETE /passes/:id
Usunięcie karnetu.

**Response:** `200 OK`

#### GET /users/:id/passes
Karnety użytkownika.

**Response:** `200 OK`

---

### 4. Trenerzy (Trainers)

#### POST /trainers
Utworzenie profilu trenera.

**Request Body:**
```json
{
  "userId": "uuid",
  "specialty": "Siłownia, Crossfit",
  "bio": "Doświadczony trener...",
  "hourlyRate": 100.00
}
```

**Response:** `201 Created`

#### GET /trainers
Lista trenerów z paginacją.

**Query Parameters:**
- `limit` (number, default: 20)
- `offset` (number, default: 0)

**Response:** `200 OK`

#### GET /trainers/:id
Szczegóły trenera.

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "user": {
      "firstName": "Anna",
      "lastName": "Nowak"
    },
    "specialty": "Siłownia",
    "bio": "...",
    "rating": 4.5,
    "hourlyRate": 100.00
  }
}
```

#### PUT /trainers/:id
Aktualizacja trenera.

**Response:** `200 OK`

#### DELETE /trainers/:id
Usunięcie trenera.

**Response:** `200 OK`

---

### 5. Sesje (Sessions)

#### POST /sessions
Utworzenie nowej sesji.

**Request Body:**
```json
{
  "trainerId": "uuid",
  "type": "PERSONAL",
  "date": "2024-01-15",
  "startTime": "10:00",
  "endTime": "11:00",
  "maxSlots": 1,
  "price": 100.00,
  "roomId": "uuid"
}
```

**Response:** `201 Created`

#### GET /sessions
Lista sesji z paginacją.

**Query Parameters:**
- `limit` (number, default: 20)
- `offset` (number, default: 0)
- `trainerId` (uuid, optional)
- `type` (string, optional) - PERSONAL lub GROUP
- `date` (date, optional) - Filtrowanie po dacie

**Response:** `200 OK`

#### GET /sessions/:id
Szczegóły sesji.

**Response:** `200 OK`

#### PUT /sessions/:id
Aktualizacja sesji.

**Response:** `200 OK`

#### DELETE /sessions/:id
Usunięcie sesji.

**Response:** `200 OK`

#### GET /trainers/:id/sessions
Sesje trenera.

**Response:** `200 OK`

---

### 6. Rezerwacje (Bookings)

#### POST /bookings
Utworzenie rezerwacji.

**Request Body:**
```json
{
  "userId": "uuid",
  "sessionId": "uuid",
  "notes": "Proszę o przygotowanie..."
}
```

**Response:** `201 Created`

#### GET /bookings
Lista rezerwacji z paginacją.

**Query Parameters:**
- `limit` (number, default: 20)
- `offset` (number, default: 0)
- `userId` (uuid, optional)
- `sessionId` (uuid, optional)
- `status` (string, optional)

**Response:** `200 OK`

#### GET /bookings/:id
Szczegóły rezerwacji.

**Response:** `200 OK`

#### PUT /bookings/:id
Aktualizacja rezerwacji (np. zmiana statusu).

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Response:** `200 OK`

#### DELETE /bookings/:id
Anulowanie rezerwacji.

**Response:** `200 OK`

#### GET /users/:id/bookings
Rezerwacje użytkownika.

**Response:** `200 OK`

---

### 7. Sale (Rooms)

#### POST /rooms
Utworzenie nowej sali.

**Request Body:**
```json
{
  "name": "Sala A",
  "capacity": 20,
  "equipment": "Maszyny, hantle, ławki",
  "price": 50.00,
  "isAvailable": true
}
```

**Response:** `201 Created`

#### GET /rooms
Lista sal z paginacją.

**Query Parameters:**
- `limit` (number, default: 20)
- `offset` (number, default: 0)
- `isAvailable` (boolean, optional)

**Response:** `200 OK`

#### GET /rooms/:id
Szczegóły sali.

**Response:** `200 OK`

#### PUT /rooms/:id
Aktualizacja sali.

**Response:** `200 OK`

#### DELETE /rooms/:id
Usunięcie sali.

**Response:** `200 OK`

---

### 8. Pracownicy (Employees)

#### POST /employees
Utworzenie profilu pracownika.

**Request Body:**
```json
{
  "userId": "uuid",
  "position": "RECEPTIONIST",
  "department": "Recepcja",
  "salary": 5000.00,
  "hireDate": "2024-01-01",
  "isActive": true
}
```

**Response:** `201 Created`

#### GET /employees
Lista pracowników z paginacją.

**Query Parameters:**
- `limit` (number, default: 20)
- `offset` (number, default: 0)
- `position` (string, optional) - Filtrowanie po stanowisku
- `isActive` (boolean, optional) - Filtrowanie aktywnych

**Response:** `200 OK`

#### GET /employees/:id
Szczegóły pracownika.

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "user": {
      "firstName": "Jan",
      "lastName": "Kowalski"
    },
    "position": "RECEPTIONIST",
    "department": "Recepcja",
    "salary": 5000.00,
    "hireDate": "2024-01-01",
    "isActive": true
  }
}
```

#### PUT /employees/:id
Aktualizacja pracownika.

**Response:** `200 OK`

#### DELETE /employees/:id
Usunięcie pracownika.

**Response:** `200 OK`

---

## Kody HTTP

- `200 OK` - Sukces
- `201 Created` - Utworzono
- `400 Bad Request` - Błąd walidacji
- `401 Unauthorized` - Brak autoryzacji
- `403 Forbidden` - Brak uprawnień
- `404 Not Found` - Nie znaleziono
- `500 Internal Server Error` - Błąd serwera

## Walidacja

Wszystkie pola wymagane są walidowane:
- Email: format email
- Password: min. 8 znaków
- Dates: format ISO 8601 (YYYY-MM-DD)
- Times: format HH:mm
- Prices: liczba dziesiętna (2 miejsca po przecinku)
- UUID: format UUID v4

