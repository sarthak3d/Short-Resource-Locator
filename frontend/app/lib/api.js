const DASHBOARD_API = '/api/dashboard';
const ANALYTICS_API = '';

class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function getAuthHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('srl_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getAnalyticsHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('srl_analytics_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(baseUrl, path, options = {}) {
  const { method = 'GET', body, headers = {}, auth = 'jwt' } = options;

  const authHeaders = auth === 'analytics' ? getAnalyticsHeaders() : auth === 'jwt' ? getAuthHeaders() : {};

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${baseUrl}${path}`, config);

  if (!res.ok) {
    const rawText = await res.text();
    let errorBody;
    try { errorBody = rawText ? JSON.parse(rawText) : null; } catch { errorBody = rawText; }
    
    // Prevent dumping massive 502 HTML pages into the UI error box
    const isHtml = typeof rawText === 'string' && rawText.trim().startsWith('<');
    const safeErrorMessage = isHtml ? `Service Unavailable (${res.status}). Please try again shortly.` : rawText;

    throw new ApiError(
      (typeof errorBody === 'object' && errorBody?.message)
        || (typeof errorBody === 'object' && errorBody?.error)
        || safeErrorMessage
        || `Request failed: ${res.status}`,
      res.status,
      errorBody
    );
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

export const auth = {
  login: (identifier, passcode) =>
    request(DASHBOARD_API, '/auth/login', { method: 'POST', body: { identifier, passcode }, auth: 'none' }),

  sendEmailCode: (email) =>
    request(DASHBOARD_API, '/auth/signup/email', { method: 'POST', body: { message: email }, auth: 'none' }),

  verifyEmailCode: (identifier, passcode) =>
    request(DASHBOARD_API, '/auth/signup/email/verify', { method: 'POST', body: { identifier, passcode }, auth: 'none' }),

  setCredentials: (email, username, passcode) =>
    request(DASHBOARD_API, '/auth/signup/credentials', { method: 'POST', body: { email, username, passcode }, auth: 'none' }),

  logout: () =>
    request(DASHBOARD_API, '/auth/logout', { method: 'POST' }),

  changePassword: (oldPassword, newPassword) =>
    request(DASHBOARD_API, '/auth/password', { method: 'PATCH', body: { oldPassword, newPassword } }),

  forgotPassword: (email) =>
    request(DASHBOARD_API, '/auth/forget-password', { method: 'POST', body: { message: email }, auth: 'none' }),

  resetPassword: (email, code, newPassword) =>
    request(DASHBOARD_API, '/auth/reset-password', { method: 'POST', body: { email, code, newPassword }, auth: 'none' }),
};

export const user = {
  getDetails: () =>
    request(DASHBOARD_API, '/user/details/get'),

  submitDetails: (name, userTag) =>
    request(DASHBOARD_API, '/user/details/fill', { method: 'POST', body: { name, userTag } }),

  updateDetails: (name, userTag) =>
    request(DASHBOARD_API, '/user/details/update', { method: 'PATCH', body: { name, userTag } }),

  getSrlList: () =>
    request(DASHBOARD_API, '/user/details/srl-list'),
};

export const srl = {
  generate: (url) =>
    request(DASHBOARD_API, '/url2srl/generate', { method: 'POST', body: { url } }),

  delete: (userTag, locator) =>
    request(DASHBOARD_API, `/url2srl/delete?userTag=${encodeURIComponent(userTag)}&locator=${encodeURIComponent(locator)}`, { method: 'DELETE' }),
};

export const analyticsToken = {
  get: () =>
    request(DASHBOARD_API, '/analytics/token', { method: 'POST' }),
};

export const analytics = {
  getSummary: (userTag) =>
    request(ANALYTICS_API, `/api/analytics/${encodeURIComponent(userTag)}/summary`, { auth: 'analytics' }),

  getClicksPerDay: (userTag, start, end) =>
    request(ANALYTICS_API, `/api/analytics/${encodeURIComponent(userTag)}/clicks-per-day?start=${start}&end=${end}`, { auth: 'analytics' }),

  getTopReferrers: (userTag, limit = 10) =>
    request(ANALYTICS_API, `/api/analytics/${encodeURIComponent(userTag)}/top/referrers?limit=${limit}`, { auth: 'analytics' }),

  getTopBrowsers: (userTag, limit = 10) =>
    request(ANALYTICS_API, `/api/analytics/${encodeURIComponent(userTag)}/top/browsers?limit=${limit}`, { auth: 'analytics' }),

  getTopCountries: (userTag, limit = 10) =>
    request(ANALYTICS_API, `/api/analytics/${encodeURIComponent(userTag)}/top/countries?limit=${limit}`, { auth: 'analytics' }),

  getTopOs: (userTag, limit = 10) =>
    request(ANALYTICS_API, `/api/analytics/${encodeURIComponent(userTag)}/top/os?limit=${limit}`, { auth: 'analytics' }),

  getLocatorSummary: (userTag, locator) =>
    request(ANALYTICS_API, `/api/analytics/${encodeURIComponent(userTag)}/locator/${encodeURIComponent(locator)}/summary`, { auth: 'analytics' }),

  getLocatorClicksPerDay: (userTag, locator, start, end) =>
    request(ANALYTICS_API, `/api/analytics/${encodeURIComponent(userTag)}/locator/${encodeURIComponent(locator)}/clicks-per-day?start=${start}&end=${end}`, { auth: 'analytics' }),

  getLocatorTopReferrers: (userTag, locator, limit = 10) =>
    request(ANALYTICS_API, `/api/analytics/${encodeURIComponent(userTag)}/locator/${encodeURIComponent(locator)}/top/referrers?limit=${limit}`, { auth: 'analytics' }),

  getLocatorTopCountries: (userTag, locator, limit = 10) =>
    request(ANALYTICS_API, `/api/analytics/${encodeURIComponent(userTag)}/locator/${encodeURIComponent(locator)}/top/countries?limit=${limit}`, { auth: 'analytics' }),
};

export { ApiError };
