import { env } from 'cloudflare:workers';
import { authorizedToken, validateAnswers } from '../../lib/holidayQuestionnaire.js';
export const prerender = false;
const headers = { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
export async function POST({ request }) {
  if (!authorizedToken(request.headers.get('authorization')?.replace(/^Bearer /, ''), env.HOLIDAY_QUESTIONNAIRE_TOKEN)) return json({ error: 'Lien non valide.' }, 403);
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'Origine non autorisée.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Format non valide.' }, 415);
  if (Number(request.headers.get('content-length')) > 45000) return json({ error: 'Réponses trop longues.' }, 413);
  try {
    const body = await request.text();
    if (body.length > 45000) return json({ error: 'Réponses trop longues.' }, 413);
    const answers = validateAnswers(JSON.parse(body).answers);
    if (!answers) return json({ error: 'Vérifie les réponses (2 000 caractères maximum par question).' }, 400);
    if (!env.SESSION) return json({ error: 'Enregistrement indisponible. Tes réponses restent sur cet appareil.' }, 503);
    const id = crypto.randomUUID();
    await env.SESSION.put(`holiday-questionnaire:2026:${id}`, JSON.stringify({ id, submittedAt: new Date().toISOString(), answers }), { expirationTtl: 60 * 60 * 24 * 180 });
    return json({ ok: true, reference: id });
  } catch {
    return json({ error: 'Impossible d’enregistrer pour le moment. Tes réponses restent sur cet appareil : réessaie.' }, 500);
  }
}
