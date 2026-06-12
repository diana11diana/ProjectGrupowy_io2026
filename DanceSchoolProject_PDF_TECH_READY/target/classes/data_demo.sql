USE dance_school;

INSERT INTO users (id, role, name, email, default_payment_method, specialties) VALUES
('client-diana', 'CLIENT', 'Diana Broshko', 'diana@pulse.studio', 'BLIK', NULL),
('client-katya', 'CLIENT', 'Kateryna Hodyna', 'katya@pulse.studio', 'PayU', NULL),
('client-mariana', 'CLIENT', 'Mariana Koliada', 'mariana@pulse.studio', 'Karta', NULL),
('client-lia', 'CLIENT', 'Lia Moreno', 'lia@pulse.studio', 'BLIK', NULL),
('client-noah', 'CLIENT', 'Noah Bell', 'noah@pulse.studio', 'PayU', NULL),
('client-ania', 'CLIENT', 'Ania Domanska', 'ania@pulse.studio', 'BLIK', NULL),
('client-mika', 'CLIENT', 'Mika Sol', 'mika@pulse.studio', 'Karta', NULL),
('client-sara', 'CLIENT', 'Sara Vane', 'sara@pulse.studio', 'BLIK', NULL),
('client-olaf', 'CLIENT', 'Olaf Rybak', 'olaf@pulse.studio', 'PayU', NULL),
('client-zoe', 'CLIENT', 'Zoe Hart', 'zoe@pulse.studio', 'Karta', NULL),
('client-jan', 'CLIENT', 'Jan Kurek', 'jan@pulse.studio', 'BLIK', NULL),
('client-ola', 'CLIENT', 'Ola Witek', 'ola@pulse.studio', 'PayU', NULL),
('client-fox', 'CLIENT', 'Fox Rivera', 'fox@pulse.studio', 'Karta', NULL),
('client-nera', 'CLIENT', 'Nera Bloom', 'nera@pulse.studio', 'BLIK', NULL),
('instr-olena', 'INSTRUCTOR', 'Olena Voss', 'olena@pulse.studio', NULL, 'Contemporary,Stretching'),
('instr-marek', 'INSTRUCTOR', 'Marek Silva', 'marek@pulse.studio', NULL, 'Salsa,Bachata'),
('instr-lena', 'INSTRUCTOR', 'Lena Fox', 'lena@pulse.studio', NULL, 'Jazz Funk,Heels,Barre'),
('admin-main', 'ADMIN', 'Administrator Pulse Studio', 'admin@pulse.studio', NULL, NULL);



-- Demo passwords:
-- clients: client123, instructors: trainer123, administrator: admin123
UPDATE users SET password_hash = '186474c1f2c2f735a54c2cf82ee8e87f2a5cd30940e280029363fecedfc5328c' WHERE role = 'CLIENT';
UPDATE users SET password_hash = '5b3d264e4cdc2c39ca6708b3e1e21f082722be12e63ee21484bdbe15735ab066' WHERE role = 'INSTRUCTOR';
UPDATE users SET password_hash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' WHERE role = 'ADMIN';

INSERT INTO pass_types (id, name, description, type, credits, duration_days, price, special_only) VALUES
('pass-open', 'Open Month', 'Nielimitowane wejscia przez 30 dni na regularne zajecia.', 'OPEN', NULL, 30, 289.00, FALSE),
('pass-8', '8 wejsc', 'Pakiet osmiu wejsc do wykorzystania w dowolnym terminie.', 'CREDITS', 8, NULL, 219.00, FALSE),
('pass-workshop', 'Weekend Master', 'Pakiet 3 wejsc na warsztaty i wydarzenia specjalne.', 'CREDITS', 3, NULL, 149.00, TRUE);

INSERT INTO user_passes (id, client_id, pass_type_id, name, type, remaining_credits, total_credits, expires_at, price, special_only) VALUES
('owned-pass-1', 'client-diana', 'pass-8', '8 wejsc', 'CREDITS', 4, 8, NULL, 219.00, FALSE),
('owned-pass-2', 'client-katya', 'pass-open', 'Open Month', 'OPEN', NULL, NULL, DATE_ADD(CURDATE(), INTERVAL 30 DAY), 289.00, FALSE);

