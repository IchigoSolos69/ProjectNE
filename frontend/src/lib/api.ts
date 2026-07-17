const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  
  const headers = new Headers(options.headers || {});
  
  // Attach content type if body is present and not FormData (for Cloudinary direct uploads)
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Fallback Option B: Read JWT token from localStorage and append as Bearer header
  const token = localStorage.getItem('rc_session_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Option A: crucial for cross-domain cookie exchange
  };

  const response = await fetch(url, mergedOptions);

  if (!response.ok) {
    let errorMessage = 'An error occurred on the server.';
    try {
      const errorJson = await response.json();
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      // ignore JSON parse error for text/html errors
    }
    throw new Error(errorMessage);
  }

  // Handle successful logout or empty JSON response
  if (response.status === 204 || path.includes('/logout')) {
    return {} as T;
  }

  return response.json();
}
