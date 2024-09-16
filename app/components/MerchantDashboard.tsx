"use client";

import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import CoinbaseAuth from './dashboard/CoinbaseAuth';
import DashboardContent from './dashboard/DashboardContent';

const MerchantDashboard: React.FC = () => {
  const { logout } = usePrivy();
  const [coinbaseApiKey, setCoinbaseApiKey] = useState<string | null>(null);

  const handleCoinbaseAuth = (apiKey: string) => {
    setCoinbaseApiKey(apiKey);
  };

  const handleLogout = () => {
    setCoinbaseApiKey(null);
    logout();
  };

  return (
    <div className={`dashboard ${coinbaseApiKey ? 'expanded' : ''}`}>
      {!coinbaseApiKey ? (
        <CoinbaseAuth onAuth={handleCoinbaseAuth} />
      ) : (
        <DashboardContent coinbaseApiKey={coinbaseApiKey} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default MerchantDashboard;