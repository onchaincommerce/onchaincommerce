"use client";

import { useState, useEffect } from 'react';
import { useCoinbaseWallet } from './components/wallet/CoinbaseWalletProvider';
import SciFiBackground from './components/SciFiBackground';
import RainingImages from './components/RainingImages';
import CoinbaseAuth from './components/CoinbaseAuth';
import Dashboard from './components/dashboard/Dashboard';
import styles from './page.module.css';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

export default function Home() {
  const { address, connectWallet, disconnectWallet } = useCoinbaseWallet();
  const [showCoinbaseAuth, setShowCoinbaseAuth] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (address) {
      const storedApiKey = localStorage.getItem('coinbaseApiKey');
      if (storedApiKey) {
        setApiKey(storedApiKey);
        setShowDashboard(true);
      } else {
        setShowCoinbaseAuth(true);
      }
    } else {
      setShowDashboard(false);
      setShowCoinbaseAuth(false);
    }
  }, [address]);

  const handleEnter = async () => {
    try {
      const walletSDK = new CoinbaseWalletSDK({
        appName: 'Onchain Commerce',
        appLogoUrl: 'https://example.com/logo.png',
        darkMode: true
      });

      const ethereum = walletSDK.makeWeb3Provider('https://mainnet.base.org', 8453);
      await ethereum.request({ method: 'eth_requestAccounts' });
      await connectWallet(ethereum);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleApiKeySubmit = (submittedApiKey: string) => {
    localStorage.setItem('coinbaseApiKey', submittedApiKey);
    setApiKey(submittedApiKey);
    setShowCoinbaseAuth(false);
    setShowDashboard(true);
  };

  const handleLogout = async () => {
    try {
      await disconnectWallet();
      localStorage.removeItem('coinbaseApiKey');
      setApiKey('');
      setShowDashboard(false);
      setShowCoinbaseAuth(false);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (!address) {
    return (
      <SciFiBackground>
        <RainingImages />
        <div className={styles.enterContainer}>
          <button className={styles.enterButton} onClick={handleEnter}>
            Enter
          </button>
        </div>
      </SciFiBackground>
    );
  }

  if (showCoinbaseAuth) {
    return <CoinbaseAuth onApiKeySubmit={handleApiKeySubmit} />;
  }

  if (showDashboard) {
    return (
      <Dashboard 
        apiKey={apiKey} 
        onLogout={handleLogout}
      />
    );
  }

  return <div>Loading...</div>;
}