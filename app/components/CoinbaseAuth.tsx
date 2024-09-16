import React, { useState, useEffect } from 'react';
import styles from './CoinbaseAuth.module.css';
import SciFiBackground from './SciFiBackground';
import StyledButton from './StyledButton';

interface CoinbaseAuthProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const CoinbaseAuth: React.FC<CoinbaseAuthProps> = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    console.log('CoinbaseAuth component mounted');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting API key:', apiKey);
    onApiKeySubmit(apiKey);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input value changed:', e.target.value);
    setApiKey(e.target.value);
  };

  return (
    <SciFiBackground>
      <div className={styles.container}>
        <h2 className={styles.title}>Enter Coinbase Commerce API Key</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            value={apiKey}
            onChange={handleInputChange}
            placeholder="Enter your API Key here"
            className={styles.input}
          />
          <StyledButton type="submit">Submit API Key</StyledButton>
        </form>
      </div>
    </SciFiBackground>
  );
};

export default CoinbaseAuth;