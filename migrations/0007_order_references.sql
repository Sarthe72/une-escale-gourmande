CREATE TABLE IF NOT EXISTS holiday_order_references (
 sequence INTEGER PRIMARY KEY AUTOINCREMENT,
 order_id TEXT NOT NULL UNIQUE
);
INSERT OR IGNORE INTO holiday_order_references(order_id)
 SELECT id FROM holiday_orders WHERE NOT EXISTS(SELECT 1 FROM holiday_order_references WHERE order_id=holiday_orders.id) ORDER BY created_at,id;
CREATE TRIGGER IF NOT EXISTS holiday_order_reference AFTER INSERT ON holiday_orders
BEGIN
 INSERT INTO holiday_order_references(order_id) VALUES(NEW.id);
END;
