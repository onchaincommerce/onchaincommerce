"use client";

import React, { useState } from 'react';
import StyledButton from '../StyledButton';
import { usePrivy } from '@privy-io/react-auth';

interface CoinbaseAuthProps {
  onAuth: (apiKey: string) => void;
}

const CoinbaseAuth: React.FC<CoinbaseAuthProps> = ({ onAuth }) => {
  const [apiKey, setApiKey] = useState('');
  const { logout } = usePrivy();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuth(apiKey);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '20px',
      boxSizing: 'border-box',
    }}>
      <h2 style={{ marginBottom: '20px', color: '#00ffff' }}>Enter Coinbase Commerce API Key</h2>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '300px',
      }}>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="API Key"
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '5px',
            border: '2px solid #00ffff',
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
            color: '#00ffff',
          }}
        />
        <StyledButton onClick={handleSubmit}>
          Continue
        </StyledButton>
      </form>
      <div style={{ marginTop: '20px' }}>
        <StyledButton onClick={logout}>
          Logout
        </StyledButton>
      </div>
    </div>
  );
};

export default CoinbaseAuth;