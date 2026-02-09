/**
 * Centralized API Helper for Lahore Portal
 * Ensures all requests go to the correct backend URL with retry logic
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Constructs the full API URL for an endpoint
 * @param {string} endpoint - API endpoint (e.g., '/auth/login', 'student/attendance/student/3')
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Remove /api if already present to avoid duplication
  const withoutApi = cleanEndpoint.replace(/^\/api/, '');
  
  // Always use /api prefix
  return `${BASE_URL}/api${withoutApi}`;
};

/**
 * Fetch wrapper with automatic retry logic
 * Retries once after 500ms if request fails
 * @param {string} url - Full URL to fetch
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @param {number} retries - Number of retries (default: 1)
 * @returns {Promise<Response>} Fetch response
 */
export const fetchWithRetry = async (url, options = {}, retries = 1) => {
  try {
    const response = await fetch(url, {
      ...options,
      cache: 'no-store'
    });

    // If response is ok, return immediately
    if (response.ok) {
      return response;
    }

    // If not ok and we have retries left, retry after delay
    if (retries > 0 && response.status >= 500) {
      console.warn(`⚠️ Server error ${response.status}, retrying in 500ms...`);
      await new Promise(res => setTimeout(res, 500));
      return fetchWithRetry(url, options, retries - 1);
    }

    return response;
  } catch (err) {
    // Network error - retry if retries available
    if (retries > 0) {
      console.warn(`⚠️ Network error: ${err.message}, retrying in 500ms...`);
      await new Promise(res => setTimeout(res, 500));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
};

/**
 * Safe fetch with error handling
 * Combines getApiUrl + fetchWithRetry + JSON parsing
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<object>} Parsed JSON response
 */
export const safeApiCall = async (endpoint, options = {}) => {
  try {
    const url = getApiUrl(endpoint);
    console.log(`📡 API Call: ${url}`);

    const response = await fetchWithRetry(url, options);

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      throw new Error('Backend ne JSON response nahi diya!');
    }

    if (!response.ok) {
      console.error(`❌ API Error (${response.status}):`, data);
      return {
        success: false,
        error: data.error || `Server error: ${response.status}`
      };
    }

    console.log(`✅ API Success:`, data);
    return data;
  } catch (error) {
    console.error(`❌ API Call Failed:`, error.message);
    return {
      success: false,
      error: `Server se rabta nahi ho saka! ${error.message}`
    };
  }
};
