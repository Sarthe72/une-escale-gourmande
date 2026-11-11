import {genFacturePDF} from './crmInvoiceTemplate.js';
import {invoiceFromRow} from './holidayInvoices.js';
// The mail worker calls this only after checking payment AND collection.
// Layout is the existing CRM template; no independent mail invoice design.
export function holidayInvoicePdf(row){
 const invoice=invoiceFromRow({...row,paid:1});
 const doc=genFacturePDF({...invoice,example:!!row.test});
 return new Uint8Array(doc.output('arraybuffer'));
}
export function pdfBase64(bytes){let raw='';for(const byte of bytes)raw+=String.fromCharCode(byte);return btoa(raw);}
