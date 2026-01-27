# Dane dostępowe do aplikacji

Wszystkie konta użytkowników utworzonych przez seed mają **to samo hasło**: `password123`

## 📋 Lista kont użytkowników

### 👑 Administrator
- **Email:** `admin@gym.pl`
- **Hasło:** `password123`
- **Imię i nazwisko:** Jan Kowalski
- **Rola:** ADMIN
- **Uprawnienia:** Pełny dostęp do wszystkich funkcji systemu

### 👥 Klienci

#### Klient 1
- **Email:** `klient1@gym.pl`
- **Hasło:** `password123`
- **Imię i nazwisko:** Anna Nowak
- **Rola:** CLIENT
- **Karnety:** Ma aktywny karnet miesięczny i kwartalny

#### Klient 2
- **Email:** `klient2@gym.pl`
- **Hasło:** `password123`
- **Imię i nazwisko:** Piotr Wiśniewski
- **Rola:** CLIENT
- **Karnety:** Ma aktywny karnet roczny

#### Klient 3
- **Email:** `klient3@gym.pl`
- **Hasło:** `password123`
- **Imię i nazwisko:** Maria Dąbrowska
- **Rola:** CLIENT
- **Karnety:** Ma aktywny karnet jednorazowy

### 💪 Trenerzy

#### Trener 1
- **Email:** `trener1@gym.pl`
- **Hasło:** `password123`
- **Imię i nazwisko:** Michał Lewandowski
- **Rola:** TRAINER
- **Specjalizacja:** Trening siłowy
- **Ocena:** 4.8/5
- **Stawka godzinowa:** 150 PLN

#### Trener 2
- **Email:** `trener2@gym.pl`
- **Hasło:** `password123`
- **Imię i nazwisko:** Katarzyna Wójcik
- **Rola:** TRAINER
- **Specjalizacja:** Trening funkcjonalny
- **Ocena:** 4.9/5
- **Stawka godzinowa:** 140 PLN

### 👔 Pracownicy

#### Pracownik 1
- **Email:** `pracownik1@gym.pl`
- **Hasło:** `password123`
- **Imię i nazwisko:** Tomasz Kamiński
- **Rola:** EMPLOYEE
- **Stanowisko:** Manager
- **Dział:** Zarządzanie

## 🔐 Jak się zalogować

### Przez interfejs webowy (Frontend)
1. Otwórz aplikację frontendową: `http://localhost:3002` (lub port skonfigurowany w docker-compose)
2. Przejdź do strony logowania: `/login`
3. Wprowadź email i hasło jednego z kont powyżej
4. Kliknij "Zaloguj"

### Przez API (curl/Postman)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gym.pl",
    "password": "password123"
  }'
```

Odpowiedź zawiera token JWT, który należy używać w nagłówku `Authorization: Bearer <token>` dla chronionych endpointów.

## 📝 Uwagi

- Wszystkie hasła są hashowane w bazie danych (bcrypt)
- Token JWT jest ważny przez 24 godziny (domyślnie)
- Po zalogowaniu token jest przechowywany w `localStorage` przeglądarki
- Wylogowanie usuwa token z `localStorage`

## 🧪 Testowanie różnych profili

Aby przetestować różne role użytkowników:
1. Zaloguj się jako jeden użytkownik
2. Przetestuj dostępne funkcje
3. Wyloguj się
4. Zaloguj się jako inny użytkownik z inną rolą
5. Porównaj dostępne funkcje i uprawnienia

