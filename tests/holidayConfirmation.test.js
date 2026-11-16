import test from 'node:test';
import assert from 'node:assert/strict';
import {confirmationMessage} from '../src/lib/holidayConfirmation.js';
const order={email:'client@example.com',firstName:'Client',pickup:'2026-12-24',payment:'cheque',total:5900,notes:'Deux sacs',items:[{name:'Lotte à l’américaine',quantity:2,price:1500},{name:'Autres plats',quantity:1,price:2900}]};
test('confirmation client : destinataire, plats, total, retrait et paiement sans facture',()=>{
 const message=confirmationMessage('reference-test',order);
 assert.deepEqual(message.to,['client@example.com']);
 for(const text of ['reference-test','2 × Lotte','59,00','24 décembre · 14 h–18 h','Chèque','Deux sacs','5 place du Vieux Pont'])assert.ok(message.text.includes(text),text);
 assert.equal(message.attachments,undefined);
});
test('confirmation invalide refusée',()=>{
 assert.throws(()=>confirmationMessage('test',{...order,email:'invalide'}));
 assert.throws(()=>confirmationMessage('test',{...order,pickup:'inconnu'}));
});
