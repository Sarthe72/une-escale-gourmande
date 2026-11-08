-- Technical checks use their own outbox event, without creating an order or invoice.
ALTER TABLE holiday_mail ADD COLUMN test_payload TEXT;
