"use client";

import { PrivyProvider } from '@privy-io/react-auth';
import PrivyProviderB from '../providers/PrivyProviderB';

export default function PrivyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'https://your-logo-url.com/logo.png',
        },
      }}
    >
      <PrivyProviderB>{children}</PrivyProviderB>
    </PrivyProvider>
  );
}