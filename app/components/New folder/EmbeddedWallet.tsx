"use client";

import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

const EmbeddedWallet: React.FC = () => {
  const { user } = usePrivy();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (user?.wallet?.address) {
      navigator.clipboard.writeText(user.wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="embedded-wallet">
      <h2>Wallet Address</h2>
      {user?.wallet ? (
        <div className="address-container">
          <p>{user.wallet.address}</p>
          <button onClick={copyAddress}>{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      ) : (
        <p>No wallet found. Please contact support.</p>
      )}
      <style jsx>{`
        .embedded-wallet {
          color: #00ffff;
          margin-bottom: 20px;
        }
        .address-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        button {
          background-color: #00ffff;
          color: black;
          border: none;
          padding: 5px 10px;
          cursor: pointer;
          border-radius: 5px;
        }
      `}</style>
    </div>
  );
};

export default EmbeddedWallet;