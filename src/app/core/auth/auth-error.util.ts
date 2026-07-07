/**
 * Maps raw auth/network errors to friendly, user-facing Spanish messages
 * so technical strings like "Failed to fetch" are never shown to the user.
 */
export function friendlyAuthError(err: unknown): string {
  const raw = err instanceof Error
    ? err.message
    : (err as any)?.error?.message ?? (err as any)?.message ?? String(err ?? '');
  const m = raw.toLowerCase();

  if (
    m.includes('failed to fetch') ||
    m.includes('fetch failed') ||
    m.includes('networkerror') ||
    m.includes('network request failed') ||
    m.includes('load failed')
  ) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
  }
  if (
    m.includes('invalid login') ||
    m.includes('invalid credentials') ||
    m.includes('invalid email or password')
  ) {
    return 'Correo o contraseña incorrectos.';
  }
  if (m.includes('email not confirmed')) {
    return 'Debes confirmar tu correo antes de iniciar sesión.';
  }
  if (m.includes('already registered') || m.includes('user already exists')) {
    return 'Ya existe una cuenta con este correo.';
  }
  if (m.includes('rate limit') || m.includes('too many requests')) {
    return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
  }
  // Password-strength / validation messages from Supabase are already readable.
  if (m.includes('password')) {
    return raw;
  }
  return raw || 'Ocurrió un error. Inténtalo de nuevo.';
}
