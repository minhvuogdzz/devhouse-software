export async function loader({ request }) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const content = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin

Sitemap: ${baseUrl}/sitemap.xml
`.trim();

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
