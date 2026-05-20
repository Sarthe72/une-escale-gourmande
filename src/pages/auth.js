export const prerender = false;

export async function GET({ request, locals }) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state') || '';
  const clientId = locals.runtime?.env?.GITHUB_CLIENT_ID ?? 'Ov23lijkbcPjPqGylzVm';

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: 'https://une-escale-gourmande.passe-melvin.workers.dev/callback',
    scope: 'repo,user',
    state,
  });

  return Response.redirect(`https://github.com/login/oauth/authorize?${params}`, 302);
}
