const DEFAULT_API_URL = 'https://projectne.onrender.com/api';

/** Absolute Render backend base URL (includes `/api`). */
export const API_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
).replace(/\/$/, '');

/**
 * Builds an absolute API URL.
 * Accepts legacy `/api/products` paths and normalized `/products` paths.
 */
export function buildApiUrl(path: string): string {
  let normalized = path.startsWith('/') ? path : `/${path}`;

  if (normalized.startsWith('/api/')) {
    normalized = normalized.slice(4);
  } else if (normalized === '/api') {
    normalized = '';
  }

  return `${API_URL}${normalized}`;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildApiUrl(path);

  const headers = new Headers(options.headers || {});

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem('rc_session_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  const response = await fetch(url, mergedOptions);

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json') ?? false;

  if (!response.ok) {
    let errorMessage = 'An error occurred on the server.';

    if (isJson) {
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch (parseError) {
        console.error('[API] Failed to parse error response as JSON:', parseError);
        errorMessage = `Server returned ${response.status} ${response.statusText}`;
      }
    } else {
      const textResponse = await response.text();
      console.error('[API] Non-JSON error response:', textResponse.substring(0, 200));
      errorMessage = `Server error (${response.status}): Expected JSON, received ${contentType || 'unknown'} content`;
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204 || path.includes('/logout')) {
    return {} as T;
  }

  if (!isJson) {
    console.error('[API] Success response is not JSON. Content-Type:', contentType);
    throw new Error(`API returned non-JSON response. Expected application/json, got ${contentType}`);
  }

  try {
    return await response.json();
  } catch (parseError) {
    console.error('[API] Failed to parse success response as JSON:', parseError);
    throw new Error('Server returned invalid JSON response');
  }
}
