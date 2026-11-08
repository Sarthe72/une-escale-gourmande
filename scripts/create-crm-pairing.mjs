// Owner-only command. The link grants one device access and must remain private.
// It is created when enrolling the phone, not during a public build.
import {randomBytes,createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
if(!process.argv.includes('--production'))throw Error('Passer --production uniquement pour associer un appareil autorisé.');
const token=randomBytes(32).toString('hex');
const hash=createHash('sha256').update(token).digest('hex');
const expires=Date.now()+24*3600000;
execFileSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','execute','escale-commandes-fetes','--remote','--config','wrangler.orders-production.jsonc','--command',`INSERT INTO holiday_crm_pairings(token_hash,expires) VALUES ('${hash}',${expires})`],{env:{...process.env,CLOUDFLARE_ACCOUNT_ID:'a8ef483748a8075bf90d197e2d5b6977'},stdio:['ignore','pipe','pipe']});
console.log('Lien privé à ouvrir sur l’appareil de Benjamin. Usage unique, valide 24 heures. Ne pas publier.');
console.log(`https://sarthe72.github.io/escale-pro/#/?associer=${token}`);
