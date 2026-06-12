package pl.pulsestudio;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiErrorHandler {
  @ExceptionHandler(AppException.class)
  public ResponseEntity<Map<String, String>> handleAppException(AppException error) {
    return ResponseEntity.status(error.getStatus()).body(Map.of("error", error.getMessage()));
  }
}

