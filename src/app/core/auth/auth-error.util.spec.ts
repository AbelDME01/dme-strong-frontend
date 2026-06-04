import { friendlyAuthError } from './auth-error.util';

describe('friendlyAuthError', () => {
  it('maps network/fetch errors to a connection message', () => {
    expect(friendlyAuthError(new Error('Failed to fetch'))).toContain(
      'No se pudo conectar',
    );
    expect(friendlyAuthError(new Error('fetch failed'))).toContain(
      'No se pudo conectar',
    );
  });

  it('maps invalid credentials to a friendly message', () => {
    expect(
      friendlyAuthError(new Error('Invalid login credentials')),
    ).toBe('Correo o contraseña incorrectos.');
  });

  it('maps unconfirmed email', () => {
    expect(friendlyAuthError(new Error('Email not confirmed'))).toContain(
      'confirmar tu correo',
    );
  });

  it('maps already-registered users', () => {
    expect(
      friendlyAuthError(new Error('User already registered')),
    ).toContain('Ya existe una cuenta');
  });

  it('keeps password-strength messages as-is', () => {
    const msg = 'Password should be at least 8 characters';
    expect(friendlyAuthError(new Error(msg))).toBe(msg);
  });

  it('falls back to a generic message for empty input', () => {
    expect(friendlyAuthError(null)).toBe('Ocurrió un error. Inténtalo de nuevo.');
  });
});
