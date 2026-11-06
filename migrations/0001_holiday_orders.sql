CREATE TABLE IF NOT EXISTS holiday_orders (
 id TEXT PRIMARY KEY, request_key TEXT NOT NULL UNIQUE, fingerprint TEXT NOT NULL,
 created_at TEXT NOT NULL, pickup TEXT NOT NULL, payload TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'confirmed', paid INTEGER NOT NULL DEFAULT 0,
 version INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS orders_pickup ON holiday_orders(pickup, created_at);
CREATE TABLE IF NOT EXISTS holiday_sessions (token_hash TEXT PRIMARY KEY, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS holiday_limits (bucket TEXT PRIMARY KEY, count INTEGER NOT NULL);
