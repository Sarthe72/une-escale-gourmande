import {jsPDF} from 'jspdf';
export function holidayInvoicePdf(row) {
 const order=JSON.parse(row.snapshot);const doc=new jsPDF({unit:'mm',format:'a4'});
 const text=(s,x,y,size=11,bold=false)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.text(String(s).replaceAll('œ','oe'),x,y);};
 text('Une Escale Gourmande',20,23,18,true);
 ['JARDIN Benjamin','1144 route des calvaires','24800 Eyzerac','SIRET : 93942640900016','06 25 14 26 08 · jardinbenjamin@hotmail.fr'].forEach((s,i)=>text(s,20,33+i*5,9));
 text('FACTURE '+row.number,20,71,15,true);
 text('Émise le '+new Date(row.issued_at).toLocaleDateString('fr-FR',{timeZone:'Europe/Paris'}),20,80);
 let customerY=94;
 for(const [value,size,bold] of [[[order.firstName,order.name].join(' '),12,true],[order.email,10,false],[order.phone,10,false]]){
  doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);
  const lines=doc.splitTextToSize(String(value||''),170);
  text(lines.join('\n'),20,customerY,size,bold);customerY+=lines.length*5+3;
 }
 text('Retrait du '+order.pickup.split('-').reverse().join('/'),20,customerY+4,11);
 const ruleY=Math.max(126,customerY+11);
 doc.setDrawColor(180,165,130);doc.line(20,ruleY,190,ruleY);
 let y=ruleY+11;
 const nextPage=()=>{doc.addPage();text('FACTURE '+row.number+' — suite',20,23,13,true);y=40;};
 for(const item of order.items){
  doc.setFont('helvetica','normal');doc.setFontSize(11);
  const lines=doc.splitTextToSize(`${item.quantity} × ${item.name}`,127);
  if(y+Math.max(13,lines.length*5+5)>251)nextPage();
  text(lines.join('\n'),20,y,11);
  text((item.price*item.quantity/100).toFixed(2).replace('.',',')+' EUR',160,y,11);
  y+=Math.max(13,lines.length*5+5);
 }
 if(y+47>263)nextPage();
 doc.line(20,y,190,y);y+=13;
 text('TOTAL : '+(order.total/100).toFixed(2).replace('.',',')+' EUR',115,y,14,true);
 text('TVA non applicable, article 293 B du CGI.',20,y+15,10);
 text('Facture acquittée au retrait.',20,y+26,11,true);
 const modes={cash:'Espèces',cheque:'Chèque',instant_transfer:'Virement immédiat'};
 text('Règlement : '+(modes[order.payment]||order.payment),20,y+34,10);
 text('Référence commande : '+row.order_id,20,276,8);
 return new Uint8Array(doc.output('arraybuffer'));
}
export function pdfBase64(bytes){let raw='';for(const byte of bytes)raw+=String.fromCharCode(byte);return btoa(raw);}
