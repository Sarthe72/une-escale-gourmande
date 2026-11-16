import {pickups} from './holidayOrders.js';
const euro=value=>(value/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
export function confirmationMessage(id,order){
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email))throw Error('Confirmation email missing');
 const pickup=pickups.find(p=>p.id===order.pickup);
 if(!pickup)throw Error('Confirmation pickup missing');
 const payment={cash:'Espèces',cheque:'Chèque',instant_transfer:'Virement immédiat'}[order.payment];
 return {to:[order.email],subject:'Votre commande est confirmée · Une Escale Gourmande',text:`Bonjour ${order.firstName},\n\nVotre commande est bien enregistrée.\nRéférence : ${id}\n\n${order.items.map(item=>`${item.quantity} × ${item.name} — ${euro(item.price*item.quantity)}`).join('\n')}\n\nTotal à régler au retrait : ${euro(order.total)}\nPaiement : ${payment}\n\nRetrait : ${pickup.label}\n5 place du Vieux Pont, 24800 Saint-Jean-de-Côle\n${order.notes?'\nVos informations complémentaires : '+order.notes+'\n':''}\nAucun paiement n’a été prélevé en ligne. Votre facture vous sera envoyée après paiement et retrait.\nPour toute question ou modification : 06 25 14 26 08 ou répondez à cet e-mail.\n\nMerci et à bientôt,\nUne Escale Gourmande`};
}
