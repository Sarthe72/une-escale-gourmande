export async function GET({ request }) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state') || '';
  const clientId = import.meta.env.GITHUB_CLIENT_ID;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${url.origin}/api/callback`,
    scope: 'repo,user',
    state
  });

  return Response.redirect(`https://github.com/login/oauth/authorize?${params}`, 302);
}
