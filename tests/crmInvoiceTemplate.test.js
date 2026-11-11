import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const sha=text=>createHash('sha256').update(text.replace(/\r\n/g,'\n')).digest('hex');
test('le générateur envoyé par mail conserve exactement la mise en page du CRM publié',async()=>{
 const reference=JSON.parse(await readFile(new URL('../docs/FACTURE-MODELE-CRM.json',import.meta.url),'utf8'));
 const template=await readFile(new URL('../src/lib/crmInvoiceTemplate.js',import.meta.url),'utf8');
 const restored=template.replace("from './crmInvoiceConstants.js';","from './constants';").replace('return doc;',"return doc.output('blob');");
 assert.equal(sha(restored),reference.templateSha256);
 assert.equal(sha(await readFile(new URL('../src/lib/crmInvoiceConstants.js',import.meta.url),'utf8')),reference.constantsSha256);
});
