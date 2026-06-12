# Zgodnosc projektu z dokumentacja

Projekt realizuje temat: **Aplikacja do rezerwacji zajec w szkole tanca**.

## Role uzytkownikow

| Rola | Status | Gdzie w projekcie |
| --- | --- | --- |
| Klient | Gotowe | `/client`, `frontend/public/assets/client.js`, endpointy `/api/clients/*` |
| Instruktor | Gotowe | `/trainer`, `frontend/public/assets/trainer.js`, endpointy `/api/trainers/*` |
| Administrator | Gotowe | `/admin`, `frontend/public/assets/admin.js`, endpointy `/api/admin/*` |

## Funkcjonalnosci z dokumentu

| Wymaganie | Realizacja |
| --- | --- |
| Interaktywny kalendarz z filtrowaniem | Widok klienta filtruje zajecia po kategorii, poziomie, instruktorze, dacie i wyszukiwaniu tekstowym. |
| Rezerwacje i dostepne miejsca na zywo | Karty zajec pokazuja liczbe miejsc i status klienta; backend blokuje zapis po przekroczeniu limitu. |
| Lista rezerwowa | Gdy grupa jest pelna, klient moze wejsc na waitlist; po anulowaniu rezerwacji pierwsza osoba z kolejki jest automatycznie promowana. |
| Karnety | Klient moze kupic karnet ilosciowy, Open Month lub pakiet warsztatowy. |
| Platnosci online | Projekt symuluje platnosci BLIK/PayU/Karta i zapisuje operacje w panelu administratora. |
| Wydarzenia specjalne | Administrator dodaje warsztaty/masterclassy niezalezne od regularnego grafiku. |
| Panel instruktora | Instruktor widzi swoje grupy, uczestnikow i oznacza obecnosc. |
| Raportowanie | Administrator widzi popularnosc zajec, oblozenie trenerow, srednie wypelnienie i srednia ocen. |
| Powiadomienia | System generuje potwierdzenia rezerwacji, anulowania, promocji z listy rezerwowej i nowych wydarzen. |
| Opinie i oceny | Klient moze wystawic ocene po zakonczonych zajeciach. |

## Wymagania niefunkcjonalne

| Wymaganie | Realizacja |
| --- | --- |
| Stabilnosc i szybkosc | Backend Java Spring Boot i relacyjna baza MySQL. |
| Bezpieczenstwo danych | Walidacja wejscia, separacja endpointow po rolach, przygotowana docelowa architektura RBAC w dokumentacji. |
| Responsywnosc | CSS ma uklady dla desktopu i mobile, panele skladaja sie w jedna kolumne. |
| Intuicyjny interfejs | Osobne widoki dla klienta, trenera i administratora; formularze i akcje sa opisane w kontekscie. |
| Wielu uzytkownikow | Backend centralizuje zmiany stanu, a dane sa w MySQL. Operacje rezerwacji sa wykonywane transakcyjnie. |
