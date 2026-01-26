# Następne Kroki - Ćwiczenie 6-7

## Branch: `feature/jwt-auth`

### Co będziemy implementować:

1. **JWT Guards** - Autoryzacja endpointów
   - Guard dla chronionych endpointów
   - Dekorator `@UseGuards(JwtAuthGuard)`
   - Sprawdzanie tokena w nagłówku Authorization

2. **Global Exception Filter** - Spójny format błędów
   - Własny ExceptionFilter
   - Formatowanie błędów walidacji
   - Kody HTTP 4xx z jasnymi komunikatami

3. **Walidacja Frontend** - Vee-Validate
   - Pełna walidacja formularzy
   - Komunikaty błędów
   - Walidacja przed wysłaniem

4. **Testy jednostkowe** (opcjonalnie)
   - Testy serwisów
   - Testy kontrolerów

## Plan pracy:

### Krok 1: JWT Guards ✅
- [x] Utworzenie JwtAuthGuard
- [x] Utworzenie JwtStrategy
- [x] Dodanie guards do endpointów (globalny guard)
- [x] Dekorator @Public() dla publicznych endpointów
- [x] Dekorator @CurrentUser() do pobierania użytkownika

### Krok 2: Exception Filter ✅
- [x] Utworzenie HttpExceptionFilter
- [x] Formatowanie błędów walidacji
- [x] Rejestracja globalnego filtra
- [x] Spójny format odpowiedzi błędów

### Krok 3: Walidacja Frontend ✅
- [x] Konfiguracja Vee-Validate
- [x] Walidacja formularzy Users
- [x] Schema walidacji z Yup
- [x] Komunikaty błędów po polsku

### Krok 4: Testy (opcjonalnie)
- [ ] Testy AuthService
- [ ] Testy UsersService
- [ ] Testy kontrolerów

## Commity:

Będziemy commituć małe, opisowe zmiany:
- `feat: dodanie JWT guards`
- `feat: global exception filter`
- `feat: walidacja formularzy z Vee-Validate`
- `test: testy jednostkowe dla AuthService`

## Po zakończeniu:

```bash
git checkout main
git merge feature/jwt-auth
git push origin main
```

