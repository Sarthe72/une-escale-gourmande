export const prerender = false;

export async function GET({ request }) {
  const url = new URL(request.url);

  return Response.redirect(`${url.origin}/callback${url.search}`, 302);
}
