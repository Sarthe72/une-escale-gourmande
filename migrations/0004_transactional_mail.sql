CREATE TABLE holiday_mail (
 event_key TEXT PRIMARY KEY, kind TEXT NOT NULL, order_id TEXT NOT NULL,
 state TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0,
 next_attempt INTEGER NOT NULL DEFAULT 0, locked_until INTEGER NOT NULL DEFAULT 0,
 sent_at TEXT, provider_id TEXT, last_error TEXT
);
CREATE INDEX holiday_mail_pending ON holiday_mail(state,next_attempt);
CREATE TABLE holiday_mail_days(day TEXT PRIMARY KEY, attempts INTEGER NOT NULL);
CREATE TRIGGER holiday_mail_order AFTER INSERT ON holiday_orders
WHEN json_extract(NEW.payload,'$.source')='website'
BEGIN
 INSERT INTO holiday_mail(event_key,kind,order_id) VALUES('order:'||NEW.id,'order',NEW.id);
END;
CREATE TRIGGER holiday_mail_invoice AFTER INSERT ON holiday_invoices
BEGIN
 INSERT INTO holiday_mail(event_key,kind,order_id) VALUES('invoice:'||NEW.order_id,'invoice',NEW.order_id);
END;
CREATE TRIGGER holiday_mail_invoice_reopen AFTER UPDATE OF status,paid ON holiday_orders
WHEN NEW.status='collected' AND NEW.paid=1
BEGIN
 UPDATE holiday_mail SET state='pending',next_attempt=0,last_error=NULL
 WHERE event_key='invoice:'||NEW.id AND state='cancelled';
END;
