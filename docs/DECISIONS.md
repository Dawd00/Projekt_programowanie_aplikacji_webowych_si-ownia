# Uzasadnienie Decyzji Projektowych

## Dlaczego te technologie?

### Backend: NestJS zamiast Express/Next.js

**NestJS wybrano, ponieważ:**
- ✅ **Modularność** - Wbudowana architektura modułowa (podobna do Angular), co ułatwia organizację kodu
- ✅ **TypeScript out-of-the-box** - Pełne wsparcie TypeScript bez dodatkowej konfiguracji
- ✅ **Decoratory i Dependency Injection** - Czytelniejszy kod, łatwiejsze testowanie
- ✅ **Walidacja wbudowana** - Integracja z class-validator i class-transformer
- ✅ **Swagger automatyczny** - Generowanie dokumentacji API z dekoratorów
- ✅ **Wymagania kursu** - Wymienione jako preferowane w wymaganiach

**Alternatywy odrzucone:**
- ❌ Express - Zbyt niskopoziomowy, wymaga więcej boilerplate
- ❌ Next.js - Głównie do SSR, nie potrzebujemy tego w API
- ❌ Fastify - Szybszy, ale mniej funkcji out-of-the-box

### ORM: TypeORM zamiast Prisma/Mongoose

**TypeORM wybrano, ponieważ:**
- ✅ **Dobra integracja z NestJS** - Oficjalne wsparcie przez @nestjs/typeorm
- ✅ **Active Record + Data Mapper** - Elastyczne podejście do modeli
- ✅ **Migrations** - Wbudowany system migracji (wymagany w zadaniu)
- ✅ **Relacje** - Łatwe definiowanie relacji między encjami
- ✅ **TypeScript native** - Pełne wsparcie typów

**Alternatywy odrzucone:**
- ❌ Prisma - Nowoczesny, ale mniej integracji z NestJS, inny sposób pracy
- ❌ Mongoose - Tylko dla MongoDB, a wybraliśmy PostgreSQL
- ❌ Sequelize - Starszy, mniej TypeScript-friendly

### Baza danych: PostgreSQL zamiast MySQL/MongoDB

**PostgreSQL wybrano, ponieważ:**
- ✅ **Relacyjność** - Mamy wyraźne relacje (User-Pass, User-Booking, Trainer-Session)
- ✅ **ACID** - Transakcje są ważne dla karnetów i rezerwacji
- ✅ **Zaawansowane typy** - Enum, JSON, array - przydatne dla ról, statusów
- ✅ **Wymagania kursu** - PostgreSQL/MySQL/MongoDB do wyboru, SQL jest bardziej standardowy
- ✅ **TypeORM + PostgreSQL** - Doskonała integracja

**Alternatywy odrzucone:**
- ❌ MongoDB - Brak relacji, trudniejsze zapytania JOIN, mniej odpowiednie dla tego przypadku
- ❌ MySQL - Podobny do PostgreSQL, ale PostgreSQL ma lepsze wsparcie dla zaawansowanych typów

### Frontend: Vue 3 zamiast React/Next.js

**Vue 3 wybrano, ponieważ:**
- ✅ **Wymagania kursu** - Expressie wymienione: "Vue + Vite + Vuetify" lub React
- ✅ **Vuetify** - Gotowe komponenty Material Design, szybki rozwój UI
- ✅ **Prostsza składnia** - Template-based, łatwiejsze dla początkujących
- ✅ **Vite** - Szybki bundler, lepszy DX niż Webpack
- ✅ **Composition API** - Nowoczesne podejście do logiki komponentów

**Alternatywy odrzucone:**
- ❌ React - Wymagałby więcej konfiguracji, wyboru bibliotek UI (Material-UI, Bootstrap)
- ❌ Next.js - Overkill dla prostego CRUD, SSR nie jest potrzebny

## Dlaczego taka struktura modułów?

### Moduły w NestJS (feature-based)

```
users/
  ├── users.module.ts
  ├── users.controller.ts
  ├── users.service.ts
  ├── dto/
  └── entities/
```

**Uzasadnienie:**
- ✅ **Separation of Concerns** - Każdy moduł odpowiada za jedną funkcjonalność
- ✅ **Skalowalność** - Łatwo dodać nowe moduły bez zmiany istniejących
- ✅ **Testowanie** - Można testować moduły niezależnie
- ✅ **Wzorzec NestJS** - Standardowa konwencja frameworka

### Relacje w bazie danych

**User (1) — (N) Pass**
- Jeden użytkownik może mieć wiele karnetów (historia)
- Karnet należy do jednego użytkownika

**User (1) — (N) Booking**
- Jeden użytkownik może mieć wiele rezerwacji
- Rezerwacja należy do jednego użytkownika

**User (1) — (1) Trainer**
- Nie każdy użytkownik jest trenerem
- Trener to rozszerzenie użytkownika (dodatkowe pola: specialty, hourlyRate)
- Relacja 1:1 zamiast dziedziczenia (prostsze w SQL)

**Trainer (1) — (N) Session**
- Jeden trener prowadzi wiele sesji
- Sesja ma jednego trenera

