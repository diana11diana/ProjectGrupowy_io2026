package pl.pulsestudio;

import java.sql.Date;
import java.sql.Time;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DanceSchoolService {
  private final JdbcTemplate jdbc;

  public DanceSchoolService(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }


  @Transactional
  public Map<String, Object> register(Map<String, Object> payload) {
    String name = text(payload.get("name")).trim();
    String email = normalizeEmail(payload.get("email"));
    String password = text(payload.get("password"));
    String requestedRole = text(payload.getOrDefault("role", "CLIENT")).toUpperCase().trim();
    String role = "INSTRUCTOR".equals(requestedRole) ? "INSTRUCTOR" : "CLIENT";
    String paymentMethod = text(payload.get("defaultPaymentMethod")).trim();
    String specialties = text(payload.get("specialties")).trim();
    if (paymentMethod.isBlank()) paymentMethod = "BLIK";
    if (name.length() < 3) throw new AppException("Imie i nazwisko musi miec co najmniej 3 znaki.");
    if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) throw new AppException("Podaj poprawny adres email.");
    if (password.length() < 6) throw new AppException("Haslo musi miec co najmniej 6 znakow.");
    if (count("SELECT COUNT(*) FROM users WHERE email = ?", email) > 0) throw new AppException("Konto z takim adresem email juz istnieje.");
    if ("INSTRUCTOR".equals(role) && specialties.isBlank()) specialties = "Dance, Fitness, Choreografia";
    String id = ("INSTRUCTOR".equals(role) ? "instr-" : "client-") + UUID.randomUUID().toString().substring(0, 8);
    jdbc.update("""
        INSERT INTO users (id, role, name, email, default_payment_method, specialties, password_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, id, role, name, email, "CLIENT".equals(role) ? paymentMethod : null, "INSTRUCTOR".equals(role) ? specialties : null, passwordHash(password));
    if ("CLIENT".equals(role)) notify(id, "Konto utworzone", "Witamy w Pulse Studio. Mozesz juz rezerwowac zajecia.");
    return mapOf("ok", true, "user", publicUser(id));
  }

  public Map<String, Object> login(Map<String, Object> payload) {
    String email = normalizeEmail(payload.get("email"));
    String password = text(payload.get("password"));
    String role = text(payload.get("role")).toUpperCase().trim();
    List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM users WHERE email = ?", email);
    if (rows.isEmpty() || !passwordHash(password).equals(text(rows.get(0).get("password_hash")))) {
      throw new AppException("Nieprawidlowy email lub haslo.", HttpStatus.UNAUTHORIZED);
    }
    String accountRole = text(rows.get(0).get("role"));
    if (!role.isBlank() && !role.equals(accountRole)) {
      throw new AppException("Wybrano zly typ konta. To konto ma role: " + accountRole + ".", HttpStatus.FORBIDDEN);
    }
    return mapOf("ok", true, "user", publicUser(text(rows.get(0).get("id"))));
  }

  public Map<String, Object> profile(String userId) {
    return mapOf("user", publicUser(userId));
  }

  @Transactional
  public Map<String, Object> updateProfile(String userId, Map<String, Object> payload) {
    Map<String, Object> current = publicUser(userId);

    String role = text(current.get("role"));
    String name = text(payload.getOrDefault("name", current.get("name"))).trim();
    String email = normalizeEmail(payload.getOrDefault("email", current.get("email")));
    String paymentMethod = text(payload.getOrDefault("defaultPaymentMethod", current.get("defaultPaymentMethod"))).trim();
    String specialties = text(payload.getOrDefault("specialties", current.get("specialties"))).trim();
    String bio = text(payload.getOrDefault("bio", current.get("bio"))).trim();
    String password = text(payload.get("password"));

    if (name.length() < 3) {
      throw new AppException("Imie i nazwisko musi miec co najmniej 3 znaki.");
    }

    if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
      throw new AppException("Podaj poprawny adres email.");
    }

    if (count("SELECT COUNT(*) FROM users WHERE email = ? AND id <> ?", email, userId) > 0) {
      throw new AppException("Ten adres email jest juz zajety.");
    }

    if (!"CLIENT".equals(role)) {
      paymentMethod = null;
    }

    if (!"INSTRUCTOR".equals(role)) {
      specialties = null;
      bio = null;
    }

    if (!password.isBlank()) {
      if (password.length() < 6) {
        throw new AppException("Nowe haslo musi miec co najmniej 6 znakow.");
      }

      jdbc.update("""
          UPDATE users
          SET name = ?, email = ?, default_payment_method = ?, specialties = ?, bio = ?, password_hash = ?
          WHERE id = ?
          """, name, email, paymentMethod, specialties, bio, passwordHash(password), userId);
    } else {
      jdbc.update("""
          UPDATE users
          SET name = ?, email = ?, default_payment_method = ?, specialties = ?, bio = ?
          WHERE id = ?
          """, name, email, paymentMethod, specialties, bio, userId);
    }

    return mapOf("ok", true, "user", publicUser(userId));
  }

  public Map<String, Object> referenceData() {
    return mapOf(
        "studio", studio(),
        "categories", List.of("Salsa", "Bachata", "Contemporary", "Barre", "Stretching", "Jazz Funk", "Heels"),
        "levels", List.of("Open", "Poczatkujacy", "Sredni", "Zaawansowany"),
        "clients", clients(),
        "instructors", instructors(),
        "passCatalog", passCatalog());
  }

  public Map<String, Object> clientOverview(String clientId) {
    Map<String, Object> client = requireUser(clientId, "CLIENT");
    List<Map<String, Object>> sessions = sessions();
    List<Map<String, Object>> bookings = sessions.stream()
        .filter(session -> list(session.get("attendeeIds")).contains(clientId))
        .toList();
    List<Map<String, Object>> reviews = reviewsForClient(clientId);
    List<Map<String, Object>> reviewTargets = sessions.stream()
        .filter(session -> list(session.get("attendeeIds")).contains(clientId))
        .filter(this::isCompleted)
        .filter(session -> reviews.stream().noneMatch(review -> review.get("sessionId").equals(session.get("id"))))
        .toList();

    Map<String, Object> stats = mapOf(
        "upcomingBookings", bookings.stream().filter(session -> !isCompleted(session)).count(),
        "waitlists", count("SELECT COUNT(*) FROM waitlist_entries WHERE client_id = ?", clientId),
        "remainingCredits", count("SELECT COALESCE(SUM(remaining_credits), 0) FROM user_passes WHERE client_id = ? AND type = 'CREDITS'", clientId),
        "openPassActive", count("SELECT COUNT(*) FROM user_passes WHERE client_id = ? AND type = 'OPEN' AND expires_at >= CURDATE()", clientId) > 0);

    client.put("passes", passesForClient(clientId));
    return mapOf(
        "studio", studio(),
        "client", client,
        "passCatalog", passCatalog(),
        "categories", referenceData().get("categories"),
        "levels", referenceData().get("levels"),
        "sessions", sessions,
        "bookings", bookings,
        "notifications", notifications(clientId),
        "reviews", reviews,
        "reviewTargets", reviewTargets,
        "stats", stats);
  }

  @Transactional
  public Map<String, Object> createReservation(String clientId, String sessionId) {
    requireUser(clientId, "CLIENT");
    Map<String, Object> session = requireSession(sessionId);
    ensureFuture(session);
    if (hasReservation(clientId, sessionId)) {
      throw new AppException("Klient jest juz zapisany na te zajecia.");
    }
    if (attendeeIds(sessionId).size() >= number(session.get("capacity"))) {
      throw new AppException("Brak wolnych miejsc. Uzyj listy rezerwowej.");
    }
    PaymentResult payment = applyPayment(clientId, session);
    jdbc.update("INSERT INTO reservations (class_id, client_id, payment_kind, user_pass_id) VALUES (?, ?, ?, ?)",
        sessionId, clientId, payment.kind(), payment.passId());
    jdbc.update("INSERT INTO attendance (class_id, client_id, present) VALUES (?, ?, FALSE)", sessionId, clientId);
    notify(clientId, "Rezerwacja potwierdzona", session.get("title") + " zostaly zarezerwowane. " + payment.note());
    return mapOf("ok", true, "mode", "reservation", "overview", clientOverview(clientId));
  }

  @Transactional
  public Map<String, Object> joinWaitlist(String clientId, String sessionId) {
    requireUser(clientId, "CLIENT");
    Map<String, Object> session = requireSession(sessionId);
    ensureFuture(session);
    if (hasReservation(clientId, sessionId)) {
      throw new AppException("Klient jest juz zapisany na te zajecia.");
    }
    if (count("SELECT COUNT(*) FROM waitlist_entries WHERE class_id = ? AND client_id = ?", sessionId, clientId) > 0) {
      throw new AppException("Klient jest juz na liscie rezerwowej.");
    }
    if (attendeeIds(sessionId).size() < number(session.get("capacity"))) {
      throw new AppException("Lista rezerwowa jest dostepna dopiero po wypelnieniu grupy.");
    }
    int position = count("SELECT COUNT(*) FROM waitlist_entries WHERE class_id = ?", sessionId) + 1;
    jdbc.update("INSERT INTO waitlist_entries (class_id, client_id, position_number) VALUES (?, ?, ?)", sessionId, clientId, position);
    notify(clientId, "Lista rezerwowa aktywna", "Dolaczono do kolejki na " + session.get("title") + ".");
    return mapOf("ok", true, "mode", "waitlist", "overview", clientOverview(clientId));
  }

  @Transactional
  public Map<String, Object> cancelReservation(String clientId, String sessionId) {
    if (!hasReservation(clientId, sessionId)) {
      throw new AppException("Nie znaleziono tej rezerwacji.");
    }
    restorePayment(clientId, sessionId);
    jdbc.update("DELETE FROM attendance WHERE class_id = ? AND client_id = ?", sessionId, clientId);
    jdbc.update("DELETE FROM reservations WHERE class_id = ? AND client_id = ? AND status = 'CONFIRMED'", sessionId, clientId);
    notify(clientId, "Rezerwacja anulowana", "Anulowano zapis na " + requireSession(sessionId).get("title") + ".");
    promoteFromWaitlist(sessionId);
    return mapOf("ok", true, "overview", clientOverview(clientId));
  }

  @Transactional
  public Map<String, Object> buyPass(String clientId, String passId) {
    requireUser(clientId, "CLIENT");
    Map<String, Object> pass = jdbc.queryForMap("SELECT * FROM pass_types WHERE id = ?", passId);
    String id = "owned-" + UUID.randomUUID().toString().substring(0, 8);
    if ("CREDITS".equals(pass.get("type"))) {
      jdbc.update("""
          INSERT INTO user_passes (id, client_id, pass_type_id, name, type, remaining_credits, total_credits, price, special_only)
          VALUES (?, ?, ?, ?, 'CREDITS', ?, ?, ?, ?)
          """, id, clientId, passId, pass.get("name"), pass.get("credits"), pass.get("credits"), pass.get("price"), pass.get("special_only"));
    } else {
      jdbc.update("""
          INSERT INTO user_passes (id, client_id, pass_type_id, name, type, expires_at, price, special_only)
          VALUES (?, ?, ?, ?, 'OPEN', DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, ?)
          """, id, clientId, passId, pass.get("name"), pass.get("duration_days"), pass.get("price"), pass.get("special_only"));
    }
    payment(clientId, null, id, pass.get("price"), defaultPayment(clientId), "Oplacona", "Zakup karnetu " + pass.get("name"));
    notify(clientId, "Nowy karnet aktywny", pass.get("name") + " zostal dodany do profilu.");
    return mapOf("ok", true, "overview", clientOverview(clientId));
  }

  @Transactional
  public Map<String, Object> addReview(String clientId, Map<String, Object> payload) {
    String sessionId = text(payload.get("sessionId"));
    int rating = number(payload.get("rating"));
    String text = text(payload.get("text")).trim();
    if (!hasReservation(clientId, sessionId)) {
      throw new AppException("Nie mozna dodac opinii do zajec, na ktore klient nie byl zapisany.");
    }
    if (!isCompleted(requireSession(sessionId))) {
      throw new AppException("Opinie mozna dodac dopiero po zakonczeniu zajec.");
    }
    if (rating < 1 || rating > 5 || text.isBlank()) {
      throw new AppException("Uzupelnij ocene i tresc opinii.");
    }
    jdbc.update("INSERT INTO reviews (id, class_id, client_id, rating, text) VALUES (?, ?, ?, ?, ?)",
        "review-" + UUID.randomUUID().toString().substring(0, 8), sessionId, clientId, rating, text);
    return mapOf("ok", true, "overview", clientOverview(clientId));
  }

  public Map<String, Object> trainerOverview(String instructorId) {
    Map<String, Object> trainer = requireUser(instructorId, "INSTRUCTOR");
    List<Map<String, Object>> trainerSessions = sessions().stream()
        .filter(session -> instructorId.equals(session.get("instructorId")))
        .peek(session -> session.put("attendees", attendees(text(session.get("id")))))
        .toList();
    Map<String, Object> stats = mapOf(
        "totalSessions", trainerSessions.size(),
        "totalAttendees", trainerSessions.stream().mapToInt(session -> list(session.get("attendeeIds")).size()).sum(),
        "checkedAttendance", count("SELECT COUNT(*) FROM attendance a JOIN classes c ON c.id = a.class_id WHERE c.instructor_id = ? AND a.present = TRUE", instructorId));
    return mapOf("studio", studio(), "trainer", trainer, "sessions", trainerSessions, "stats", stats);
  }


  @Transactional
  public Map<String, Object> createTrainerClass(String instructorId, Map<String, Object> payload) {
    requireUser(instructorId, "INSTRUCTOR");
    String id = "session-" + UUID.randomUUID().toString().substring(0, 8);
    jdbc.update("""
        INSERT INTO classes (id, title, category, level, class_date, class_time, duration_minutes, instructor_id, capacity, room, price, special_event)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, id, text(payload.get("title")), text(payload.get("category")), text(payload.get("level")),
        Date.valueOf(text(payload.get("date"))), Time.valueOf(text(payload.get("time")) + ":00"),
        numberOr(payload.get("duration"), 75), instructorId, numberOr(payload.get("capacity"), 14),
        text(payload.get("room")).isBlank() ? "Sala trenera" : text(payload.get("room")),
        numberOr(payload.get("price"), 39), Boolean.TRUE.equals(payload.get("specialEvent")));
    return mapOf("ok", true, "overview", trainerOverview(instructorId));
  }

  @Transactional
  public Map<String, Object> updateTrainerClass(String instructorId, String sessionId, Map<String, Object> payload) {
    Map<String, Object> session = requireSession(sessionId);
    if (!instructorId.equals(session.get("instructorId"))) throw new AppException("Trener moze edytowac tylko swoje zajecia.", HttpStatus.FORBIDDEN);
    jdbc.update("""
        UPDATE classes SET title = ?, category = ?, level = ?, class_date = ?, class_time = ?, duration_minutes = ?,
        capacity = ?, room = ?, price = ?, special_event = ? WHERE id = ? AND instructor_id = ?
        """, text(payload.getOrDefault("title", session.get("title"))), text(payload.getOrDefault("category", session.get("category"))),
        text(payload.getOrDefault("level", session.get("level"))), Date.valueOf(text(payload.getOrDefault("date", session.get("date")))),
        Time.valueOf(text(payload.getOrDefault("time", session.get("time"))) + ":00"), numberOr(payload.getOrDefault("duration", session.get("duration")), 75),
        numberOr(payload.getOrDefault("capacity", session.get("capacity")), 14), text(payload.getOrDefault("room", session.get("room"))),
        numberOr(payload.getOrDefault("price", session.get("price")), 39), Boolean.TRUE.equals(payload.getOrDefault("specialEvent", session.get("isSpecialEvent"))),
        sessionId, instructorId);
    return mapOf("ok", true, "overview", trainerOverview(instructorId));
  }

  @Transactional
  public Map<String, Object> deleteTrainerClass(String instructorId, String sessionId) {
    Map<String, Object> session = requireSession(sessionId);
    if (!instructorId.equals(session.get("instructorId"))) throw new AppException("Trener moze usunac tylko swoje zajecia.", HttpStatus.FORBIDDEN);
    jdbc.update("DELETE FROM attendance WHERE class_id = ?", sessionId);
    jdbc.update("DELETE FROM waitlist_entries WHERE class_id = ?", sessionId);
    jdbc.update("DELETE FROM reservations WHERE class_id = ?", sessionId);
    jdbc.update("DELETE FROM reviews WHERE class_id = ?", sessionId);
    jdbc.update("UPDATE payments SET class_id = NULL WHERE class_id = ?", sessionId);
    jdbc.update("DELETE FROM classes WHERE id = ? AND instructor_id = ?", sessionId, instructorId);
    return mapOf("ok", true, "overview", trainerOverview(instructorId));
  }

  @Transactional
  public Map<String, Object> markAttendance(String instructorId, Map<String, Object> payload) {
    String sessionId = text(payload.get("sessionId"));
    String memberId = text(payload.get("memberId"));
    Map<String, Object> session = requireSession(sessionId);
    if (!instructorId.equals(session.get("instructorId"))) {
      throw new AppException("Ten trener nie prowadzi wskazanych zajec.", HttpStatus.FORBIDDEN);
    }
    jdbc.update("UPDATE attendance SET present = ?, marked_at = NOW() WHERE class_id = ? AND client_id = ?",
        Boolean.TRUE.equals(payload.get("present")), sessionId, memberId);
    return mapOf("ok", true, "overview", trainerOverview(instructorId));
  }

  public Map<String, Object> adminOverview() {
    List<Map<String, Object>> sessions = sessions();
    double averageRating = jdbc.queryForObject("SELECT COALESCE(AVG(rating), 0) FROM reviews", Double.class);
    int capacity = sessions.stream().mapToInt(session -> number(session.get("capacity"))).sum();
    int attendees = sessions.stream().mapToInt(session -> list(session.get("attendeeIds")).size()).sum();
    Map<String, Object> stats = mapOf(
        "classes", sessions.stream().filter(session -> !Boolean.TRUE.equals(session.get("isSpecialEvent"))).count(),
        "events", sessions.stream().filter(session -> Boolean.TRUE.equals(session.get("isSpecialEvent"))).count(),
        "waitlists", count("SELECT COUNT(*) FROM waitlist_entries"),
        "occupancy", capacity == 0 ? 0 : Math.round(attendees * 100.0 / capacity),
        "averageRating", String.format("%.1f", averageRating));
    return mapOf(
        "studio", studio(),
        "categories", referenceData().get("categories"),
        "levels", referenceData().get("levels"),
        "instructors", instructors(),
        "sessions", sessions,
        "payments", payments(),
        "topClasses", topClasses(sessions),
        "trainerLoad", trainerLoad(),
        "stats", stats);
  }

  @Transactional
  public Map<String, Object> createEvent(Map<String, Object> payload) {
    String id = "session-" + UUID.randomUUID().toString().substring(0, 8);
    jdbc.update("""
        INSERT INTO classes (id, title, category, level, class_date, class_time, duration_minutes, instructor_id, capacity, room, price, special_event)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
        """,
        id, text(payload.get("title")), text(payload.get("category")), text(payload.get("level")),
        Date.valueOf(text(payload.get("date"))), Time.valueOf(text(payload.get("time")) + ":00"),
        numberOr(payload.get("duration"), 90), text(payload.get("instructorId")), numberOr(payload.get("capacity"), 16),
        text(payload.get("room")).isBlank() ? "Event Loft" : text(payload.get("room")), numberOr(payload.get("price"), 69));
    clients().forEach(client -> notify(text(client.get("id")), "Nowe wydarzenie w ofercie", payload.get("title") + " pojawilo sie w harmonogramie."));
    return mapOf("ok", true, "overview", adminOverview());
  }

  private List<Map<String, Object>> sessions() {
    List<Map<String, Object>> rows = jdbc.queryForList("""
        SELECT c.*, u.name AS instructor_name
        FROM classes c JOIN users u ON u.id = c.instructor_id
        ORDER BY c.class_date, c.class_time
        """);
    return rows.stream().map(row -> {
      String id = text(row.get("id"));
      return mapOf(
          "id", id,
          "title", row.get("title"),
          "category", row.get("category"),
          "level", row.get("level"),
          "date", row.get("class_date").toString(),
          "time", row.get("class_time").toString().substring(0, 5),
          "duration", row.get("duration_minutes"),
          "instructorId", row.get("instructor_id"),
          "instructorName", row.get("instructor_name"),
          "capacity", row.get("capacity"),
          "attendeeIds", attendeeIds(id),
          "waitlistIds", waitlistIds(id),
          "price", row.get("price"),
          "isSpecialEvent", row.get("special_event"),
          "room", row.get("room"),
          "attendance", attendanceMap(id),
          "attendeeNames", attendeeNames(id));
    }).toList();
  }

  private Map<String, Object> requireSession(String sessionId) {
    return sessions().stream()
        .filter(session -> sessionId.equals(session.get("id")))
        .findFirst()
        .orElseThrow(() -> new AppException("Nie znaleziono zajec.", HttpStatus.NOT_FOUND));
  }


  private Map<String, Object> publicUser(String id) {
    List<Map<String, Object>> rows = jdbc.queryForList("""
        SELECT id, role, name, email, default_payment_method, specialties, bio
        FROM users
        WHERE id = ?
        """, id);

    if (rows.isEmpty()) {
      throw new AppException("Nie znaleziono uzytkownika.", HttpStatus.NOT_FOUND);
    }

    Map<String, Object> row = rows.get(0);

    Map<String, Object> user = mapOf(
        "id", row.get("id"),
        "role", row.get("role"),
        "name", row.get("name"),
        "email", row.get("email"),
        "defaultPaymentMethod", row.get("default_payment_method"));

    if (row.get("specialties") != null && !text(row.get("specialties")).isBlank()) {
      user.put("specialties", text(row.get("specialties")));
    }

    if (row.get("bio") != null && !text(row.get("bio")).isBlank()) {
      user.put("bio", text(row.get("bio")));
    }

    return user;
  }

  private static String normalizeEmail(Object value) {
    return text(value).trim().toLowerCase();
  }

  private static String passwordHash(String password) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] encoded = digest.digest(password.getBytes(StandardCharsets.UTF_8));
      StringBuilder result = new StringBuilder();
      for (byte b : encoded) result.append(String.format("%02x", b));
      return result.toString();
    } catch (NoSuchAlgorithmException exception) {
      throw new IllegalStateException("SHA-256 is not available", exception);
    }
  }

  private Map<String, Object> requireUser(String id, String role) {
    List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM users WHERE id = ? AND role = ?", id, role);
    if (rows.isEmpty()) {
      throw new AppException("Nie znaleziono uzytkownika.", HttpStatus.NOT_FOUND);
    }
    Map<String, Object> user = new LinkedHashMap<>();
    user.put("id", rows.get(0).get("id"));
    user.put("name", rows.get(0).get("name"));
    user.put("email", rows.get(0).get("email"));
    user.put("defaultPaymentMethod", rows.get(0).get("default_payment_method"));
    if ("INSTRUCTOR".equals(role)) {
      user.put("specialties", List.of(text(rows.get(0).get("specialties")).split(",")));
    }
    return user;
  }

  private List<Map<String, Object>> clients() {
    return jdbc.queryForList("SELECT id, name, email FROM users WHERE role = 'CLIENT' ORDER BY name");
  }

  private List<Map<String, Object>> instructors() {
    return jdbc.queryForList("SELECT id, name, specialties FROM users WHERE role = 'INSTRUCTOR' ORDER BY name").stream()
        .map(row -> mapOf("id", row.get("id"), "name", row.get("name"), "specialties", List.of(text(row.get("specialties")).split(","))))
        .toList();
  }

  private List<Map<String, Object>> passCatalog() {
    return jdbc.queryForList("SELECT * FROM pass_types ORDER BY price").stream()
        .map(row -> mapOf("id", row.get("id"), "name", row.get("name"), "description", row.get("description"),
            "type", "CREDITS".equals(row.get("type")) ? "credits" : "open", "credits", row.get("credits"),
            "durationDays", row.get("duration_days"), "price", row.get("price"), "specialOnly", row.get("special_only")))
        .toList();
  }

  private List<Map<String, Object>> passesForClient(String clientId) {
    return jdbc.queryForList("SELECT * FROM user_passes WHERE client_id = ?", clientId).stream()
        .map(row -> mapOf("id", row.get("id"), "passId", row.get("pass_type_id"), "name", row.get("name"),
            "type", "CREDITS".equals(row.get("type")) ? "credits" : "open", "remaining", row.get("remaining_credits"),
            "total", row.get("total_credits"), "expiresAt", row.get("expires_at") == null ? null : row.get("expires_at").toString(),
            "price", row.get("price"), "specialOnly", row.get("special_only"), "active", true))
        .toList();
  }

  private List<String> attendeeIds(String sessionId) {
    return jdbc.queryForList("SELECT client_id FROM reservations WHERE class_id = ? AND status = 'CONFIRMED' ORDER BY id", String.class, sessionId);
  }

  private List<String> waitlistIds(String sessionId) {
    return jdbc.queryForList("SELECT client_id FROM waitlist_entries WHERE class_id = ? ORDER BY position_number", String.class, sessionId);
  }

  private List<String> attendeeNames(String sessionId) {
    return jdbc.queryForList("""
        SELECT u.name FROM reservations r JOIN users u ON u.id = r.client_id
        WHERE r.class_id = ? AND r.status = 'CONFIRMED' ORDER BY r.id
        """, String.class, sessionId);
  }

  private List<Map<String, Object>> attendees(String sessionId) {
    return jdbc.queryForList("""
        SELECT u.id, u.name, COALESCE(a.present, FALSE) AS present
        FROM reservations r
        JOIN users u ON u.id = r.client_id
        LEFT JOIN attendance a ON a.class_id = r.class_id AND a.client_id = r.client_id
        WHERE r.class_id = ? AND r.status = 'CONFIRMED'
        ORDER BY u.name
        """, sessionId);
  }

  private Map<String, Boolean> attendanceMap(String sessionId) {
    Map<String, Boolean> result = new LinkedHashMap<>();
    jdbc.queryForList("SELECT client_id, present FROM attendance WHERE class_id = ?", sessionId)
        .forEach(row -> result.put(text(row.get("client_id")), Boolean.TRUE.equals(row.get("present"))));
    return result;
  }

  private List<Map<String, Object>> notifications(String clientId) {
    return jdbc.queryForList("SELECT * FROM notifications WHERE client_id = ? ORDER BY created_at DESC LIMIT 10", clientId).stream()
        .map(row -> mapOf("id", row.get("id"), "clientId", row.get("client_id"), "title", row.get("title"),
            "body", row.get("body"), "createdAt", row.get("created_at").toString()))
        .toList();
  }

  private List<Map<String, Object>> reviewsForClient(String clientId) {
    return jdbc.queryForList("""
        SELECT r.*, c.title AS session_title FROM reviews r JOIN classes c ON c.id = r.class_id
        WHERE r.client_id = ? ORDER BY r.created_at DESC
        """, clientId).stream()
        .map(row -> mapOf("id", row.get("id"), "sessionId", row.get("class_id"), "clientId", row.get("client_id"),
            "rating", row.get("rating"), "text", row.get("text"), "createdAt", row.get("created_at").toString(),
            "sessionTitle", row.get("session_title")))
        .toList();
  }

  private List<Map<String, Object>> payments() {
    return jdbc.queryForList("""
        SELECT p.*, u.name AS client_name FROM payments p JOIN users u ON u.id = p.client_id
        ORDER BY p.created_at DESC LIMIT 10
        """).stream()
        .map(row -> mapOf("id", row.get("id"), "clientId", row.get("client_id"), "clientName", row.get("client_name"),
            "amount", row.get("amount"), "method", row.get("method"), "status", row.get("status"),
            "date", row.get("created_at").toString(), "description", row.get("description")))
        .toList();
  }

  private List<Map<String, Object>> topClasses(List<Map<String, Object>> sessions) {
    return sessions.stream()
        .sorted((a, b) -> Double.compare(list(b.get("attendeeIds")).size() / (double) number(b.get("capacity")),
            list(a.get("attendeeIds")).size() / (double) number(a.get("capacity"))))
        .limit(5)
        .map(session -> mapOf("id", session.get("id"), "title", session.get("title"),
            "fillRate", Math.round(list(session.get("attendeeIds")).size() * 100.0 / number(session.get("capacity"))),
            "detail", list(session.get("attendeeIds")).size() + "/" + session.get("capacity")))
        .toList();
  }

  private List<Map<String, Object>> trainerLoad() {
    return instructors().stream().map(trainer -> {
      String id = text(trainer.get("id"));
      int groups = count("SELECT COUNT(*) FROM classes WHERE instructor_id = ?", id);
      int people = count("""
          SELECT COUNT(*) FROM reservations r JOIN classes c ON c.id = r.class_id
          WHERE c.instructor_id = ? AND r.status = 'CONFIRMED'
          """, id);
      return mapOf("id", id, "name", trainer.get("name"), "percent", Math.min(100, groups * 20 + people * 3),
          "detail", groups + " grup • " + people + " uczestnikow");
    }).toList();
  }

  private boolean hasReservation(String clientId, String sessionId) {
    return count("SELECT COUNT(*) FROM reservations WHERE class_id = ? AND client_id = ? AND status = 'CONFIRMED'", sessionId, clientId) > 0;
  }

  private void ensureFuture(Map<String, Object> session) {
    if (isCompleted(session)) {
      throw new AppException("Nie mozna modyfikowac zajec, ktore juz sie zakonczyly.");
    }
  }

  private boolean isCompleted(Map<String, Object> session) {
    LocalDate date = LocalDate.parse(text(session.get("date")));
    LocalTime time = LocalTime.parse(text(session.get("time")));
    return date.atTime(time).isBefore(java.time.LocalDateTime.now());
  }

  private PaymentResult applyPayment(String clientId, Map<String, Object> session) {
    if (!Boolean.TRUE.equals(session.get("isSpecialEvent"))) {
      List<Map<String, Object>> open = jdbc.queryForList("""
          SELECT * FROM user_passes WHERE client_id = ? AND type = 'OPEN' AND expires_at >= CURDATE() LIMIT 1
          """, clientId);
      if (!open.isEmpty()) {
        return new PaymentResult("OPEN", text(open.get(0).get("id")), "Koszt zostal rozliczony z aktywnego karnetu Open Month.");
      }
    }
    List<Map<String, Object>> credits = jdbc.queryForList("""
        SELECT * FROM user_passes
        WHERE client_id = ? AND type = 'CREDITS' AND remaining_credits > 0
        AND (special_only = FALSE OR ? = TRUE)
        LIMIT 1
        """, clientId, session.get("isSpecialEvent"));
    if (!credits.isEmpty()) {
      String passId = text(credits.get(0).get("id"));
      jdbc.update("UPDATE user_passes SET remaining_credits = remaining_credits - 1 WHERE id = ?", passId);
      return new PaymentResult("PASS", passId, "Wykorzystano 1 wejscie z pakietu " + credits.get(0).get("name") + ".");
    }
    payment(clientId, text(session.get("id")), null, session.get("price"), defaultPayment(clientId), "Oplacona", "Rezerwacja " + session.get("title"));
    return new PaymentResult("SINGLE", null, "Pobrano oplate jednorazowa metoda " + defaultPayment(clientId) + ".");
  }

  private void restorePayment(String clientId, String sessionId) {
    List<Map<String, Object>> rows = jdbc.queryForList(
        "SELECT payment_kind, user_pass_id FROM reservations WHERE class_id = ? AND client_id = ? AND status = 'CONFIRMED'", sessionId, clientId);
    if (!rows.isEmpty() && "PASS".equals(rows.get(0).get("payment_kind")) && rows.get(0).get("user_pass_id") != null) {
      jdbc.update("UPDATE user_passes SET remaining_credits = remaining_credits + 1 WHERE id = ?", rows.get(0).get("user_pass_id"));
    }
    payment(clientId, sessionId, null, 0, "System", "Zwrot / anulacja", "Anulowanie " + requireSession(sessionId).get("title"));
  }

  private void promoteFromWaitlist(String sessionId) {
    List<String> queue = waitlistIds(sessionId);
    if (queue.isEmpty()) return;
    String promoted = queue.get(0);
    jdbc.update("DELETE FROM waitlist_entries WHERE class_id = ? AND client_id = ?", sessionId, promoted);
    Map<String, Object> session = requireSession(sessionId);
    PaymentResult payment = applyPayment(promoted, session);
    jdbc.update("INSERT INTO reservations (class_id, client_id, payment_kind, user_pass_id) VALUES (?, ?, ?, ?)",
        sessionId, promoted, payment.kind(), payment.passId());
    jdbc.update("INSERT INTO attendance (class_id, client_id, present) VALUES (?, ?, FALSE)", sessionId, promoted);
    notify(promoted, "Zwolnilo sie miejsce", "Masz potwierdzone miejsce na " + session.get("title") + ". " + payment.note());
  }

  private void notify(String clientId, String title, String body) {
    jdbc.update("INSERT INTO notifications (id, client_id, title, body) VALUES (?, ?, ?, ?)",
        "notification-" + UUID.randomUUID().toString().substring(0, 8), clientId, title, body);
  }

  private void payment(String clientId, String classId, String passId, Object amount, String method, String status, String description) {
    jdbc.update("INSERT INTO payments (id, client_id, class_id, user_pass_id, amount, method, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        "payment-" + UUID.randomUUID().toString().substring(0, 8), clientId, classId, passId, amount, method, status, description);
  }

  private String defaultPayment(String clientId) {
    return text(jdbc.queryForObject("SELECT default_payment_method FROM users WHERE id = ?", String.class, clientId));
  }

  private int count(String sql, Object... args) {
    Integer value = jdbc.queryForObject(sql, Integer.class, args);
    return value == null ? 0 : value;
  }

  private Map<String, Object> studio() {
    return mapOf("name", "Pulse Studio", "city", "Warszawa", "email", "kontakt@pulse.studio");
  }

  private static Map<String, Object> mapOf(Object... values) {
    Map<String, Object> map = new LinkedHashMap<>();
    for (int i = 0; i < values.length; i += 2) {
      map.put(String.valueOf(values[i]), values[i + 1]);
    }
    return map;
  }

  @SuppressWarnings("unchecked")
  private static List<Object> list(Object value) {
    return value instanceof List<?> items ? (List<Object>) items : new ArrayList<>();
  }

  private static String text(Object value) {
    return value == null ? "" : String.valueOf(value);
  }

  private static int number(Object value) {
    return value instanceof Number n ? n.intValue() : Integer.parseInt(text(value));
  }

  private static int numberOr(Object value, int fallback) {
    return value == null || text(value).isBlank() ? fallback : number(value);
  }

  private record PaymentResult(String kind, String passId, String note) {}
}

