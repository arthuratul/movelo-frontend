'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  getProfile, createProfile, updateProfile,
  type Profile, type ProfileInput,
  type Gender, type BloodGroup, type MaritalStatus,
} from '@/lib/profile';
import { AuthError } from '@/lib/auth';

// ── Option lists ──────────────────────────────────────────────────────────────

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'MALE',              label: 'Male'             },
  { value: 'FEMALE',            label: 'Female'           },
  { value: 'OTHER',             label: 'Other'            },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

const BLOOD_GROUP_OPTIONS: { value: BloodGroup; label: string }[] = [
  { value: 'A_POSITIVE',  label: 'A+'  },
  { value: 'A_NEGATIVE',  label: 'A-'  },
  { value: 'B_POSITIVE',  label: 'B+'  },
  { value: 'B_NEGATIVE',  label: 'B-'  },
  { value: 'AB_POSITIVE', label: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB-' },
  { value: 'O_POSITIVE',  label: 'O+'  },
  { value: 'O_NEGATIVE',  label: 'O-'  },
];

const MARITAL_STATUS_OPTIONS: { value: MaritalStatus; label: string }[] = [
  { value: 'SINGLE',    label: 'Single'    },
  { value: 'MARRIED',   label: 'Married'   },
  { value: 'DIVORCED',  label: 'Divorced'  },
  { value: 'WIDOWED',   label: 'Widowed'   },
  { value: 'SEPARATED', label: 'Separated' },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface Fields {
  mobileNumber:  string;
  age:           string;
  gender:        string;
  bloodGroup:    string;
  maritalStatus: string;
}

interface FormErrors {
  mobileNumber?: string;
  age?:          string;
  general?:      string;
}

type Touched = Partial<Record<keyof Fields, boolean>>;
type LoadState = 'loading' | 'ready' | 'error';

// ── Helpers ───────────────────────────────────────────────────────────────────

function profileToFields(p: Profile): Fields {
  return {
    mobileNumber:  p.mobileNumber  ?? '',
    age:           p.age != null   ? String(p.age) : '',
    gender:        p.gender        ?? '',
    bloodGroup:    p.bloodGroup    ?? '',
    maritalStatus: p.maritalStatus ?? '',
  };
}

function buildPayload(fields: Fields): ProfileInput {
  const payload: ProfileInput = {};
  if (fields.mobileNumber.trim())  payload.mobileNumber  = fields.mobileNumber.trim();
  if (fields.age.trim())           payload.age           = parseInt(fields.age, 10);
  if (fields.gender)               payload.gender        = fields.gender        as Gender;
  if (fields.bloodGroup)           payload.bloodGroup    = fields.bloodGroup    as BloodGroup;
  if (fields.maritalStatus)        payload.maritalStatus = fields.maritalStatus as MaritalStatus;
  return payload;
}

function validate(fields: Fields): FormErrors {
  const e: FormErrors = {};

  if (fields.mobileNumber.trim()) {
    if (!/^\+[1-9]\d{6,14}$/.test(fields.mobileNumber.trim())) {
      e.mobileNumber = 'Use international format, e.g. +919876543210';
    }
  }

  if (fields.age.trim()) {
    const n = Number(fields.age);
    if (!Number.isInteger(n) || n < 1 || n > 120) {
      e.age = 'Age must be a whole number between 1 and 120';
    }
  }

  return e;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProfileForm() {
  const router = useRouter();

  const [loadState,    setLoadState]    = useState<LoadState>('loading');
  const [isNew,        setIsNew]        = useState(true);
  const [fields,       setFields]       = useState<Fields>({
    mobileNumber: '', age: '', gender: '', bloodGroup: '', maritalStatus: '',
  });
  const [errors,       setErrors]       = useState<FormErrors>({});
  const [touched,      setTouched]      = useState<Touched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess,    setIsSuccess]    = useState(false);

  useEffect(() => {
    getProfile()
      .then(profile => {
        if (profile) {
          setIsNew(false);
          setFields(profileToFields(profile));
        }
        setLoadState('ready');
      })
      .catch(err => {
        if (err instanceof AuthError && err.status === 401) {
          router.replace('/login');
        } else {
          setLoadState('error');
        }
      });
  }, [router]);

  const handleChange = (field: keyof Fields, value: string) => {
    const updated = { ...fields, [field]: value };
    setFields(updated);
    if (touched[field] && (field === 'mobileNumber' || field === 'age')) {
      const next = validate(updated);
      setErrors(prev => ({ ...prev, [field]: next[field], general: prev.general }));
    }
  };

  const handleBlur = (field: keyof Fields) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'mobileNumber' || field === 'age') {
      const next = validate(fields);
      setErrors(prev => ({ ...prev, [field]: next[field] }));
    }
  };

  const err = (field: 'mobileNumber' | 'age'): string | undefined =>
    touched[field] ? errors[field] : undefined;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTouched({ mobileNumber: true, age: true });
    const validationErrors = validate(fields);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setErrors({});
    setIsSuccess(false);

    try {
      const payload = buildPayload(fields);
      const saved   = isNew
        ? await createProfile(payload)
        : await updateProfile(payload);

      setIsNew(false);
      setFields(profileToFields(saved));
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3500);
    } catch (error) {
      if (error instanceof AuthError && error.status === 401) {
        router.replace('/login');
      } else {
        setErrors({
          general: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Loading ─────────────────────────────────────────────────────────── */

  if (loadState === 'loading') {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="card text-center py-10">
        <p className="text-body-sm text-neutral-500">
          Failed to load profile. Please refresh the page.
        </p>
      </div>
    );
  }

  /* ── Form ────────────────────────────────────────────────────────────── */

  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* Success */}
      {isSuccess && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2.5 px-4 py-3.5 rounded-xl
                     bg-success-light text-success text-sm"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile {isNew ? 'created' : 'updated'} successfully.</span>
        </div>
      )}

      {/* Error */}
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

      <div className="space-y-5">

        {/* Mobile number */}
        <div>
          <label
            htmlFor="mobileNumber"
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            Mobile number
            <span className="ml-1 text-neutral-400 font-normal">(optional)</span>
          </label>
          <input
            id="mobileNumber"
            type="tel"
            autoComplete="tel"
            placeholder="+919876543210"
            value={fields.mobileNumber}
            onChange={e => handleChange('mobileNumber', e.target.value)}
            onBlur={() => handleBlur('mobileNumber')}
            disabled={isSubmitting}
            aria-invalid={!!err('mobileNumber')}
            aria-describedby={err('mobileNumber') ? 'mobileNumber-error' : 'mobileNumber-hint'}
            className={`input ${err('mobileNumber') ? 'input-error' : ''}`}
          />
          {err('mobileNumber') ? (
            <p id="mobileNumber-error" className="mt-1.5 text-xs text-error">
              {err('mobileNumber')}
            </p>
          ) : (
            <p id="mobileNumber-hint" className="mt-1.5 text-xs text-neutral-400">
              International format, e.g. +919876543210
            </p>
          )}
        </div>

        {/* Age */}
        <div>
          <label
            htmlFor="age"
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            Age
            <span className="ml-1 text-neutral-400 font-normal">(optional)</span>
          </label>
          <input
            id="age"
            type="number"
            min={1}
            max={120}
            placeholder="e.g. 28"
            value={fields.age}
            onChange={e => handleChange('age', e.target.value)}
            onBlur={() => handleBlur('age')}
            disabled={isSubmitting}
            aria-invalid={!!err('age')}
            aria-describedby={err('age') ? 'age-error' : undefined}
            className={`input ${err('age') ? 'input-error' : ''}`}
          />
          {err('age') && (
            <p id="age-error" className="mt-1.5 text-xs text-error">
              {err('age')}
            </p>
          )}
        </div>

        {/* Gender + Marital status */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Gender
              <span className="ml-1 text-neutral-400 font-normal">(optional)</span>
            </label>
            <select
              id="gender"
              value={fields.gender}
              onChange={e => handleChange('gender', e.target.value)}
              disabled={isSubmitting}
              className="input"
            >
              <option value="">Select gender</option>
              {GENDER_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="maritalStatus"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Marital status
              <span className="ml-1 text-neutral-400 font-normal">(optional)</span>
            </label>
            <select
              id="maritalStatus"
              value={fields.maritalStatus}
              onChange={e => handleChange('maritalStatus', e.target.value)}
              disabled={isSubmitting}
              className="input"
            >
              <option value="">Select status</option>
              {MARITAL_STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Blood group */}
        <div>
          <label
            htmlFor="bloodGroup"
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            Blood group
            <span className="ml-1 text-neutral-400 font-normal">(optional)</span>
          </label>
          <select
            id="bloodGroup"
            value={fields.bloodGroup}
            onChange={e => handleChange('bloodGroup', e.target.value)}
            disabled={isSubmitting}
            className="input"
          >
            <option value="">Select blood group</option>
            {BLOOD_GROUP_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Submit */}
      <div className="mt-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary btn-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </>
          ) : isNew ? 'Create profile' : 'Save changes'}
        </button>
      </div>

    </form>
  );
}