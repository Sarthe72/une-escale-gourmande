import { env } from 'cloudflare:workers';

export const prerender = false;

export async function GET({ request }) {
  const html = (body) =>
    new Response(`<!doctype html><html><body style="font-family:sans-serif;padding:20px">${body}</body></html>`, {
      headers: { 'Content-Type': 'text/html' },
    });

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const clientSecret = env.GITHUB_CLIENT_SECRET ?? '';

    const resp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: 'Ov23lijkbcPjPqGylzVm', client_secret: clientSecret, code }),
    });

    const data = await resp.json();
    if (data.error) throw new Error(data.error_description || data.error);

    const token = data.access_token;
    const authMsg = JSON.stringify(`authorization:github:success:${JSON.stringify({ token, provider: 'github' })}`);

    return html(`
      <p>Authentification en cours...</p>
      <script>
        (function() {
          var msg = ${authMsg};
          function receiveMessage(e) {
            window.opener.postMessage(msg, '*');
            window.removeEventListener('message', receiveMessage, false);
            window.close();
          }
          window.addEventListener('message', receiveMessage, false);
          window.opener.postMessage('authorizing:github', '*');
        }());
      </script>
    `);
  } catch (err) {
    return html(`<p style="color:red">Erreur: ${err.message}</p>`);
  }
}
