export const prerender = false;

export async function GET({ request, locals }) {
  const html = (script) =>
    new Response(`<!doctype html><html><body><script>${script}<\/script></body></html>`, {
      headers: { 'Content-Type': 'text/html' },
    });

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const clientId = 'Ov23lijkbcPjPqGylzVm';
    const clientSecret = locals?.runtime?.env?.GITHUB_CLIENT_SECRET ?? '';

    const resp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });

    const data = await resp.json();
    if (data.error) throw new Error(data.error_description || data.error);

    const msg = JSON.stringify(
      `authorization:github:success:${JSON.stringify({ token: data.access_token, provider: 'github' })}`
    );

    return html(`
      (function(){
        var msg=${msg};
        function onMsg(e){
          window.removeEventListener('message',onMsg);
          window.opener.postMessage(msg,e.origin);
          window.close();
        }
        window.addEventListener('message',onMsg);
        window.opener.postMessage('authorizing:github','*');
      })();
    `);
  } catch (err) {
    const errMsg = JSON.stringify(`authorization:github:error:${String(err.message)}`);
    return html(`window.opener.postMessage(${errMsg},'*');window.close();`);
  }
}
