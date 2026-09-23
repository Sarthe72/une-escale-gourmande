export const prerender = false;

export async function GET({ request }) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state') || '';
  const redirectUri = `${url.origin}/callback`;

  const params = new URLSearchParams({
    client_id: 'Ov23lijkbcPjPqGylzVm',
    redirect_uri: redirectUri,
    scope: 'repo,user',
    state,
  });

  return new Response(null, {
    status: 302,
    headers: { Location: `https://github.com/login/oauth/authorize?${params}` },
  });
}
