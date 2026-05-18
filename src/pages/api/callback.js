export async function GET({ request }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  try {
    const resp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: import.meta.env.GITHUB_CLIENT_ID,
        client_secret: import.meta.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const data = await resp.json();
    if (data.error) throw new Error(data.error_description || data.error);

    const content = JSON.stringify({ token: data.access_token, provider: 'github' });
    const msg = JSON.stringify('authorization:github:success:' + content);

    return new Response(
      `<!doctype html><html><body><script>
(function(){
  var m=${msg};
  function cb(e){window.opener.postMessage(m,e.origin);window.close();}
  window.addEventListener('message',cb,false);
  window.opener.postMessage('authorizing:github','*');
})();
<\/script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (err) {
    const errMsg = JSON.stringify('authorization:github:error:' + JSON.stringify({ message: String(err.message) }));
    return new Response(
      `<!doctype html><html><body><script>
window.opener.postMessage(${errMsg},'*');window.close();
<\/script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
