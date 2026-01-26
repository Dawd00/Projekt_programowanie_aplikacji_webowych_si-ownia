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

### Krok 1: JWT Guards
- [ ] Utworzenie JwtAuthGuard
- [ ] Utworzenie JwtStrategy
- [ ] Dodanie guards do endpointów
- [ ] Testowanie autoryzacji

### Krok 2: Exception Filter
- [ ] Utworzenie HttpExceptionFilter
- [ ] Formatowanie błędów walidacji
- [ ] Rejestracja globalnego filtra

### Krok 3: Walidacja Frontend
- [ ] Konfiguracja Vee-Validate
- [ ] Walidacja formularzy Users
- [ ] Walidacja formularzy Passes
- [ ] Komunikaty błędów

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

