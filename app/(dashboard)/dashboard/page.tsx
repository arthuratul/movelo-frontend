'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Package, ChevronRight } from 'lucide-react';
import { getAuthUser } from '@/lib/auth';
import { getProfile, type Profile } from '@/lib/profile';

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState('');
  const [profile,   setProfile]   = useState<Profile | null | undefined>(undefined);

  useEffect(() => {
    setUserEmail(getAuthUser()?.email ?? '');
    getProfile().then(setProfile).catch(() => setProfile(null));
  }, []);

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-title-2 text-neutral-900">Welcome back</h1>
        {userEmail && (
          <p className="text-body-sm text-neutral-500 mt-1">{userEmail}</p>
        )}
      </div>

      {/* Profile completion prompt — only when confirmed no profile exists */}
      {profile === null && (
        <Link href="/dashboard/profile" className="block mb-6">
          <div className="card-flat flex items-center justify-between gap-4
                          border-primary/30 bg-primary-subtle hover:shadow-card transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Complete your profile</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Add your details for a better experience
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-primary shrink-0" />
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary-subtle flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-xs font-medium text-neutral-500">Orders</span>
          </div>
          <p className="text-title-3 text-neutral-900">0</p>
          <p className="text-caption mt-0.5">Total placed</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-success-light flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-success" />
            </div>
            <span className="text-xs font-medium text-neutral-500">Delivered</span>
          </div>
          <p className="text-title-3 text-neutral-900">0</p>
          <p className="text-caption mt-0.5">Completed</p>
        </div>
      </div>
    </div>
  );
}