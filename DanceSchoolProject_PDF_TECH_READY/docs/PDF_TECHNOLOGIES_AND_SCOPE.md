# Zakres projektu zgodny z plikiem projectzalgrup(1).pages

Ten projekt NIE jest oparty na projekcie ASP.NET MVC. Przykładowy projekt fitness został potraktowany wyłącznie jako inspiracja poziomu rozbudowania paneli.

## Technologia zgodna z opisem projektu

- Frontend: HTML, CSS, JavaScript
- Backend: Java / Spring Boot REST API
- Baza danych: MySQL
- Narzędzia: VS Code, GitHub, Figma, Postman

## Temat

Aplikacja do rezerwacji zajęć w szkole tańca.

## Role systemu

- Client / Klient: rejestracja, logowanie, edycja profilu, przegląd harmonogramu, rezerwacje, lista rezerwowa, karnety, płatności demo, opinie i powiadomienia.
- Trainer / Instruktor: rejestracja, logowanie, własny panel, tworzenie i edycja zajęć, lista uczestników, obecność.
- Admin / Administrator: jedno konto administracyjne dla zespołu, statystyki, raporty, zarządzanie grafikiem i wydarzeniami specjalnymi.

## Moduły zaimplementowane

1. Autoryzacja i profile użytkowników.
2. Interaktywny harmonogram z filtrowaniem po kategorii, poziomie i instruktorze.
3. Rezerwacje z kontrolą wolnych miejsc.
4. Lista rezerwowa i automatyczne przenoszenie klienta po anulowaniu miejsca.
5. Karnety ilościowe i open.
6. Symulacja płatności BLIK / PayU / karta.
7. Panel instruktora z zarządzaniem zajęciami i obecnością.
8. Panel administratora z raportami, statystykami i wydarzeniami specjalnymi.
9. Powiadomienia systemowe.
10. Opinie i oceny po zakończonych zajęciach.

## Uwaga dotycząca płatności i powiadomień

Integracja BLIK/PayU i wysyłka e-mail/SMS są w projekcie zrealizowane jako symulacja demonstracyjna. Jest to bezpieczne dla projektu zaliczeniowego, ponieważ nie wymaga prawdziwych kluczy płatniczych ani kont produkcyjnych.
