DROP TRIGGER IF EXISTS holiday_order_invoice;
CREATE TRIGGER holiday_order_invoice AFTER UPDATE OF status,paid ON holiday_orders
WHEN NEW.status='collected' AND NEW.paid=1
BEGIN
 INSERT INTO holiday_invoices(order_id,issued_at,snapshot)
 SELECT NEW.id,NEW.updated_at,NEW.payload
 WHERE NOT EXISTS(SELECT 1 FROM holiday_invoices WHERE order_id=NEW.id);
END;
CREATE TRIGGER holiday_invoice_snapshot_immutable BEFORE UPDATE OF snapshot,order_id,issued_at,sequence ON holiday_invoices
BEGIN
 SELECT RAISE(ABORT,'Invoice snapshot is immutable');
END;
CREATE TRIGGER holiday_invoice_number_immutable BEFORE UPDATE OF number ON holiday_invoices
WHEN OLD.number IS NOT NULL
BEGIN
 SELECT RAISE(ABORT,'Invoice number is immutable');
END;