INSERT INTO classes (id, title, category, level, class_date, class_time, duration_minutes, instructor_id, capacity, room, price, special_event) VALUES
('session-1', 'Salsa Flow Fundamentals', 'Salsa', 'Poczatkujacy', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', 75, 'instr-marek', 14, 'Sala Havana', 39.00, FALSE),
('session-2', 'Bachata Partner Lab', 'Bachata', 'Sredni', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:45:00', 90, 'instr-marek', 12, 'Sala Rio', 45.00, FALSE),
('session-3', 'Morning Barre Reset', 'Barre', 'Open', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:00:00', 50, 'instr-lena', 18, 'Sala Light', 32.00, FALSE),
('session-4', 'Contemporary Release Lab', 'Contemporary', 'Zaawansowany', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '18:30:00', 90, 'instr-olena', 10, 'Studio Motion', 49.00, FALSE),
('session-5', 'Jazz Funk Spotlight', 'Jazz Funk', 'Sredni', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '17:20:00', 70, 'instr-lena', 16, 'Stage Room', 37.00, FALSE),
('session-6', 'Heels Confidence Intensive', 'Heels', 'Zaawansowany', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '16:00:00', 120, 'instr-lena', 14, 'Stage Room', 69.00, TRUE),
('session-7', 'Stretch & Recover', 'Stretching', 'Open', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '11:00:00', 45, 'instr-olena', 20, 'Sala Light', 29.00, FALSE);

INSERT INTO reservations (class_id, client_id, payment_kind, user_pass_id) VALUES
('session-1', 'client-diana', 'PASS', 'owned-pass-1'),
('session-1', 'client-katya', 'OPEN', 'owned-pass-2'),
('session-1', 'client-mariana', 'SINGLE', NULL),
('session-1', 'client-lia', 'SINGLE', NULL),
('session-1', 'client-noah', 'SINGLE', NULL),
('session-2', 'client-katya', 'OPEN', 'owned-pass-2'),
('session-2', 'client-lia', 'SINGLE', NULL),
('session-2', 'client-noah', 'SINGLE', NULL),
('session-2', 'client-ania', 'SINGLE', NULL),
('session-2', 'client-mika', 'SINGLE', NULL),
('session-2', 'client-sara', 'SINGLE', NULL),
('session-2', 'client-olaf', 'SINGLE', NULL),
('session-2', 'client-zoe', 'SINGLE', NULL),
('session-2', 'client-jan', 'SINGLE', NULL),
('session-2', 'client-ola', 'SINGLE', NULL),
('session-2', 'client-fox', 'SINGLE', NULL),
('session-2', 'client-nera', 'SINGLE', NULL),
('session-3', 'client-diana', 'PASS', 'owned-pass-1'),
('session-3', 'client-mariana', 'SINGLE', NULL),
('session-3', 'client-ania', 'SINGLE', NULL),
('session-3', 'client-ola', 'SINGLE', NULL),
('session-4', 'client-katya', 'OPEN', 'owned-pass-2'),
('session-4', 'client-mariana', 'SINGLE', NULL),
('session-4', 'client-zoe', 'SINGLE', NULL),
('session-4', 'client-fox', 'SINGLE', NULL),
('session-4', 'client-jan', 'SINGLE', NULL),
('session-4', 'client-lia', 'SINGLE', NULL),
('session-5', 'client-mariana', 'SINGLE', NULL),
('session-5', 'client-noah', 'SINGLE', NULL),
('session-5', 'client-mika', 'SINGLE', NULL),
('session-5', 'client-nera', 'SINGLE', NULL),
('session-5', 'client-zoe', 'SINGLE', NULL),
('session-5', 'client-lia', 'SINGLE', NULL),
('session-6', 'client-katya', 'SINGLE', NULL),
('session-6', 'client-mariana', 'SINGLE', NULL),
('session-6', 'client-fox', 'SINGLE', NULL),
('session-6', 'client-nera', 'SINGLE', NULL),
('session-6', 'client-sara', 'SINGLE', NULL),
('session-6', 'client-mika', 'SINGLE', NULL),
('session-7', 'client-diana', 'PASS', 'owned-pass-1'),
('session-7', 'client-katya', 'OPEN', 'owned-pass-2'),
('session-7', 'client-mariana', 'SINGLE', NULL),
('session-7', 'client-ania', 'SINGLE', NULL),
('session-7', 'client-ola', 'SINGLE', NULL);

INSERT INTO waitlist_entries (class_id, client_id, position_number) VALUES
('session-2', 'client-diana', 1);

INSERT INTO attendance (class_id, client_id, present)
SELECT class_id, client_id, FALSE FROM reservations WHERE status = 'CONFIRMED';

INSERT INTO payments (id, client_id, class_id, amount, method, status, description) VALUES
('payment-1', 'client-mariana', 'session-1', 39.00, 'Karta', 'Oplacona', 'Rezerwacja Salsa Flow Fundamentals'),
('payment-2', 'client-mariana', 'session-3', 32.00, 'Karta', 'Oplacona', 'Rezerwacja Morning Barre Reset'),
('payment-3', 'client-katya', 'session-6', 69.00, 'PayU', 'Oplacona', 'Rezerwacja Heels Confidence Intensive');

INSERT INTO notifications (id, client_id, title, body) VALUES
('notification-1', 'client-diana', 'Lista rezerwowa aktywna', 'Dolaczono do kolejki na Bachata Partner Lab.'),
('notification-2', 'client-mariana', 'Rezerwacja potwierdzona', 'Masz potwierdzone miejsce na Salsa Flow Fundamentals.'),
('notification-3', 'client-katya', 'Karnet Open aktywny', 'Open Month jest aktywny przez 30 dni.');

