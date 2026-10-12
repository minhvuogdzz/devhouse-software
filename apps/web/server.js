import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequestHandler } from '@react-router/express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');

// Healthcheck endpoint
app.get('/healthz', (_req, res) => {
  res.status(200).type('text/plain').send('ok');
});

// Static assets serving
const clientBuildDir = path.resolve(__dirname, 'build/client');

// Hashed build assets can be cached aggressively
app.use(
  '/assets',
  express.static(path.join(clientBuildDir, 'assets'), {
    immutable: true,
    maxAge: '1y',
  }),
);

// Other client build files (icons, robots, etc.)
app.use(
  express.static(clientBuildDir, {
    maxAge: '1h',
  }),
);

// Proxy same-origin /api/v1/* calls when web container is accessed directly without edge nginx
const apiInternalBase = (process.env.API_INTERNAL_URL || 'http://localhost:4000/api/v1').replace(
  /\/+$/,
  '',
);

app.use('/api/v1', async (req, res) => {
  try {
    const targetUrl = `${apiInternalBase}${req.url}`;
    const headers = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (v !== undefined && !['host', 'connection', 'content-length'].includes(k.toLowerCase())) {
        headers[k] = v;
      }
    }

    const hasBody = !['GET', 'HEAD'].includes(req.method);
    const bodyChunks = [];
    if (hasBody) {
      for await (const chunk of req) {
        bodyChunks.push(chunk);
      }
    }

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: hasBody && bodyChunks.length > 0 ? Buffer.concat(bodyChunks) : undefined,
      redirect: 'manual',
    });

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'content-encoding', 'content-length'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });
    const setCookies = upstream.headers.getSetCookie?.() || [];
    if (setCookies.length > 0) {
      res.setHeader('set-cookie', setCookies);
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.send(buf);
  } catch (err) {
    res.status(502).json({
      error: {
        code: 'BAD_GATEWAY',
        message: err?.message || 'Upstream API unavailable',
      },
    });
  }
});

// Pass all other requests to React Router SSR request handler
app.all(
  '*',
  createRequestHandler({
    build: () => import('./build/server/index.js'),
  }),
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.info(`Web SSR server listening on http://localhost:${port}`);
});
