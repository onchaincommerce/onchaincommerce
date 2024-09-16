"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

interface WalletContextType {
  address: string | null;
  balance: string | null;
  provider: ethers.providers.Web3Provider | null;
  connectWallet: (ethereumProvider: any) => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useCoinbaseWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useCoinbaseWallet must be used within a CoinbaseWalletProvider');
  }
  return context;
};

interface CoinbaseWalletProviderProps {
  children: ReactNode;
}

export const CoinbaseWalletProvider: React.FC<CoinbaseWalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  const connectWallet = async (ethereumProvider: any) => {
    try {
      const web3Provider = new ethers.providers.Web3Provider(ethereumProvider);
      
      // Ensure we're connected to Base
      await web3Provider.send("wallet_switchEthereumChain", [{ chainId: "0x2105" }]); // chainId for Base

      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();

      setAddress(address);
      setProvider(web3Provider);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    if (provider) {
      // For Coinbase Wallet, we need to call the disconnect method on the underlying ethereum object
      const ethereum = provider.provider as any;
      if (ethereum && typeof ethereum.disconnect === 'function') {
        ethereum.disconnect();
      }
    }
    setAddress(null);
    setBalance(null);
    setProvider(null);
  };

  return (
    <WalletContext.Provider value={{ address, balance, provider, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};