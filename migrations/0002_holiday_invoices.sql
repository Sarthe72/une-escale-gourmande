ALTER TABLE holiday_orders ADD COLUMN paid_at TEXT;
ALTER TABLE holiday_orders ADD COLUMN collected_at TEXT;
CREATE TABLE holiday_invoices (
 sequence INTEGER PRIMARY KEY AUTOINCREMENT,
 order_id TEXT NOT NULL UNIQUE REFERENCES holiday_orders(id),
 number TEXT UNIQUE,
 issued_at TEXT NOT NULL,
 snapshot TEXT NOT NULL
);
CREATE TRIGGER holiday_invoice_number AFTER INSERT ON holiday_invoices
BEGIN
 UPDATE holiday_invoices SET number='FAC-NOEL-' || printf('%06d',NEW.sequence) WHERE sequence=NEW.sequence;
END;
CREATE TABLE holiday_order_events (
 sequence INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT NOT NULL,
 old_status TEXT NOT NULL,new_status TEXT NOT NULL,old_paid INTEGER NOT NULL,new_paid INTEGER NOT NULL,
 changed_at TEXT NOT NULL
);
CREATE TRIGGER holiday_order_changed AFTER UPDATE OF status,paid ON holiday_orders
WHEN OLD.status != NEW.status OR OLD.paid != NEW.paid
BEGIN
 INSERT INTO holiday_order_events(order_id,old_status,new_status,old_paid,new_paid,changed_at)
 VALUES(NEW.id,OLD.status,NEW.status,OLD.paid,NEW.paid,NEW.updated_at);
END;
CREATE TRIGGER holiday_order_invoice AFTER UPDATE OF status,paid ON holiday_orders
WHEN NEW.status='collected' AND NEW.paid=1
BEGIN
 INSERT INTO holiday_invoices(order_id,issued_at,snapshot)
 VALUES(NEW.id,NEW.updated_at,NEW.payload) ON CONFLICT(order_id) DO NOTHING;
END;
