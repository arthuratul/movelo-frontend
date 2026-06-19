const API_URL      = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/v1`;
const CLIENT_ID    = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID ?? '';
const REDIRECT_URI = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI ?? 'http://localhost:3000/callback';

// ── Token storage ─────────────────────────────────────────────────────────────

const ACCESS_TOKEN_KEY  = 'movelo_access_token';
const REFRESH_TOKEN_KEY = 'movelo_refresh_token';
const TOKEN_EXPIRY_KEY  = 'movelo_token_expiry';

export interface TokenSet {
  accessToken:  string;
  refreshToken: string;
  expiresAt:    number; // unix ms
}

export function saveTokens(tokens: TokenSet): void {
  localStorage.setItem(ACCESS_TOKEN_KEY,  tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  localStorage.setItem(TOKEN_EXPIRY_KEY,  String(tokens.expiresAt));
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

export function isAccessTokenExpired(): boolean {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiry) return true;
  return Date.now() >= Number(expiry) - 30_000; // 30s early-refresh buffer
}

// ── PKCE utilities ────────────────────────────────────────────────────────────

function base64urlEncode(buffer: Uint8Array): string {
  return btoa(Array.from(buffer, b => String.fromCharCode(b)).join(''))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64urlEncode(bytes);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data   = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64urlEncode(new Uint8Array(digest));
}

// ── Error type ────────────────────────────────────────────────────────────────

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ── API calls ─────────────────────────────────────────────────────────────────

interface AuthTokenResponse {
  access_token:  string;
  refresh_token: string;
  token_type:    'Bearer';
  expires_in:    number;
}

// Submits credentials to the PKCE authorize/login endpoint.
// Returns the authorization code extracted from the redirect_to URL.
async function apiAuthorizeLogin(
  email:         string,
  password:      string,
  codeChallenge: string,
): Promise<string> {
  const res = await fetch(`${API_URL}/auth/authorize/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      client_id:             CLIENT_ID,
      email,
      password,
      redirect_uri:          REDIRECT_URI,
      code_challenge:        codeChallenge,
      code_challenge_method: 'S256',
    }),
  });

  if (res.ok) {
    const data = await res.json() as { redirect_to: string };
    const code = new URL(data.redirect_to).searchParams.get('code');
    if (!code) throw new AuthError('Authorization failed: no code returned', 500);
    return code;
  }

  const body = await res.json().catch(() => ({})) as {
    message?: string | string[] | Array<{ property: string; constraints: Record<string, string> }>;
  };

  // NestJS validation guard errors: 422 with structured message array
  if (res.status === 422 && Array.isArray(body.message)) {
    const first = body.message[0] as { constraints?: Record<string, string> };
    const constraint = first?.constraints ? Object.values(first.constraints)[0] : undefined;
    if (constraint === 'Email or password is incorrect') {
      throw new AuthError('Invalid email or password', 401);
    }
    throw new AuthError(constraint ?? 'Something went wrong. Please try again.', 422);
  }

  if (res.status === 403) throw new AuthError('Please verify your email address before signing in', 403);
  const msg = Array.isArray(body.message) ? (body.message as string[])[0] : (body.message as string | undefined);
  throw new AuthError(msg ?? 'Something went wrong. Please try again.', res.status);
}

async function apiExchangeCode(
  code:         string,
  codeVerifier: string,
): Promise<AuthTokenResponse> {
  const res = await fetch(`${API_URL}/auth/token`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      client_id:     CLIENT_ID,
      grant_type:    'authorization_code',
      code,
      redirect_uri:  REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });

  if (res.ok) return res.json() as Promise<AuthTokenResponse>;
  throw new AuthError('Authentication failed. Please try again.', res.status);
}

export async function apiRefreshToken(refreshToken: string): Promise<AuthTokenResponse> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      client_id:     CLIENT_ID,
      refresh_token: refreshToken,
    }),
  });

  if (res.ok) return res.json() as Promise<AuthTokenResponse>;
  throw new AuthError('Session expired. Please sign in again.', res.status);
}

async function apiLogout(refreshToken: string): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ refresh_token: refreshToken }),
  });
}

// ── High-level helpers ────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<void> {
  const codeVerifier  = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const code   = await apiAuthorizeLogin(email, password, codeChallenge);
  const tokens = await apiExchangeCode(code, codeVerifier);

  saveTokens({
    accessToken:  tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt:    Date.now() + tokens.expires_in * 1000,
  });
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) await apiLogout(refreshToken);
  clearTokens();
}

export function getAuthUser(): { userId: string; email: string } | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64)) as { sub?: string; email?: string };
    if (!payload.sub || !payload.email) return null;
    return { userId: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  if (!isAccessTokenExpired()) return getAccessToken();

  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const tokens = await apiRefreshToken(refreshToken);
    saveTokens({
      accessToken:  tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt:    Date.now() + tokens.expires_in * 1000,
    });
    return tokens.access_token;
  } catch {
    clearTokens();
    return null;
  }
}