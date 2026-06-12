# Pulse Studio – System Rezerwacji Szkoły Tańca

## Opis projektu

**Pulse Studio** to nowoczesna aplikacja internetowa przeznaczona do zarządzania szkołą tańca. System umożliwia użytkownikom rejestrację, logowanie, przeglądanie zajęć, dokonywanie rezerwacji oraz zarządzanie danymi w zależności od przypisanej roli.

Projekt został wykonany jako projekt grupowy na studia z wykorzystaniem architektury MVC oraz nowoczesnych technologii internetowych.

---

# Główne funkcjonalności

## Rejestracja i logowanie

System umożliwia:

- rejestrację nowych użytkowników,
- logowanie do systemu,
- autoryzację na podstawie ról,
- wylogowanie z aplikacji.

Obsługiwane są trzy role użytkowników:

- **Klient**
- **Instruktor**
- **Administrator**

Po zalogowaniu użytkownik zostaje automatycznie przekierowany do odpowiedniego panelu.

---

# Panel Klienta

Klient może:

- przeglądać swój dashboard,
- przeglądać dostępne zajęcia,
- rezerwować zajęcia,
- zarządzać swoimi rezerwacjami,
- edytować profil,
- przeglądać zakupione karnety,
- sprawdzać historię płatności,
- odbierać powiadomienia.

---

# Panel Instruktora

Instruktor może:

- przeglądać swój dashboard,
- edytować profil,
- dodawać własną biografię,
- określać specjalizację,
- tworzyć nowe zajęcia,
- zarządzać swoimi zajęciami,
- przeglądać listę uczestników,
- analizować statystyki.

---

# Panel Administratora

Administrator posiada dostęp do:

- Dashboardu,
- zarządzania użytkownikami,
- zarządzania klientami,
- zarządzania instruktorami,
- zarządzania zajęciami,
- zarządzania płatnościami,
- raportów,
- ustawień systemu.

---

# Wykorzystane technologie

Projekt został wykonany z użyciem:

- Java 17
- Spring Boot
- Maven
- MySQL
- HTML5
- CSS3
- JavaScript

---

# Struktura projektu

```text
DanceSchoolProject_PDF_TECH_READY

│
├── backend
│
├── frontend
│     ├── index.html
│     ├── login.html
│     ├── register.html
│     ├── client.html
│     ├── trainer.html
│     ├── admin.html
│     └── assets
│
├── pom.xml
│
└── README.md
```

---

# Uruchomienie projektu

## Uruchomienie aplikacji

```bash
mvn spring-boot:run
```

lub

```bash
mvn -f DanceSchoolProject_PDF_TECH_READY/pom.xml spring-boot:run
```

Aplikacja jest dostępna pod adresem:

```text
http://localhost:4173
```

---

# Baza danych

Aplikacja korzysta z bazy danych **MySQL**.

Główne encje systemu:

- Użytkownicy
- Zajęcia
- Rezerwacje
- Płatności
- Opinie
- Powiadomienia

---

# Sposób działania aplikacji

1. Użytkownik otwiera stronę główną.
2. Rejestruje się lub loguje do systemu.
3. System rozpoznaje rolę użytkownika.
4. Następuje automatyczne przekierowanie do odpowiedniego panelu.
5. Każda rola posiada własny zestaw funkcjonalności oraz dedykowany interfejs.

---

# Cel projektu

Celem projektu jest stworzenie nowoczesnego systemu wspomagającego zarządzanie szkołą tańca. Aplikacja usprawnia proces rezerwacji zajęć, organizację pracy instruktorów oraz zarządzanie użytkownikami przez administratora.

Projekt prezentuje praktyczne wykorzystanie technologii backendowych i frontendowych, integrację z bazą danych oraz mechanizm zarządzania uprawnieniami użytkowników w kompletnej aplikacji internetowej.- Create new classes
- View created classes
- Monitor participants
- View statistics

---

# Administrator Panel

The administrator has access to:

- Dashboard
- User management
- Client management
- Instructor management
- Class management
- Payment management
- Reports
- System settings

---

# Technologies Used

The project was implemented using:

- Java 17
- Spring Boot
- Maven
- MySQL
- HTML5
- CSS3
- JavaScript

---

# Project Structure

```
DanceSchoolProject_PDF_TECH_READY

│
├── backend
│
├── frontend
│     ├── index.html
│     ├── login.html
│     ├── register.html
│     ├── client.html
│     ├── trainer.html
│     ├── admin.html
│     └── assets
│
├── pom.xml
│
└── README.md
```

---

# How to Run

## Start the application

```
mvn spring-boot:run
```

or

```
mvn -f DanceSchoolProject_PDF_TECH_READY/pom.xml spring-boot:run
```

The application is available at:

```
http://localhost:4173
```

---

# Database

The application uses **MySQL**.

Main entities include:

- Users
- Classes
- Reservations
- Payments
- Reviews
- Notifications

---

# Application Workflow

1. User opens the landing page.
2. User registers or logs in.
3. The system identifies the user's role.
4. The user is redirected to the appropriate dashboard.
5. Each role has its own functionality and interface.

---

# Project Goal

The objective of this project is to simplify the management of a dance school by providing an intuitive and centralized platform for clients, instructors, and administrators.

The application demonstrates practical use of backend and frontend technologies, database integration, and role-based access control in a complete web system.* Create new classes
* View created classes
* Monitor participants
* View statistics

⸻

Administrator Panel

The administrator has access to:

* Dashboard
* User management
* Client management
* Instructor management
* Class management
* Payment management
* Reports
* System settings

⸻

Technologies Used

The project was implemented using:

* Java 17
* Spring Boot
* Maven
* MySQL
* HTML5
* CSS3
* JavaScript

⸻

Project Structure

DanceSchoolProject_PDF_TECH_READY
│
├── backend
│
├── frontend
│     ├── index.html
│     ├── login.html
│     ├── register.html
│     ├── client.html
│     ├── trainer.html
│     ├── admin.html
│     └── assets
│
├── pom.xml
│
└── README.md

⸻

How to Run

Start the application

mvn spring-boot:run

or

mvn -f DanceSchoolProject_PDF_TECH_READY/pom.xml spring-boot:run

The application is available at:

http://localhost:4173

⸻

Database

The application uses MySQL.

Main entities include:

* Users
* Classes
* Reservations
* Payments
* Reviews
* Notifications

⸻

Application Workflow

1. User opens the landing page.
2. User registers or logs in.
3. The system identifies the user’s role.
4. The user is redirected to the appropriate dashboard.
5. Each role has its own functionality and interface.

⸻

Project Goal

The objective of this project is to simplify the management of a dance school by providing an intuitive and centralized platform for clients, instructors, and administrators.

The application demonstrates practical use of backend and frontend technologies, database integration, and role-based access control in a complete web system.
