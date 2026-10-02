import { redirect } from 'react-router';
import { apiClient } from '../lib/api-client.js';
import NotFoundPage, { loader as notFoundLoader, meta as notFoundMeta } from './not-found.jsx';

export async function loader(args) {
  const url = new URL(args.request.url);
  const path = url.pathname;

  try {
    const res = await apiClient(`/seo/redirects/resolve?path=${encodeURIComponent(path)}`);
    const target = res?.data;
    if (target && target.destination) {
      return redirect(target.destination, {
        status: target.statusCode || 301,
      });
    }
  } catch {
    // If redirect check fails or returns 404, proceed to not-found loader
  }

  // notFoundLoader throws a 404 Response — let it propagate
  return notFoundLoader(args);
}

export const meta = notFoundMeta;

// The ErrorBoundary from not-found catches the thrown 404 Response
export { NotFoundPage as ErrorBoundary };
export default NotFoundPage;
