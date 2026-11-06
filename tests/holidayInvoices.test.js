import test from 'node:test';
import assert from 'node:assert/strict';
import {invoiceFromRow} from '../src/lib/holidayInvoices.js';
const row={sequence:12,order_id:'order-1',number:'FAC-NOEL-000012',issued_at:'2026-12-24T14:00:00Z',paid:1,paid_at:'2026-12-24T14:00:00Z',snapshot:JSON.stringify({firstName:'Camille',name:'Exemple',phone:'0600000000',email:'',pickup:'2026-12-24',payment:'cash',items:[{name:'Tartelette',price:1000,quantity:2},{name:'Dessert',price:550,quantity:2}]})};
test('facture partagée conserve numéro, client, paiement et montants en euros',()=>{const invoice=invoiceFromRow(row);assert.equal(invoice.numero,row.number);assert.equal(invoice.clientNom,'Camille Exemple');assert.equal(invoice.paymentMode,'cash');assert.equal(invoice.lignes.reduce((sum,i)=>sum+i.quantite*i.prixUnitaire,0),31);});
test('correction du paiement conserve la facture sans la marquer acquittée',()=>{const invoice=invoiceFromRow({...row,paid:0,paid_at:null});assert.equal(invoice.id,'holiday-invoice-12');assert.equal(invoice.statut,'attente');assert.equal(invoice.datePaiement,'');});
test('dates de facturation dans le fuseau français, même près de minuit',()=>{const invoice=invoiceFromRow({...row,issued_at:'2026-12-24T23:30:00Z',paid_at:'2026-12-24T23:30:00Z'});assert.equal(invoice.dateEnvoi,'2026-12-25');assert.equal(invoice.datePaiement,'2026-12-25');});
