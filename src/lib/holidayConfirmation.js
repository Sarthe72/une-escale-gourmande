import {holidayReference} from './holidayReference.js';
import {pickups} from './holidayOrders.js';
const euro=value=>(value/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
export function confirmationMessage(id,order,sequence){
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email))throw Error('Confirmation email missing');
 const pickup=pickups.find(p=>p.id===order.pickup);
 if(!pickup)throw Error('Confirmation pickup missing');
 const payment={cash:'Espèces',cheque:'Chèque',instant_transfer:'Virement immédiat'}[order.payment];
 const message={to:[order.email],subject:'Votre commande est confirmée · Une Escale Gourmande',text:`Bonjour ${order.firstName},\n\nVotre commande est bien enregistrée.\nRéférence : ${holidayReference(id,sequence)}\n\n${order.items.map(item=>`${item.quantity} × ${item.name} — ${euro(item.price*item.quantity)}`).join('\n')}\n\nTotal à régler au retrait : ${euro(order.total)}\nPaiement : ${payment}\n\nRetrait : ${pickup.label}\n5 place du Vieux Pont, 24800 Saint-Jean-de-Côle\n${order.notes?'\nVos informations complémentaires : '+order.notes+'\n':''}\nAucun paiement n’a été prélevé en ligne. Votre facture vous sera envoyée après paiement et retrait.\nPour toute question ou modification : 06 25 14 26 08 ou répondez à cet e-mail.\n\nMerci et à bientôt,\nUne Escale Gourmande`};
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 message.html=`<meta charset="utf-8"><div style="background:#f7f1e5;padding:24px 12px;font-family:Arial,sans-serif;color:#19382d"><div style="max-width:580px;margin:auto;background:#fffdf7;border:1px solid #d7bd82;padding:28px 24px"><div style="text-align:center"><img src="https://uneescalegourmande.fr/images/logo-email.png" width="100" height="120" alt="Une Escale Gourmande" style="display:block;margin:0 auto 16px"><h1 style="font-family:Georgia,serif;font-size:26px;font-weight:normal">Votre commande est confirmée</h1></div><div style="font-size:15px;line-height:1.7;white-space:pre-line">${escape(message.text)}</div></div></div>`;
 return message;
}
