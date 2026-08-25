let cachedCsrfToken = null;

/**
 * Fetches the CSRF token from the backend.
 * Uses a cached token if already fetched during this session.
 */
export const getCsrfToken = async () => {
  if (cachedCsrfToken) return cachedCsrfToken;

  try {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include' // Important: ensures the CSRF cookie is set
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    
    const data = await response.json();
    cachedCsrfToken = data.csrfToken;
    return cachedCsrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
};

/**
 * A wrapper around native fetch that automatically injects the CSRF token 
 * for state-changing HTTP methods (POST, PUT, PATCH, DELETE).
 */
export const fetchWithCSRF = async (url, options = {}) => {
  // Always ensure credentials are included so the session and CSRF cookies are sent
  options.credentials = 'include';
  
  const method = (options.method || 'GET').toUpperCase();
  
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = await getCsrfToken();
    
    if (!options.headers) {
      options.headers = {};
    }
    
    // Inject the CSRF token into the headers
    if (token) {
      options.headers['X-CSRF-Token'] = token;
    }
  }

  return fetch(url, options);
};
