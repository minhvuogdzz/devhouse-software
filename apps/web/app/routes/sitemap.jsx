import { apiClient } from '../lib/api-client.js';

export async function loader() {
  let entries = [];
  try {
    const res = await apiClient('/seo/sitemap');
    entries = res.data || [];
  } catch {
    entries = [];
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .map(entry => {
    const alternatesXml = (entry.alternates || [])
      .map(alt => `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.href}" />`)
      .join('\n');

    return `  <url>
    <loc>${entry.loc}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''}${entry.changefreq ? `\n    <changefreq>${entry.changefreq}</changefreq>` : ''}${entry.priority ? `\n    <priority>${entry.priority}</priority>` : ''}
${alternatesXml}
  </url>`;
  })
  .join('\n')}
</urlset>`.trim();

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
