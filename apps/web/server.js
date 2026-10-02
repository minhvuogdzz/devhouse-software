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
