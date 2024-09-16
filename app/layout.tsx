import React from 'react';
import { CoinbaseWalletProvider } from './components/wallet/CoinbaseWalletProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <CoinbaseWalletProvider>
          {children}
        </CoinbaseWalletProvider>
      </body>
    </html>
  );
}
