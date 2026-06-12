# Podzial pracy w grupie

Ten plik dodalysmy, zeby bylo jasno widac, jak projekt zostal podzielony miedzy trzy osoby.

## Mariana Koliada

Rola: **Frontend Developer & UI/UX Designer**

Zadania:

- przygotowanie ukladu stron,
- stworzenie panelu klienta,
- stworzenie panelu instruktora,
- stworzenie panelu administratora,
- style CSS i responsywnosc,
- dopracowanie wygladu aplikacji.

Folder: `frontend/`

## Kateryna Hodyna

Rola: **Backend Developer**

Zadania:

- przygotowanie API w Java Spring Boot,
- logika rezerwacji,
- lista rezerwowa,
- kupowanie karnetow,
- symulacja platnosci,
- powiadomienia,
- logika dodawania opinii.

Folder: `backend/`

## Diana Broshko

Rola: **Database Administrator & QA**

Zadania:

- projekt bazy danych,
- przygotowanie schematu MySQL,
- opis relacji miedzy tabelami,
- testy funkcjonalne,
- sprawdzenie zgodnosci z wymaganiami.

Foldery: `database/`, `tests/`, `docs/`

## Jak razem laczy sie projekt

Frontend wysyla zapytania do backendu przez endpointy `/api/...`.
Backend zapisuje dane w bazie MySQL. Struktura bazy znajduje sie w `database/schema.sql`.
