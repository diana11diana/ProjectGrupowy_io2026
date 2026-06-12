Pulse Studio – Dance School Reservation System

Project Description

Pulse Studio is a modern web application created to manage a dance school. The system allows users to register, log in, browse classes, create reservations, manage profiles, and perform administrative tasks depending on their role.

The application was developed as a university group project using modern web technologies and follows the MVC architecture.

⸻

Main Features

User Authentication

The system provides:

* User registration
* User login
* Role-based authorization
* Logout functionality

Three user roles are supported:

* Client
* Instructor
* Administrator

After logging in, the user is automatically redirected to the appropriate dashboard.

⸻

Client Panel

The client can:

* View personal dashboard
* Browse available classes
* Reserve classes
* View personal reservations
* Edit profile information
* View purchased passes
* View payments
* Receive notifications

⸻

Instructor Panel

The instructor can:

* View personal dashboard
* Edit profile
* Add biography
* Manage personal information
* Create new classes
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
