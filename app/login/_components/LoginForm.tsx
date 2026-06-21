'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { login, loginWithGoogle, AuthError, getAccessToken, getRefreshToken } from '@/lib/auth';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface FormFields {
  email:    string;
  password: string;
}

interface FormErrors {
  email?:    string;
  password?: string;
  general?:  string;
}

type Touched = Partial<Record<keyof FormFields, boolean>>;

/* ------------------------------------------------------------------ */
/*  Validation                                                          */
/* ------------------------------------------------------------------ */

function validate(f: FormFields): FormErrors {
  const e: FormErrors = {};

  if (!f.email.trim()) {
    e.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
    e.email = 'Enter a valid email address';
  }

  if (!f.password) {
    e.password = 'Password is required';
  } else if (f.password.length < 8) {
    e.password = 'Password must be at least 8 characters';
  }

  return e;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function LoginForm() {
  const router = useRouter();

  useEffect(() => {
    if (getAccessToken() || getRefreshToken()) {
      router.replace('/dashboard');
    }
  }, [router]);

  const [fields, setFields]               = useState<FormFields>({ email: '', password: '' });
  const [errors, setErrors]               = useState<FormErrors>({});
  const [touched, setTouched]             = useState<Touched>({});
  const [isLoading, setIsLoading]         = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword]   = useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      setErrors({ general: 'Unable to start Google sign-in. Please try again.' });
      setIsGoogleLoading(false);
    }
  };

  /* Live validation once a field has been interacted with */
  const handleChange = (field: keyof FormFields, value: string) => {
    const updated = { ...fields, [field]: value };
    setFields(updated);
    if (touched[field]) {
      const next = validate(updated);
      setErrors(prev => ({ ...prev, [field]: next[field], general: prev.general }));
    }
  };

  const handleBlur = (field: keyof FormFields) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const next = validate(fields);
    setErrors(prev => ({ ...prev, [field]: next[field] }));
  };

  /* Returns the error only if the field has been touched */
  const err = (field: keyof FormFields) =>
    touched[field] ? errors[field] : undefined;

  /* ---------------------------------------------------------------- */
  /*  Submit                                                            */
  /* ---------------------------------------------------------------- */

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const allTouched: Touched = { email: true, password: true };
    setTouched(allTouched);

    const validationErrors = validate(fields);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    setErrors({});

    try {
      await login(fields.email.trim().toLowerCase(), fields.password);
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof AuthError) {
        if (error.status === 403) {
          setErrors({ general: 'Please verify your email address before signing in. Check your inbox.' });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        setErrors({ general: 'Unable to connect. Please check your internet connection.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <>
      {/* Continue with Google */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading || isGoogleLoading}
        className="btn btn-outline btn-full gap-2.5"
      >
        {isGoogleLoading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <GoogleIcon />
        }
        {isGoogleLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      {/* Divider */}
      <div className="relative flex items-center my-5">
        <div className="flex-1 border-t border-border" />
        <span className="mx-3 text-xs text-neutral-400 font-medium">or</span>
        <div className="flex-1 border-t border-border" />
      </div>

    <form onSubmit={handleSubmit} noValidate>

      {/* General / API error banner */}
      {errors.general && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 px-4 py-3.5 rounded-xl
                     bg-error-light text-error text-sm"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Email */}
      <div className="mb-4">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-neutral-700 mb-1.5"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="john@example.com"
          value={fields.email}
          onChange={e => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          disabled={isLoading || isGoogleLoading}
          aria-invalid={!!err('email')}
          aria-describedby={err('email') ? 'email-error' : undefined}
          className={`input ${err('email') ? 'input-error' : ''}`}
        />
        {err('email') && (
          <p id="email-error" className="mt-1.5 text-xs text-error">
            {err('email')}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-neutral-700"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            tabIndex={-1}
            className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Your password"
            value={fields.password}
            onChange={e => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            disabled={isLoading || isGoogleLoading}
            aria-invalid={!!err('password')}
            aria-describedby={err('password') ? 'password-error' : undefined}
            className={`input pr-12 ${err('password') ? 'input-error' : ''}`}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2
                       text-neutral-400 hover:text-neutral-600 transition-colors p-0.5"
          >
            {showPassword
              ? <EyeOff className="w-4.5 h-4.5" />
              : <Eye    className="w-4.5 h-4.5" />
            }
          </button>
        </div>
        {err('password') && (
          <p id="password-error" className="mt-1.5 text-xs text-error">
            {err('password')}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || isGoogleLoading}
        className="btn btn-primary btn-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing in…
          </>
        ) : (
          'Sign in'
        )}
      </button>

    </form>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}