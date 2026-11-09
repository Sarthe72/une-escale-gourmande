import { env } from 'cloudflare:workers';
import { dishes, pickups, validateOrder } from '../../../lib/holidayOrders.js';
import {invoiceFromRow} from '../../../lib/holidayInvoices.js';
import {validDeviceKey,verifyDeviceProof} from '../../../lib/crmDeviceAuth.js';
import {scheduledFlag} from '../../../lib/holidaySchedule.js';
export const prerender = false;
const hash = async text => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))), b => b.toString(16).padStart(2, '0')).join('');
export async function ALL({ request, params }) {
  const origin = request.headers.get('Origin');
  const allowed = (env.HOLIDAY_ALLOWED_ORIGINS || '').split(',').filter(Boolean);
  const same = new URL(request.url).origin;
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin' };
  if (origin && (origin === same || allowed.includes(origin))) headers['Access-Control-Allow-Origin'] = origin;
  const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
  if (origin && origin !== same && !allowed.includes(origin)) return reply({ error: 'Origine refusée.' }, 403);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, Idempotency-Key' } });
  const route = params.path;
  if (route === 'catalog' && request.method === 'GET') {
    const available=pickups.filter(pickup=>{const deadline=Date.parse(env[`HOLIDAY_DEADLINE_${pickup.group}`]);return Number.isFinite(deadline)&&Date.now()<deadline;});
    return reply({dishes,pickups:available,opensAt:env.HOLIDAY_LAUNCH_AT||null,open:scheduledFlag(env.HOLIDAY_ORDERS_OPEN,env.HOLIDAY_LAUNCH_AT)&&available.length>0,campaignVisible:scheduledFlag(env.HOLIDAY_CAMPAIGN_VISIBLE,env.HOLIDAY_LAUNCH_AT),address:'5 place du Vieux Pont, 24800 Saint-Jean-de-Côle'});
  }
  const db = env.HOLIDAY_DB;
  if (!db) return reply({ error: 'Service de commandes non configuré.' }, 503);
  try {
    let body;
    if (['POST', 'PATCH'].includes(request.method)) {
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply({ error: 'Format refusé.' }, 415);
      const raw = await request.text();
      if (raw.length > 12000) return reply({ error: 'Demande trop volumineuse.' }, 413);
      try { body = JSON.parse(raw); } catch { return reply({ error: 'Demande invalide.' }, 400); }
      if (!body || typeof body !== 'object') return reply({ error: 'Demande invalide.' }, 400);
    }
    if (['login','challenge','pair','orders'].includes(route) && request.method === 'POST') {
      const bucket = `${route}:${await hash(request.headers.get('CF-Connecting-IP') || 'local')}:${Math.floor(Date.now() / 900000)}`;
      const rate = await db.prepare('INSERT INTO holiday_limits(bucket,count) VALUES (?,1) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count').bind(bucket).first();
      if (rate.count > (route === 'orders' ? 30 : 10)) return reply({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' }, 429);
    }
    if(route==='pair'&&request.method==='POST'){
      if(typeof body.token!=='string'||!/^[a-f0-9]{64}$/.test(body.token)||!validDeviceKey(body.publicKey))return reply({error:'Lien d’association invalide.'},400);
      const id=crypto.randomUUID(),now=Date.now();
      const publicKey={kty:'EC',crv:'P-256',x:body.publicKey.x,y:body.publicKey.y};
      const result=await db.batch([
        db.prepare('INSERT INTO holiday_crm_devices(id,public_key,created_at) SELECT ?,?,? FROM holiday_crm_pairings WHERE token_hash=? AND expires>? AND used_at IS NULL').bind(id,JSON.stringify(publicKey),new Date(now).toISOString(),await hash(body.token),now),
        db.prepare('UPDATE holiday_crm_pairings SET used_at=? WHERE token_hash=? AND expires>? AND used_at IS NULL').bind(now,await hash(body.token),now),
      ]);
      if(!result[0].meta.changes)return reply({error:'Ce lien d’association a expiré ou a déjà été utilisé.'},401);
      return reply({deviceId:id});
    }
    if(route==='challenge'&&request.method==='POST'){
      const device=await db.prepare('SELECT id FROM holiday_crm_devices WHERE id=? AND revoked=0').bind(String(body.deviceId||'')).first();
      if(!device)return reply({error:'Cet appareil doit être associé au CRM.'},401);
      const id=crypto.randomUUID(),challenge=crypto.randomUUID()+crypto.randomUUID();
      await db.batch([db.prepare('DELETE FROM holiday_crm_challenges WHERE expires<?').bind(Date.now()),db.prepare('INSERT INTO holiday_crm_challenges VALUES(?,?,?,?)').bind(id,device.id,challenge,Date.now()+60000)]);
      return reply({id,challenge});
    }
    if (route === 'login' && request.method === 'POST') {
      const device=await db.prepare('SELECT public_key FROM holiday_crm_devices WHERE id=? AND revoked=0').bind(String(body.deviceId||'')).first();
      const challenge=await db.prepare('DELETE FROM holiday_crm_challenges WHERE id=? AND device_id=? AND expires>? RETURNING challenge').bind(String(body.challengeId||''),String(body.deviceId||''),Date.now()).first();
      if(!device||!challenge||!await verifyDeviceProof(JSON.parse(device.public_key),challenge.challenge,body.signature))return reply({error:'Accès refusé.'},401);
      const token = crypto.randomUUID() + crypto.randomUUID();
      await db.prepare('INSERT INTO holiday_sessions VALUES (?,?)').bind(await hash(token), Date.now() + 8 * 3600000).run();
      await db.batch([db.prepare('DELETE FROM holiday_sessions WHERE expires < ?').bind(Date.now()), db.prepare('DELETE FROM holiday_limits WHERE bucket NOT LIKE ?').bind(`%:${Math.floor(Date.now() / 900000)}`)]);
      return reply({ token });
    }
    if ((route === 'orders' || route === 'orders/manual') && request.method === 'POST') {
      if (route === 'orders/manual') {
        const adminToken = request.headers.get('Authorization')?.replace(/^Bearer /, '') || '';
        const adminSession = adminToken && await db.prepare('SELECT expires FROM holiday_sessions WHERE token_hash=?').bind(await hash(adminToken)).first();
        if (!adminSession || adminSession.expires <= Date.now()) return reply({error:'Reconnectez-vous au CRM.'},401);
        if (!['phone','email'].includes(body.source)) return reply({error:'Choisissez téléphone ou e-mail.'},400);
      }
      let order;
      try { order = validateOrder(body, env); } catch (error) { return reply({ error: error.message }, 400); }
      order.source = route === 'orders/manual' ? body.source : 'website';
      const key = request.headers.get('Idempotency-Key') || '';
      if (!/^[a-f0-9-]{36}$/i.test(key)) return reply({ error: 'Identifiant de demande manquant.' }, 400);
      const fingerprint = await hash(JSON.stringify(order));
      const id = crypto.randomUUID(); const now = new Date().toISOString();
      await db.prepare('INSERT INTO holiday_orders(id,request_key,fingerprint,created_at,pickup,payload,updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(request_key) DO NOTHING').bind(id, key, fingerprint, now, order.pickup, JSON.stringify(order), now).run();
      const saved = await db.prepare('SELECT id,fingerprint FROM holiday_orders WHERE request_key=?').bind(key).first();
      if (saved.fingerprint !== fingerprint) return reply({ error: 'Cette demande a déjà été utilisée. Recommencez.' }, 409);
      return reply({ id: saved.id, total: order.total, status: 'confirmed' }, 201);
    }
    const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') || '';
    const session = token && await db.prepare('SELECT expires FROM holiday_sessions WHERE token_hash=?').bind(await hash(token)).first();
    if (!session || session.expires <= Date.now()) return reply({ error: 'Reconnectez-vous au CRM.' }, 401);
    if(route==='session' && request.method==='GET') return reply({ok:true,expires:session.expires});
    if (route === 'logout' && request.method === 'POST') { await db.prepare('DELETE FROM holiday_sessions WHERE token_hash=?').bind(await hash(token)).run(); return reply({ ok: true }); }
    if (route === 'orders' && request.method === 'GET') {
      const rows = await db.prepare("SELECT o.*,i.sequence AS invoice_sequence,(SELECT state FROM holiday_mail m WHERE m.event_key='invoice:'||o.id) AS invoice_mail_status FROM holiday_orders o LEFT JOIN holiday_invoices i ON i.order_id=o.id ORDER BY o.pickup,o.created_at LIMIT 1001").all();
      if (rows.results.length > 1000) return reply({ error: 'Volume trop important : export nécessaire.' }, 409);
      return reply({ orders: rows.results.map(r => ({ ...JSON.parse(r.payload), id: r.id, createdAt: r.created_at, status: r.status, paid: !!r.paid, version: r.version,paidAt:r.paid_at,collectedAt:r.collected_at,invoiceMailStatus:r.invoice_mail_status||null,invoiceId:r.invoice_sequence?`holiday-invoice-${r.invoice_sequence}`:undefined })) });
    }
    if(route==='invoices' && request.method==='GET') {
      const rows=await db.prepare('SELECT i.*,o.paid,o.paid_at FROM holiday_invoices i JOIN holiday_orders o ON o.id=i.order_id ORDER BY i.sequence DESC LIMIT 1001').all();
      if(rows.results.length>1000)return reply({error:'Volume trop important : export nécessaire.'},409);
      return reply({invoices:rows.results.map(invoiceFromRow)});
    }
    if (route?.startsWith('orders/') && request.method === 'PATCH') {
      if (!['confirmed', 'collected', 'cancelled'].includes(body.status) || typeof body.paid !== 'boolean' || !Number.isInteger(body.version)) return reply({ error: 'Modification invalide.' }, 400);
      if(body.status==='collected'&&!body.paid || body.status==='confirmed'&&body.paid) return reply({error:'Le paiement et le retrait se valident ensemble.'},400);
      if(body.status==='collected'&&env.HOLIDAY_VAT_MODE!=='exempt_293b')return reply({error:'Les paramètres de facturation doivent être validés avant encaissement.'},503);
      const now=new Date().toISOString();
      const result = await db.prepare('UPDATE holiday_orders SET status=?,paid=?,version=version+1,updated_at=?,paid_at=?,collected_at=? WHERE id=? AND version=?').bind(body.status, +body.paid, now,body.paid?now:null,body.status==='collected'?now:null,route.slice(7),body.version).run();
      return result.meta.changes ? reply({ ok: true }) : reply({ error: 'Commande modifiée entre-temps. Actualisez.' }, 409);
    }
    return reply({ error: 'Page introuvable.' }, 404);
  } catch { return reply({ error: 'Enregistrement impossible. Réessayez sans modifier votre commande.' }, 503); }
}
