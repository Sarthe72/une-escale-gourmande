// Owner-only smoke test. No order, invoice, PIN or private key is persisted.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {randomBytes,createHash} from 'node:crypto';
if(!process.argv.includes('--production'))throw Error('Confirmation --production requise.');
const sql=command=>execFileSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','execute','escale-commandes-fetes','--remote','--config','wrangler.orders-production.jsonc','--command',command],{env:{...process.env,CLOUDFLARE_ACCOUNT_ID:'a8ef483748a8075bf90d197e2d5b6977'},stdio:['ignore','pipe','pipe']});
const call=async(path,body,token)=>{
 const response=await fetch('https://uneescalegourmande.fr/api/holiday/'+path,{method:body?'POST':'GET',headers:{Origin:'https://sarthe72.github.io',...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
 return {status:response.status,data:await response.json()};
};
const token=randomBytes(32).toString('hex');const hash=createHash('sha256').update(token).digest('hex');
sql(`INSERT INTO holiday_crm_pairings(token_hash,expires) VALUES ('${hash}',${Date.now()+300000})`);
let deviceId,session;
try{
 const keys=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},false,['sign','verify']);
 const publicKey=await crypto.subtle.exportKey('jwk',keys.publicKey);
 const pair=await call('pair',{token,publicKey});assert.equal(pair.status,200);deviceId=pair.data.deviceId;
 assert.match(deviceId,/^[a-f0-9-]{36}$/);
 assert.equal((await call('pair',{token,publicKey})).status,401);
 const challenge=await call('challenge',{deviceId});assert.equal(challenge.status,200);
 const signature=Buffer.from(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},keys.privateKey,new TextEncoder().encode(challenge.data.challenge))).toString('base64url');
 const proof={deviceId,challengeId:challenge.data.id,signature};
 const login=await call('login',proof);assert.equal(login.status,200);session=login.data.token;
 assert.equal((await call('login',proof)).status,401);
 assert.equal((await call('orders')).status,401);
 assert.equal((await call('orders',undefined,session)).status,200);
 assert.equal((await call('invoices',undefined,session)).status,200);
 assert.equal((await call('logout',{},session)).status,200);
 assert.equal((await call('orders',undefined,session)).status,401);
 console.log('PASS production : association unique, connexion signée, commandes/factures protégées, rejet du rejeu et déconnexion. Aucun document créé.');
}finally{
 if(session)await call('logout',{},session).catch(()=>{});
 if(deviceId)sql(`UPDATE holiday_crm_devices SET revoked=1 WHERE id='${deviceId}'`);
}
