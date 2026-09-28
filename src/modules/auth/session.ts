const TOKEN_KEY = "ovocalidad.token";
const EXPIRATION_KEY = "ovocalidad.token.expiraEn";

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function saveSession(token: string, expiraEn: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(EXPIRATION_KEY, expiraEn);
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(EXPIRATION_KEY);
}

export function hasActiveSession() {
  const token = getToken();
  const expiration = sessionStorage.getItem(EXPIRATION_KEY);

  if (!token || !expiration) return false;

  const expirationTime = Date.parse(expiration);
  if (Number.isNaN(expirationTime) || expirationTime <= Date.now()) {
    clearSession();
    return false;
  }

  return true;
}
