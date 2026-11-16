import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {holidayReference} from '../src/lib/holidayReference.js';
test('numéros persistants : reprise, nouvel ordre, suppression et réexécution sans réutilisation',()=>{
 const db=new DatabaseSync(':memory:');
 try{
  db.exec("CREATE TABLE holiday_orders(id TEXT PRIMARY KEY,created_at TEXT); INSERT INTO holiday_orders VALUES('ancien','2026-11-16');");
  const sql=readFileSync(new URL('../migrations/0007_order_references.sql',import.meta.url),'utf8');
  db.exec(sql);db.exec(sql);
  assert.equal(holidayReference('ancien',db.prepare('SELECT sequence FROM holiday_order_references WHERE order_id=?').get('ancien').sequence),'NOEL-0026');
  db.exec("INSERT INTO holiday_orders VALUES('suivant','2026-11-17'); DELETE FROM holiday_orders WHERE id='suivant'; INSERT INTO holiday_orders VALUES('troisieme','2026-11-18');");
  assert.equal(holidayReference('troisieme',db.prepare('SELECT sequence FROM holiday_order_references WHERE order_id=?').get('troisieme').sequence),'NOEL-0028');
 }finally{db.close();}
});
