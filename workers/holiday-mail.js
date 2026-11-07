import {holidayInvoicePdf,pdfBase64} from '../src/lib/holidayInvoicePdf.js';
// No HTTP endpoint: only the scheduler can drain this outbox.
export async function drainMail(env,send=fetch,now=Date.now()) {
 if(env.HOLIDAY_MAIL_ENABLED!=='true')return {disabled:true};
 if(!env.HOLIDAY_DB||!env.RESEND_API_KEY||!env.HOLIDAY_MAIL_FROM||!env.HOLIDAY_MAIL_TO)throw Error('Mail configuration incomplete');
 const db=env.HOLIDAY_DB,seconds=Math.floor(now/1000),day=new Date(now).toISOString().slice(0,10);
 const jobs=await db.prepare("SELECT * FROM holiday_mail WHERE (state='pending' AND next_attempt<=?) OR (state='processing' AND locked_until<?) ORDER BY next_attempt,event_key LIMIT 10").bind(seconds,seconds).all();
 for(const job of jobs.results){
  const claim=await db.prepare("UPDATE holiday_mail SET state='processing',locked_until=?,attempts=attempts+1 WHERE event_key=? AND ((state='pending' AND next_attempt<=?) OR (state='processing' AND locked_until<?))").bind(seconds+180,job.event_key,seconds,seconds).run();
  if(!claim.meta.changes)continue;
  try{
   const orderRow=await db.prepare('SELECT * FROM holiday_orders WHERE id=?').bind(job.order_id).first();
   if(!orderRow||job.kind==='invoice'&&(!orderRow.paid||orderRow.status!=='collected')){
    await db.prepare("UPDATE holiday_mail SET state='cancelled' WHERE event_key=?").bind(job.event_key).run();continue;
   }
   let message;
   if(job.kind==='order')message={to:[env.HOLIDAY_MAIL_TO],subject:'Nouvelle commande de fêtes · Une Escale Gourmande',text:`Une nouvelle commande a été enregistrée.\nRéférence : ${job.order_id}\nConsultez-la dans Escale Pro : https://sarthe72.github.io/escale-pro/#/commandes`};
   else{
    const invoice=await db.prepare('SELECT * FROM holiday_invoices WHERE order_id=?').bind(job.order_id).first();
    if(!invoice?.number)throw Error('Invoice not ready');
    const order=JSON.parse(invoice.snapshot);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email))throw Error('Invoice email missing');
    message={to:[order.email],subject:`Votre facture ${invoice.number} · Une Escale Gourmande`,text:`Bonjour,\n\nVeuillez trouver votre facture acquittée en pièce jointe.\nMerci pour votre commande.\n\nUne Escale Gourmande\n06 25 14 26 08`,attachments:[{filename:invoice.number+'.pdf',content:pdfBase64(holidayInvoicePdf(invoice))}]};
   }
   // Hard cap on attempts, including failures: no uncontrolled usage beyond free plan.
   const slot=await db.prepare('INSERT INTO holiday_mail_days(day,attempts) VALUES (?,1) ON CONFLICT(day) DO UPDATE SET attempts=attempts+1 WHERE attempts<90 RETURNING attempts').bind(day).first();
   if(!slot)throw Error('Daily mail limit');
   const response=await send('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':job.event_key},body:JSON.stringify({from:env.HOLIDAY_MAIL_FROM,reply_to:env.HOLIDAY_MAIL_REPLY_TO||env.HOLIDAY_MAIL_TO,...message})});
   if(!response.ok)throw Error('Provider HTTP '+response.status);
   const result=await response.json();if(!result.id)throw Error('Provider response incomplete');
   await db.prepare("UPDATE holiday_mail SET state='sent',sent_at=?,provider_id=?,last_error=NULL WHERE event_key=?").bind(new Date(now).toISOString(),result.id,job.event_key).run();
  }catch(error){
   // Never log email addresses, the PDF, or provider response bodies.
   const reason=['Daily mail limit','Invoice email missing','Invoice not ready'].includes(error.message)?error.message:'Delivery failed';
   await db.prepare("UPDATE holiday_mail SET state='pending',last_error=?,next_attempt=? WHERE event_key=?").bind(reason,seconds+Math.min(3600,300*2**Math.min(job.attempts,4)),job.event_key).run();
  }
 }
 return {checked:jobs.results.length};
}
export default {async scheduled(_event,env,ctx){ctx.waitUntil(drainMail(env));}};
