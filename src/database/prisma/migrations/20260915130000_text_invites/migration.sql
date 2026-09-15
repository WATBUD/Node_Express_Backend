CREATE TABLE IF NOT EXISTS text_invites (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sender_user_id INT NOT NULL,
  recipient_user_id INT NOT NULL,
  body VARCHAR(1000) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  pending_marker TINYINT NULL DEFAULT 1,
  UNIQUE KEY text_pending_pair (sender_user_id, recipient_user_id, pending_marker),
  KEY text_recipient_created (recipient_user_id, created_at),
  CONSTRAINT text_sender_fk FOREIGN KEY (sender_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT text_recipient_fk FOREIGN KEY (recipient_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT text_distinct_users CHECK (sender_user_id <> recipient_user_id)
);
