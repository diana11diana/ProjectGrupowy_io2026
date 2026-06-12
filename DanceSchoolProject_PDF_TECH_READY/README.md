# Pulse Studio — Aplikacja do rezerwacji zajęć w szkole tańca

Projekt zaliczeniowy wykonany zgodnie z opisem z pliku `projectzalgrup(1).pages`.

## Technologie

- Frontend: HTML, CSS, JavaScript
- Backend: Java Spring Boot REST API
- Baza danych: MySQL
- Narzędzia: VS Code, GitHub, Figma, Postman

To nie jest projekt ASP.NET MVC. Projekt fitness został użyty tylko jako przykład poziomu rozbudowania paneli, a nie jako baza technologiczna.

## Główne role

- Client — rezerwacje, karnety, płatności demo, lista rezerwowa, opinie, profil.
- Trainer — tworzenie zajęć, edycja zajęć, lista uczestników, obecność, profil.
- Admin — jedno konto zespołu projektowego, raporty, statystyki, wydarzenia specjalne, płatności.

## Uruchomienie

```bash
brew install maven mysql
brew services start mysql
mvn spring-boot:run
```

Adres aplikacji:

```text
http://localhost:4173
```

Jeżeli port 4173 jest zajęty:

```bash
kill -9 $(lsof -ti :4173)
mvn spring-boot:run
```

## Konta demo

- Klient: `diana@pulse.studio` / `client123`
- Trener: `olena@pulse.studio` / `trainer123`
- Administrator: `admin@pulse.studio` / `admin123`

## Dokumentacja

- `docs/PDF_TECHNOLOGIES_AND_SCOPE.md` — zgodność z PDF/pages.
- `docs/REQUIREMENTS-CHECKLIST.md` — lista wymagań.
- `docs/DIAGRAMS.md` — opis planowanych diagramów UML.
- `database/schema.sql` — struktura MySQL.
