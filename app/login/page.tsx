import type { Metadata } from 'next';
import LoginInitiator from './_components/LoginInitiator';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Movelo account and track your deliveries.',
};

export default function LoginPage() {
  return <LoginInitiator />;
}