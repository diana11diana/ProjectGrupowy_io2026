# Database - czesc Diany

W katalogu `database` znajduje sie projekt bazy danych MySQL. Plik `schema.sql` opisuje tabele uzywane przez backend Java Spring Boot.

Najwazniejsze tabele:

- `users` - klienci, instruktorzy i administratorzy,
- `classes` - zajecia i wydarzenia specjalne,
- `reservations` - rezerwacje klientow,
- `waitlist_entries` - lista rezerwowa,
- `payments` - platnosci,
- `user_passes` i `pass_types` - karnety,
- `attendance` - obecnosci,
- `reviews` - opinie,
- `notifications` - powiadomienia.

Taki podzial odpowiada temu, co opisalysmy w dokumentacji projektu. Spring Boot ma kopie tej schemy w `backend/src/main/resources/schema.sql`, zeby mogl przygotowac baze przy starcie aplikacji.
