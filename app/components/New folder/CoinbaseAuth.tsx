"use client";

import React, { useState } from 'react';

interface CoinbaseAuthProps {
  onAuth: (apiKey: string) => void;
}

const CoinbaseAuth: React.FC<CoinbaseAuthProps> = ({ onAuth }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('coinbaseApiKey', apiKey);
    onAuth(apiKey);
  };

  return (
    <div className="coinbase-auth">
      <h2>Commerce API Key</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Coinbase Commerce API Key"
        />
        <button type="submit">Continue</button>
      </form>
      <style jsx>{`
        .coinbase-auth {
          color: #00ffff;
          margin-top: 20px;
        }
        input {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          background-color: rgba(0, 255, 255, 0.1);
          border: 1px solid #00ffff;
          color: #00ffff;
        }
        button {
          background-color: #00ffff;
          color: black;
          border: none;
          padding: 10px 20px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default CoinbaseAuth;