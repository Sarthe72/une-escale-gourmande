import test from 'node:test';
import assert from 'node:assert/strict';
import {holidayReference} from '../src/lib/holidayReference.js';
test('référence courte stable pour les anciennes et nouvelles commandes',()=>{
 assert.equal(holidayReference('8397f748-64b8-4624-bf30-fda5955cdee6',1),'NOEL-0026');
 assert.equal(holidayReference('8397f748-64b8-4624-bf30-fda5955cdee6'),'NOEL-8397F74864');
 assert.equal(holidayReference('EXEMPLE-COMMANDE-001'),'EXEMPLE-COMMANDE-001');
});
