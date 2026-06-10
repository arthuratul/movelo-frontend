'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Check, Loader2 } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface FormFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  general?: string;
}

type Touched = Partial<Record<keyof FormFields, boolean>>;

/* ------------------------------------------------------------------ */
/*  Validation                                                          */
/* ------------------------------------------------------------------ */

function validate(f: FormFields): FormErrors {
  const e: FormErrors = {};

  if (!f.firstName.trim()) e.firstName = 'First name is required';
  if (!f.lastName.trim())  e.lastName  = 'Last name is required';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function SignupForm() {
  const [fields, setFields] = useState<FormFields>({
    firstName: '', lastName: '', email: '', password: '',
  });
  const [errors, setErrors]   = useState<FormErrors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [isLoading, setIsLoading]   = useState(false);
  const [isSuccess, setIsSuccess]   = useState(false);
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

    const allTouched: Touched = { firstName: true, lastName: true, email: true, password: true };
    setTouched(allTouched);

    const validationErrors = validate(fields);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fields.firstName.trim(),
          lastName:  fields.lastName.trim(),
          email:     fields.email.trim().toLowerCase(),
          password:  fields.password,
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
        return;
      }

      const data: { message?: string | string[]; statusCode?: number } =
        await res.json().catch(() => ({}));

      if (res.status === 409) {
        setErrors({ email: 'An account with this email already exists' });
        setTouched(prev => ({ ...prev, email: true }));
      } else if (res.status === 400) {
        const msg = Array.isArray(data.message) ? data.message[0] : data.message;
        setErrors({ general: msg ?? 'Please check your information and try again' });
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' });
      }
    } catch {
      setErrors({ general: 'Unable to connect. Please check your internet connection.' });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Success state                                                     */
  /* ---------------------------------------------------------------- */

  if (isSuccess) {
    return (
      <div className="text-center py-4">
        <h2 className="text-title-3 text-neutral-900 mb-2">
          Check your inbox
        </h2>
        <p className="text-body-sm text-neutral-500 mb-1.5">
          We sent a confirmation link to
        </p>
        <p className="text-body-sm font-semibold text-neutral-800 mb-6">
          {fields.email}
        </p>
        <p className="text-caption text-neutral-400 mb-7">
          Click the link in the email to activate your account. Check your spam folder if you don&apos;t see it.
        </p>
        <Link href="/login" className="btn btn-primary btn-full">
          Go to sign in
        </Link>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Form                                                              */
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

      {/* First name + Last name */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            First name
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="John"
            value={fields.firstName}
            onChange={e => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            disabled={isLoading}
            aria-invalid={!!err('firstName')}
            aria-describedby={err('firstName') ? 'firstName-error' : undefined}
            className={`input ${err('firstName') ? 'input-error' : ''}`}
          />
          {err('firstName') && (
            <p id="firstName-error" className="mt-1.5 text-xs text-error">
              {err('firstName')}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Doe"
            value={fields.lastName}
            onChange={e => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            disabled={isLoading}
            aria-invalid={!!err('lastName')}
            aria-describedby={err('lastName') ? 'lastName-error' : undefined}
            className={`input ${err('lastName') ? 'input-error' : ''}`}
          />
          {err('lastName') && (
            <p id="lastName-error" className="mt-1.5 text-xs text-error">
              {err('lastName')}
            </p>
          )}
        </div>
      </div>

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
        <label
          htmlFor="password"
          className="block text-sm font-medium text-neutral-700 mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            value={fields.password}
            onChange={e => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            disabled={isLoading}
            aria-invalid={!!err('password')}
            aria-describedby="password-hint"
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
            {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
          </button>
        </div>
        <p
          id="password-hint"
          className={`mt-1.5 text-xs ${err('password') ? 'text-error' : 'text-neutral-400'}`}
        >
          {err('password') ?? 'Min. 8 characters'}
        </p>
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
            Creating account…
          </>
        ) : (
          'Create account'
        )}
      </button>
    </form>
  );
}