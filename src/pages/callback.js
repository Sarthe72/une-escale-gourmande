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
    const msg = `authorization:github:success:${JSON.stringify({ token, provider: 'github' })}`;
    const msgJson = JSON.stringify(msg);

    return html(`
      <p id="status">Envoi du token...</p>
      <p id="info"></p>
      <script>
        var msg = ${msgJson};
        var info = document.getElementById('info');
        var status = document.getElementById('status');
        info.textContent = 'opener: ' + (window.opener ? 'OUI' : 'NULL');
        if (window.opener) {
          try {
            window.opener.postMessage(msg, '*');
            status.textContent = 'Token envoyé !';
          } catch(e) {
            status.textContent = 'Erreur postMessage: ' + e.message;
          }
        } else {
          status.textContent = 'window.opener est NULL — impossible d\\'envoyer le token';
        }
        setTimeout(function(){ window.close(); }, 4000);
      </script>
    `);
  } catch (err) {
    return html(`<p style="color:red">Erreur: ${err.message}</p>`);
  }
}
