# Backend - czesc Kateryny

Backend jest napisany w **Java Spring Boot**, tak jak wymagamy w dokumentacji projektu.

Najwazniejsze pliki:

- `src/main/java/pl/pulsestudio/DanceSchoolApplication.java` - start aplikacji,
- `src/main/java/pl/pulsestudio/DanceSchoolController.java` - endpointy REST,
- `src/main/java/pl/pulsestudio/DanceSchoolService.java` - logika biznesowa,
- `src/main/java/pl/pulsestudio/WebConfig.java` - podlaczenie frontendu,
- `src/main/resources/application.properties` - konfiguracja MySQL,
- `src/main/resources/schema.sql` - tworzenie tabel,
- `src/main/resources/data.sql` - dane startowe.

Backend obsluguje:

- rezerwacje zajec,
- liste rezerwowa,
- karnety,
- platnosci,
- powiadomienia,
- opinie,
- obecnosc uczestnikow,
- raporty administratora.

Uruchomienie z glownego katalogu projektu:

```bash
mvn spring-boot:run
```

