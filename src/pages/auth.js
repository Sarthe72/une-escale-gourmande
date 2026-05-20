export const prerender = false;

export async function GET({ request }) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state') || '';

  const params = new URLSearchParams({
    client_id: 'Ov23lijkbcPjPqGylzVm',
    redirect_uri: 'https://une-escale-gourmande.passe-melvin.workers.dev/callback',
    scope: 'repo,user',
    state,
  });

  return new Response(null, {
    status: 302,
    headers: { Location: `https://github.com/login/oauth/authorize?${params}` },
  });
}
