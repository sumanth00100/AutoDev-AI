export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('autoengineer_token');
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
