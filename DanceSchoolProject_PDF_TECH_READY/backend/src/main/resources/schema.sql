CREATE DATABASE IF NOT EXISTS dance_school CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dance_school;

DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS waitlist_entries;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS user_passes;
DROP TABLE IF EXISTS pass_types;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id VARCHAR(60) PRIMARY KEY,
  role ENUM('CLIENT', 'INSTRUCTOR', 'ADMIN') NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  default_payment_method VARCHAR(40),
  specialties VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL DEFAULT 'demo-password-hash'
);

CREATE TABLE pass_types (
  id VARCHAR(60) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255) NOT NULL,
  type ENUM('CREDITS', 'OPEN') NOT NULL,
  credits INT NULL,
  duration_days INT NULL,
  price DECIMAL(10,2) NOT NULL,
  special_only BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE user_passes (
  id VARCHAR(60) PRIMARY KEY,
  client_id VARCHAR(60) NOT NULL,
  pass_type_id VARCHAR(60) NOT NULL,
  name VARCHAR(120) NOT NULL,
  type ENUM('CREDITS', 'OPEN') NOT NULL,
  remaining_credits INT NULL,
  total_credits INT NULL,
  expires_at DATE NULL,
  price DECIMAL(10,2) NOT NULL,
  special_only BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (client_id) REFERENCES users(id),
  FOREIGN KEY (pass_type_id) REFERENCES pass_types(id)
);

CREATE TABLE classes (
  id VARCHAR(60) PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  level VARCHAR(80) NOT NULL,
  class_date DATE NOT NULL,
  class_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  instructor_id VARCHAR(60) NOT NULL,
  capacity INT NOT NULL,
  room VARCHAR(80) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  special_event BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (instructor_id) REFERENCES users(id),
  INDEX idx_classes_filter (category, level, class_date, instructor_id)
);

CREATE TABLE reservations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  class_id VARCHAR(60) NOT NULL,
  client_id VARCHAR(60) NOT NULL,
  status ENUM('CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
  payment_kind VARCHAR(40),
  user_pass_id VARCHAR(60),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (client_id) REFERENCES users(id),
  FOREIGN KEY (user_pass_id) REFERENCES user_passes(id),
  UNIQUE KEY uq_reservation (class_id, client_id, status)
);

CREATE TABLE waitlist_entries (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  class_id VARCHAR(60) NOT NULL,
  client_id VARCHAR(60) NOT NULL,
  position_number INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (client_id) REFERENCES users(id),
  UNIQUE KEY uq_waitlist_client (class_id, client_id)
);

CREATE TABLE attendance (
  class_id VARCHAR(60) NOT NULL,
  client_id VARCHAR(60) NOT NULL,
  present BOOLEAN NOT NULL DEFAULT FALSE,
  marked_at DATETIME NULL,
  PRIMARY KEY (class_id, client_id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (client_id) REFERENCES users(id)
);

CREATE TABLE payments (
  id VARCHAR(80) PRIMARY KEY,
  client_id VARCHAR(60) NOT NULL,
  class_id VARCHAR(60) NULL,
  user_pass_id VARCHAR(60) NULL,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(40) NOT NULL,
  status VARCHAR(60) NOT NULL,
  description VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (user_pass_id) REFERENCES user_passes(id)
);

CREATE TABLE notifications (
  id VARCHAR(80) PRIMARY KEY,
  client_id VARCHAR(60) NOT NULL,
  title VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id)
);

CREATE TABLE reviews (
  id VARCHAR(80) PRIMARY KEY,
  class_id VARCHAR(60) NOT NULL,
  client_id VARCHAR(60) NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (client_id) REFERENCES users(id),
  UNIQUE KEY uq_review_once (class_id, client_id)
);

