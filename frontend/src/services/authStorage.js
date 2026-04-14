const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

let memoryToken = null;
let memoryUser = null;

function safeGetSessionItem(key) {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return null;
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetSessionItem(key, value) {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    window.sessionStorage.setItem(key, value);
  } catch {
    // no-op
  }
}

function safeRemoveSessionItem(key) {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    window.sessionStorage.removeItem(key);
  } catch {
    // no-op
  }
}

export const authStorage = {
  getToken() {
    if (memoryToken) return memoryToken;
    const sessionToken = safeGetSessionItem(TOKEN_KEY);
    if (sessionToken) {
      memoryToken = sessionToken;
    }
    return memoryToken;
  },

  setToken(token) {
    memoryToken = token || null;
    if (token) {
      safeSetSessionItem(TOKEN_KEY, token);
    } else {
      safeRemoveSessionItem(TOKEN_KEY);
    }
  },

  getUser() {
    if (memoryUser) return memoryUser;

    const raw = safeGetSessionItem(USER_KEY);
    if (!raw) return null;

    try {
      memoryUser = JSON.parse(raw);
      return memoryUser;
    } catch {
      safeRemoveSessionItem(USER_KEY);
      return null;
    }
  },

  setUser(user) {
    memoryUser = user || null;
    if (user) {
      safeSetSessionItem(USER_KEY, JSON.stringify(user));
    } else {
      safeRemoveSessionItem(USER_KEY);
    }
  },

  clear() {
    memoryToken = null;
    memoryUser = null;
    safeRemoveSessionItem(TOKEN_KEY);
    safeRemoveSessionItem(USER_KEY);
  },
};

