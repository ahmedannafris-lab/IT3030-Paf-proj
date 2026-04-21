-- Seed demo users used by frontend local auth so requesterId values resolve in backend.
INSERT INTO users (id, name, email, password, role, enabled, reset_otp, otp_expiry)
VALUES (1, 'Admin User', 'admin@campus.com', 'admin123', 'ADMIN', true, NULL, NULL)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    role = VALUES(role),
    enabled = VALUES(enabled);

INSERT INTO users (id, name, email, password, role, enabled, reset_otp, otp_expiry)
VALUES (2, 'John User', 'user@campus.com', 'user123', 'USER', true, NULL, NULL)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    role = VALUES(role),
    enabled = VALUES(enabled);

INSERT INTO users (id, name, email, password, role, enabled, reset_otp, otp_expiry)
VALUES (3, 'Tech Support', 'tech@campus.com', 'tech123', 'TECHNICIAN', true, NULL, NULL)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    role = VALUES(role),
    enabled = VALUES(enabled);
