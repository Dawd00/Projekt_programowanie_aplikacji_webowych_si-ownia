# TODO - Co jeszcze do zrobienia

## ✅ ZROBIONE

### Ćwiczenie 5
- ✅ Dokumentacja (README, API contract, model danych)
- ✅ Docker setup (4 serwisy)
- ✅ Backend - wszystkie moduły z CRUD
- ✅ Frontend - podstawowe widoki
- ✅ Git workflow

### Ćwiczenie 6-7 (wysoki priorytet - ZROBIONE)
- ✅ JWT Guards - autoryzacja endpointów
- ✅ Global Exception Filter - spójny format błędów
- ✅ Walidacja Frontend - Vee-Validate we wszystkich formularzach (Users, Passes, Bookings, Employees)
- ✅ Toast notifications - Vuetify snackbar
- ✅ Autoryzacja Frontend - token, router guards, login/logout

---

## ⚠️ DO ZROBIENIA

### 1. Walidacja Frontend - pozostałe formularze ✅
- [x] **Passes.vue** - walidacja formularza karnetów
- [x] **Bookings.vue** - walidacja formularza rezerwacji
- [x] **Employees.vue** - walidacja formularza pracowników

### 2. Obsługa błędów w Frontend ✅
- [x] **Toast notifications** - wyświetlanie komunikatów sukcesu/błędu
- [x] **Obsługa błędów API** - wyświetlanie błędów z backendu
- [ ] **Loading states** - lepsze wskaźniki ładowania (częściowo - v-data-table ma loading)
- [x] **Error handling** - obsługa 401, 403, 404, 500 (w interceptors)

### 3. Autoryzacja Frontend ✅
- [x] **Przechowywanie tokena** - localStorage/sessionStorage
- [x] **Router guards** - ochrona tras wymagających logowania
- [x] **Automatyczne przekierowanie** - na login przy 401
- [x] **Logout** - czyszczenie tokena

### 4. Role-based Access Control (opcjonalnie)
- [ ] **Role guards** - @Roles() decorator
- [ ] **Sprawdzanie ról** - w frontendzie i backendzie
- [ ] **Ukrywanie elementów** - w zależności od roli

### 5. Testy (opcjonalnie, ale zalecane)
- [ ] **Testy jednostkowe Backend**
  - [ ] AuthService.spec.ts
  - [ ] UsersService.spec.ts
  - [ ] PassesService.spec.ts
- [ ] **Testy kontrolerów**
  - [ ] AuthController.spec.ts
  - [ ] UsersController.spec.ts
- [ ] **Testy E2E** (opcjonalnie)

### 6. Migracje TypeORM (dla produkcji)
- [ ] **Wyłączenie synchronize** - w produkcji
- [ ] **Migracje** - utworzenie migracji dla wszystkich tabel
- [ ] **Seed data** - dane testowe

### 7. Ulepszenia UX/UI
- [ ] **Toast notifications** - Vuetify snackbar
- [ ] **Confirm dialogs** - potwierdzenie przed usunięciem
- [ ] **Form validation feedback** - lepsze komunikaty
- [ ] **Loading spinners** - podczas ładowania danych

### 8. Dokumentacja
- [ ] **Aktualizacja README** - z nowymi funkcjonalnościami
- [ ] **Przykłady użycia** - jak używać JWT, jak testować
- [ ] **Changelog** - lista zmian

---

## 🎯 PRIORYTETY

### Wysoki priorytet (dla ćwiczenia 6-7):
1. ✅ JWT Guards - **ZROBIONE**
2. ✅ Exception Filter - **ZROBIONE**
3. ✅ Walidacja Users.vue - **ZROBIONE**
4. ⚠️ Walidacja pozostałych formularzy (Passes, Bookings, Employees)
5. ⚠️ Obsługa błędów w Frontend (toast notifications)
6. ⚠️ Autoryzacja Frontend (przechowywanie tokena, router guards)

### Średni priorytet:
7. Testy jednostkowe
8. Role-based Access Control
9. Ulepszenia UX/UI

### Niski priorytet (na później):
10. Migracje TypeORM
11. Testy E2E
12. Dokumentacja rozszerzona

---

## 📝 Notatki

- Wszystkie endpointy są już chronione globalnym guardem
- Publiczne endpointy: `/api/auth/register`, `/api/auth/login`, `/api/health`
- Frontend używa Axios z interceptors (gotowe do dodania tokena)
- Vee-Validate i Yup są już zainstalowane

---

## 🚀 Następne kroki

1. **Dokończyć walidację formularzy** - Passes, Bookings, Employees
2. **Dodać toast notifications** - Vuetify snackbar
3. **Dodać autoryzację frontend** - przechowywanie tokena, router guards
4. **Opcjonalnie: testy jednostkowe**

