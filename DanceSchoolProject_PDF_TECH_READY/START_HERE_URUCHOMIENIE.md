# START — uruchomienie projektu Pulse Studio

## 1. Co jest w tej wersji
Projekt zostal rozbudowany do wersji z trzema oddzielnymi panelami:

- **Klient** — rejestracja, logowanie, edycja profilu, kupowanie karnetow, rezerwacje, lista rezerwowa, opinie.
- **Trener** — rejestracja/logowanie jako trener, edycja profilu, dodawanie wlasnych zajec, edycja/usuwanie zajec, lista uczestnikow, obecnosci.
- **Administrator** — jedno glowne konto dla zespolu projektu, raporty, platnosci, oblozenie grup, tworzenie wydarzen specjalnych.

## 2. Konta demo

| Rola | Email | Haslo |
|---|---|---|
| Klient | diana@pulse.studio | client123 |
| Trener | olena@pulse.studio | trainer123 |
| Administrator | admin@pulse.studio | admin123 |

Administrator jest celowo jednym kontem, ktore moze byc wspolne dla zespolu projektu.

## 3. Wymagane narzedzia na Macu

```bash
brew install maven mysql
brew services start mysql
```

Sprawdzenie:

```bash
mvn -version
mysql --version
```

## 4. Import bazy danych

W katalogu projektu:

```bash
mysql -u root < backend/src/main/resources/schema.sql
mysql -u root dance_school < backend/src/main/resources/data.sql
```

## 5. Uruchomienie backendu i frontendu

```bash
mvn spring-boot:run
```

Potem otworz w przegladarce:

```text
http://localhost:4173
```

## 6. Najwazniejszy flow do pokazania na obronie

1. Wejdz na strone glowna.
2. Zarejestruj nowe konto jako **Klient** i pokaz, ze system przenosi do panelu klienta.
3. Zarezerwuj zajecia albo dolacz do listy rezerwowej.
4. Wyloguj sie.
5. Zarejestruj albo zaloguj konto **Trener**.
6. Dodaj nowe zajecia, edytuj je, pokaz liste uczestnikow i obecnosci.
7. Zaloguj sie jako **Administrator** i pokaz raporty, platnosci oraz wydarzenia specjalne.
