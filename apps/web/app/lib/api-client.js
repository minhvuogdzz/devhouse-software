export class ApiError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return '/api/v1';
  }
  return process.env.API_INTERNAL_URL || 'http://localhost:4000/api/v1';
}

export async function apiClient(endpoint, options = {}) {
  const baseUrl = getBaseUrl().replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : null;

    if (!res.ok) {
      throw new ApiError(
        data?.error?.message || `Request failed with status ${res.status}`,
        res.status,
        data?.error?.code || 'API_ERROR',
        data?.error?.details || null,
      );
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network error', 503, 'NETWORK_ERROR');
  }
}