**Session (1) — (N) Booking**
- Jedna sesja może mieć wiele rezerwacji (zajęcia grupowe)
- Rezerwacja dotyczy jednej sesji

**Session (N) — (1) Room**
- Sesja może być w sali (opcjonalnie - może być na zewnątrz)
- Sala może mieć wiele sesji

## Dlaczego takie endpointy API?

### Struktura RESTful

```
GET    /users          - Lista (z paginacją)
GET    /users/:id      - Szczegóły
POST   /users          - Utworzenie
PATCH  /users/:id      - Aktualizacja (częściowa)
DELETE /users/:id      - Usunięcie
GET    /users/:id/passes    - Zagnieżdżone (karnety użytkownika)
GET    /users/:id/bookings  - Zagnieżdżone (rezerwacje użytkownika)
```

**Uzasadnienie:**
- ✅ **RESTful conventions** - Standardowe podejście, łatwe do zrozumienia
- ✅ **Paginacja** - Wymagana w zadaniu (limit, offset, total, count)
- ✅ **Zagnieżdżone endpointy** - Logiczne grupowanie (np. karnety użytkownika)
- ✅ **HTTP metody** - Semantycznie poprawne (GET nie modyfikuje, POST tworzy)

### Paginacja: limit/offset zamiast page/size

**Wybrano limit/offset, ponieważ:**
- ✅ **Elastyczność** - Łatwiej przeskakiwać między stronami
- ✅ **SQL-friendly** - Bezpośrednie mapowanie na `LIMIT` i `OFFSET`
- ✅ **Wymagania** - Expressie wymienione w zadaniu

**Alternatywa (page/size):**
- ❌ Wymaga obliczania offset = (page - 1) * size
- ❌ Mniej elastyczne dla zaawansowanych zapytań

## Dlaczego DTO (Data Transfer Objects)?

**DTO wybrano, ponieważ:**
- ✅ **Walidacja** - class-validator sprawdza dane przed dotarciem do serwisu
- ✅ **Type Safety** - TypeScript sprawdza typy w compile-time
- ✅ **Dokumentacja** - Swagger automatycznie generuje dokumentację z DTO
- ✅ **Separacja** - Różne DTO dla create/update (UpdateDto extends Partial<CreateDto>)
- ✅ **Bezpieczeństwo** - Można ukryć wrażliwe pola (np. password w odpowiedzi)

**Przykład:**
```typescript
// CreateUserDto - wszystkie pola wymagane
// UpdateUserDto - wszystkie pola opcjonalne (PartialType)
```

## Dlaczego Docker Compose?

**Docker Compose wybrano, ponieważ:**
- ✅ **Izolacja** - Każdy serwis w osobnym kontenerze
- ✅ **Łatwe uruchomienie** - Jeden command: `docker compose up`
- ✅ **Reprodukowalność** - Działa tak samo na każdym środowisku
- ✅ **Wymagania** - Expressie wymagane w zadaniu (min. 3 serwisy)
- ✅ **Development** - Hot reload przez volume mounts

**Struktura serwisów:**
- `db` - PostgreSQL (baza danych)
- `backend` - NestJS API
- `frontend` - Vue app
- `adminer` - Narzędzie do zarządzania DB (opcjonalne, ale przydatne)

## Dlaczego Swagger/OpenAPI?

**Swagger wybrano, ponieważ:**
- ✅ **Automatyczna dokumentacja** - Generowana z dekoratorów NestJS
- ✅ **Testowanie API** - Można testować endpointy bezpośrednio w przeglądarce
- ✅ **Wymagania** - Expressie wymagane w zadaniu (`/api/docs`)
- ✅ **Kontrakt API** - Służy jako dokumentacja dla frontendu

## Dlaczego Vuetify zamiast Bootstrap/Material-UI?

**Vuetify wybrano, ponieważ:**
- ✅ **Wymagania kursu** - Expressie wymienione: "Jeśli Vue → Vuetify"
- ✅ **Komponenty gotowe** - v-data-table, v-form, v-dialog - wszystko gotowe
- ✅ **Material Design** - Spójny, nowoczesny wygląd
- ✅ **TypeScript support** - Pełne wsparcie typów
- ✅ **Responsywność** - Wbudowana, działa out-of-the-box

## Podsumowanie

Wszystkie decyzje były podyktowane:
1. **Wymaganiami kursu** - Gdzie były wyraźne preferencje
2. **Best practices** - Sprawdzone wzorce w branży
3. **Praktycznością** - Co działa najlepiej razem (NestJS + TypeORM, Vue + Vuetify)
4. **Skalowalnością** - Architektura, która rośnie z projektem
5. **TypeScript** - Wszędzie gdzie możliwe dla type safety

## Co można zmienić?

- **Prisma zamiast TypeORM** - Jeśli preferujesz Prisma (migracje, lepsze typy)
- **React zamiast Vue** - Jeśli lepiej znasz React
- **MongoDB zamiast PostgreSQL** - Jeśli potrzebujesz NoSQL (ale relacje są ważne!)
- **JWT Guards** - Dodać autoryzację (obecnie tylko podstawowa struktura)

Wszystkie te zmiany są możliwe bez przebudowy całej architektury!

