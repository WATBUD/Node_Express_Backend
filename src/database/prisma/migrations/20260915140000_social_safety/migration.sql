CREATE TABLE IF NOT EXISTS user_blocks (
  blocker_user_id INT NOT NULL,
  blocked_user_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (blocker_user_id, blocked_user_id),
  KEY blocked_user_index (blocked_user_id),
  FOREIGN KEY (blocker_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_token_version INT NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS text_resonances (
  user_id INT NOT NULL,
  profile_user_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, profile_user_id),
  KEY profile_resonance_index (profile_user_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (profile_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
