const businessDate=value=>value?new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value)):'';
export function invoiceFromRow(row) {
 const order=JSON.parse(row.snapshot);
 return {
  id:`holiday-invoice-${row.sequence}`,orderId:row.order_id,numero:row.number,
  clientCivilite:'',clientNom:[order.firstName,order.name].filter(Boolean).join(' '),
  clientAdresse:'',clientTel:order.phone,clientEmail:order.email,
  prestationType:'commandes_noel',datePrestation:order.pickup,
  dateEnvoi:businessDate(row.issued_at),createdAt:row.issued_at,
  datePaiement:businessDate(row.paid_at),statut:row.paid?'payee':'attente',
  description:`Commande Noël ${row.order_id}`,paymentMode:order.payment,
  lignes:order.items.map(item=>({description:item.name,quantite:item.quantity,prixUnitaire:item.price/100})),
  tva:'0',vatMode:'exempt_293b',acompte:0,
  notes:row.paid?'Paiement reçu au retrait.':'Validation du paiement annulée : montant restant à régler.',
 };
}
