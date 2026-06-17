import { getValidAccessToken, AuthError } from './auth';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/v1`;

// ── Types ─────────────────────────────────────────────────────────────────────

export type Gender        = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type BloodGroup    = 'A_POSITIVE' | 'A_NEGATIVE' | 'B_POSITIVE' | 'B_NEGATIVE'
                          | 'AB_POSITIVE' | 'AB_NEGATIVE' | 'O_POSITIVE' | 'O_NEGATIVE';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED';

export interface Profile {
  id:            string;
  age:           number | null;
  gender:        Gender | null;
  bloodGroup:    BloodGroup | null;
  maritalStatus: MaritalStatus | null;
  mobileNumber:  string | null;
  createdAt:     string;
  updatedAt:     string;
}

export interface ProfileInput {
  age?:           number;
  gender?:        Gender;
  bloodGroup?:    BloodGroup;
  maritalStatus?: MaritalStatus;
  mobileNumber?:  string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function authedFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getValidAccessToken();
  if (!token) throw new AuthError('Not authenticated', 401);

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
}

function extractMessage(body: unknown): string {
  const b = body as { message?: string | string[] };
  return Array.isArray(b?.message) ? b.message[0] : (b?.message ?? 'Something went wrong');
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function getProfile(): Promise<Profile | null> {
  const res = await authedFetch('/profile/me');
  if (res.status === 404) return null;
  if (res.ok) return res.json() as Promise<Profile>;
  throw new AuthError('Failed to fetch profile', res.status);
}

export async function createProfile(data: ProfileInput): Promise<Profile> {
  const res = await authedFetch('/profile', {
    method: 'POST',
    body:   JSON.stringify(data),
  });
  if (res.ok) return res.json() as Promise<Profile>;
  const body = await res.json().catch(() => ({}));
  throw new AuthError(extractMessage(body), res.status);
}

export async function updateProfile(data: ProfileInput): Promise<Profile> {
  const res = await authedFetch('/profile/me', {
    method: 'PATCH',
    body:   JSON.stringify(data),
  });
  if (res.ok) return res.json() as Promise<Profile>;
  const body = await res.json().catch(() => ({}));
  throw new AuthError(extractMessage(body), res.status);
}