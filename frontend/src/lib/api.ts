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

  // ✅ FIX #2: Check content-type BEFORE parsing to prevent HTML/JSON crashes
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    let errorMessage = 'An error occurred on the server.';
    
    // Only try to parse JSON if content-type is actually JSON
    if (isJson) {
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch (parseError) {
        console.error('[API] Failed to parse error response as JSON:', parseError);
        errorMessage = `Server returned ${response.status} ${response.statusText}`;
      }
    } else {
      // Server returned HTML or plain text (likely 404 or 500 error page)
      const textResponse = await response.text();
      console.error('[API] Non-JSON error response:', textResponse.substring(0, 200));
      errorMessage = `Server error (${response.status}): Expected JSON, received ${contentType || 'unknown'} content`;
    }
    
    throw new Error(errorMessage);
  }

  // Handle successful logout or empty JSON response
  if (response.status === 204 || path.includes('/logout')) {
    return {} as T;
  }

  // ✅ FIX #2: Validate JSON response before parsing
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
