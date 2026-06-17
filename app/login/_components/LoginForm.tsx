'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { login, AuthError, getAccessToken, getRefreshToken } from '@/lib/auth';

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

  const [fields, setFields]             = useState<FormFields>({ email: '', password: '' });
  const [errors, setErrors]             = useState<FormErrors>({});
  const [touched, setTouched]           = useState<Touched>({});
  const [isLoading, setIsLoading]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
          disabled={isLoading}
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
            disabled={isLoading}
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
        disabled={isLoading}
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
  );
}