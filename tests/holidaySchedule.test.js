import test from 'node:test';
import assert from 'node:assert/strict';
import {scheduledFlag} from '../src/lib/holidaySchedule.js';
import {validateOrder} from '../src/lib/holidayOrders.js';
const opens='2026-11-13T23:59:00+01:00';
test('ouverture Paris : fermé juste avant, ouvert à 23 h 59 exactement',()=>{
 assert.equal(scheduledFlag('true',opens,Date.parse('2026-11-13T22:58:59.999Z')),false);
 assert.equal(scheduledFlag('true',opens,Date.parse('2026-11-13T22:59:00Z')),true);
 assert.equal(scheduledFlag('true',opens,Date.parse('2026-11-14T00:00:00Z')),true);
 assert.equal(scheduledFlag('false',opens,Date.parse('2026-11-14T00:00:00Z')),false);
 assert.equal(scheduledFlag('true','invalide'),false);
});
test('la date bloque aussi les commandes directes au serveur avant ouverture',()=>{
 const input={name:'Test',firstName:'Client',phone:'0600000000',email:'test@example.com',pickup:'2026-12-24',payment:'cash',items:[{id:'poisson',quantity:1}]};
 const config={HOLIDAY_ORDERS_OPEN:'true',HOLIDAY_LAUNCH_AT:opens,HOLIDAY_DEADLINE_CHRISTMAS:'2026-12-21T23:59:00+01:00'};
 assert.throws(()=>validateOrder(input,config,Date.parse(opens)-1),/pas encore ouvertes/);
 assert.equal(validateOrder(input,config,Date.parse(opens)).total,1500);
});
