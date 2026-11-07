import test from 'node:test';
import assert from 'node:assert/strict';
import {holidayInvoicePdf} from '../src/lib/holidayInvoicePdf.js';
import {drainMail} from '../workers/holiday-mail.js';
test('alerte désactivée : aucune lecture ni transmission',async()=>assert.deepEqual(await drainMail({},()=>{throw Error('No mail allowed')}),{disabled:true}));
test('configuration incomplète : aucune transmission',async()=>assert.rejects(()=>drainMail({HOLIDAY_MAIL_ENABLED:'true'},()=>{throw Error('No mail allowed')}),/configuration/));
test('facture PDF générée depuis le snapshot serveur',()=>{
 const bytes=holidayInvoicePdf({number:'FAC-NOEL-000001',order_id:'test',issued_at:'2026-12-24T14:00:00Z',snapshot:JSON.stringify({firstName:'Client',name:'Exemple',email:'client@example.com',phone:'0600000000',pickup:'2026-12-24',payment:'cash',total:1500,items:[{name:'Lotte à l’américaine',price:1500,quantity:1}]})});
 assert.equal(new TextDecoder().decode(bytes.slice(0,5)),'%PDF-');assert.ok(bytes.length>2000);
});
function fakeMailDb(paid=true){
 const state={job:{event_key:'invoice:test',kind:'invoice',order_id:'test',attempts:0},status:'pending'};
 const invoice={number:'FAC-NOEL-000001',order_id:'test',issued_at:'2026-12-24T14:00:00Z',snapshot:JSON.stringify({firstName:'Client',name:'Exemple',email:'client@example.com',phone:'0600000000',pickup:'2026-12-24',payment:'cash',total:1500,items:[{name:'Lotte à l’américaine',price:1500,quantity:1}]})};
 return {state,prepare(sql){return {bind(){return this;},async all(){return {results:state.status==='pending'?[state.job]:[]}},async first(){if(sql.includes('FROM holiday_orders'))return {paid:paid?1:0,status:paid?'collected':'confirmed'};if(sql.includes('FROM holiday_invoices'))return invoice;return {attempts:1};},async run(){if(sql.includes("state='processing'"))state.status='processing';else if(sql.includes("state='cancelled'"))state.status='cancelled';else if(sql.includes("state='sent'"))state.status='sent';else state.status='pending';return {meta:{changes:1}};}};}};
}
test('mail de facture : PDF joint, destinataire du snapshot, absence de double envoi',async()=>{
 const db=fakeMailDb();let sent=0;
 const send=async(url,options)=>{sent++;const body=JSON.parse(options.body);assert.equal(url,'https://api.resend.com/emails');assert.deepEqual(body.to,['client@example.com']);assert.equal(options.headers['Idempotency-Key'],'invoice:test');assert.equal(Buffer.from(body.attachments[0].content,'base64').subarray(0,5).toString(),'%PDF-');return Response.json({id:'provider-test'});};
 const env={HOLIDAY_MAIL_ENABLED:'true',HOLIDAY_DB:db,RESEND_API_KEY:'test-only',HOLIDAY_MAIL_FROM:'Test <test@example.com>',HOLIDAY_MAIL_TO:'merchant@example.com'};
 await drainMail(env,send);await drainMail(env,send);assert.equal(sent,1);assert.equal(db.state.status,'sent');
});
test('correction avant envoi : la facture ne part pas',async()=>{
 const db=fakeMailDb(false);await drainMail({HOLIDAY_MAIL_ENABLED:'true',HOLIDAY_DB:db,RESEND_API_KEY:'test-only',HOLIDAY_MAIL_FROM:'test@example.com',HOLIDAY_MAIL_TO:'merchant@example.com'},()=>{throw Error('Unexpected transmission')});assert.equal(db.state.status,'cancelled');
});
