import type { Metadata } from 'next';
import { User } from 'lucide-react';
import ProfileForm from './_components/ProfileForm';

export const metadata: Metadata = {
  title: 'Profile | Movelo',
  description: 'Manage your Movelo profile.',
};

export default function ProfilePage() {
  return (
    <div className="max-w-lg">

      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary-subtle flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-title-4 text-neutral-900">Your Profile</h1>
          <p className="text-body-sm text-neutral-500 mt-0.5">
            Personal details visible only to you
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="card-lg">
        <ProfileForm />
      </div>

    </div>
  );
}