package pl.pulsestudio;

import java.util.Map;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DanceSchoolController {
  private final DanceSchoolService service;

  public DanceSchoolController(DanceSchoolService service) {
    this.service = service;
  }

  @GetMapping("/api/health")
  public Map<String, String> health() {
    return Map.of("status", "ok", "backend", "Java Spring Boot", "database", "MySQL");
  }

  @PostMapping("/api/auth/register")
  public Map<String, Object> register(@RequestBody Map<String, Object> body) {
    return service.register(body);
  }

  @PostMapping("/api/auth/login")
  public Map<String, Object> login(@RequestBody Map<String, Object> body) {
    return service.login(body);
  }

  @GetMapping("/api/users/{userId}/profile")
  public Map<String, Object> profile(@PathVariable String userId) {
    return service.profile(userId);
  }

  @PatchMapping("/api/users/{userId}/profile")
  public Map<String, Object> updateProfile(@PathVariable String userId, @RequestBody Map<String, Object> body) {
    return service.updateProfile(userId, body);
  }

  @GetMapping("/api/reference")
  public Map<String, Object> reference() {
    return service.referenceData();
  }

  @GetMapping("/api/clients/{clientId}/overview")
  public Map<String, Object> clientOverview(@PathVariable String clientId) {
    return service.clientOverview(clientId);
  }

  @PostMapping("/api/clients/{clientId}/reservations")
  public Map<String, Object> createReservation(@PathVariable String clientId, @RequestBody Map<String, Object> body) {
    return service.createReservation(clientId, String.valueOf(body.get("sessionId")));
  }

  @DeleteMapping("/api/clients/{clientId}/reservations/{sessionId}")
  public Map<String, Object> cancelReservation(@PathVariable String clientId, @PathVariable String sessionId) {
    return service.cancelReservation(clientId, sessionId);
  }

  @PostMapping("/api/clients/{clientId}/waitlist")
  public Map<String, Object> joinWaitlist(@PathVariable String clientId, @RequestBody Map<String, Object> body) {
    return service.joinWaitlist(clientId, String.valueOf(body.get("sessionId")));
  }

  @PostMapping("/api/clients/{clientId}/passes")
  public Map<String, Object> buyPass(@PathVariable String clientId, @RequestBody Map<String, Object> body) {
    return service.buyPass(clientId, String.valueOf(body.get("passId")));
  }

  @PostMapping("/api/clients/{clientId}/reviews")
  public Map<String, Object> addReview(@PathVariable String clientId, @RequestBody Map<String, Object> body) {
    return service.addReview(clientId, body);
  }

  @GetMapping("/api/trainers/{instructorId}/overview")
  public Map<String, Object> trainerOverview(@PathVariable String instructorId) {
    return service.trainerOverview(instructorId);
  }

  @PostMapping("/api/trainers/{instructorId}/classes")
  public Map<String, Object> createTrainerClass(@PathVariable String instructorId, @RequestBody Map<String, Object> body) {
    return service.createTrainerClass(instructorId, body);
  }

  @PatchMapping("/api/trainers/{instructorId}/classes/{sessionId}")
  public Map<String, Object> updateTrainerClass(@PathVariable String instructorId, @PathVariable String sessionId, @RequestBody Map<String, Object> body) {
    return service.updateTrainerClass(instructorId, sessionId, body);
  }

  @DeleteMapping("/api/trainers/{instructorId}/classes/{sessionId}")
  public Map<String, Object> deleteTrainerClass(@PathVariable String instructorId, @PathVariable String sessionId) {
    return service.deleteTrainerClass(instructorId, sessionId);
  }

  @PatchMapping("/api/trainers/{instructorId}/attendance")
  public Map<String, Object> markAttendance(@PathVariable String instructorId, @RequestBody Map<String, Object> body) {
    return service.markAttendance(instructorId, body);
  }

  @GetMapping("/api/admin/overview")
  public Map<String, Object> adminOverview() {
    return service.adminOverview();
  }

  @PostMapping("/api/admin/events")
  public Map<String, Object> createEvent(@RequestBody Map<String, Object> body) {
    return service.createEvent(body);
  }
}

