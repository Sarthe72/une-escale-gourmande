CREATE TABLE holiday_crm_devices (
 id TEXT PRIMARY KEY, public_key TEXT NOT NULL, created_at TEXT NOT NULL,
 revoked INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE holiday_crm_pairings (
 token_hash TEXT PRIMARY KEY, expires INTEGER NOT NULL, used_at INTEGER
);
CREATE TABLE holiday_crm_challenges (
 id TEXT PRIMARY KEY, device_id TEXT NOT NULL, challenge TEXT NOT NULL, expires INTEGER NOT NULL
);
