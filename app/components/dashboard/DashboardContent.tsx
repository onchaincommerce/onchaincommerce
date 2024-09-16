"use client";

import React, { useState } from 'react';
import StyledButton from '../StyledButton';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

interface DashboardContentProps {
  coinbaseApiKey: string;
  onLogout: () => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ coinbaseApiKey, onLogout }) => {
  const [currentSection, setCurrentSection] = useState<'wallet' | 'revenue' | 'checkoutGenerator' | 'paymentHistory'>('wallet');

  const renderSection = () => {
    switch (currentSection) {
      case 'wallet':
        return (
          <div style={{ backgroundColor: 'rgba(0, 255, 255, 0.1)', border: '2px solid #00ffff', borderRadius: '10px', padding: '20px', height: '100%' }}>
            <h2 style={{ color: '#00ffff', marginTop: 0 }}>Wallet</h2>
            {/* Wallet content */}
          </div>
        );
      case 'revenue':
        return (
          <div style={{ backgroundColor: 'rgba(0, 255, 255, 0.1)', border: '2px solid #00ffff', borderRadius: '10px', padding: '20px', height: '100%' }}>
            <h2 style={{ color: '#00ffff', marginTop: 0 }}>Revenue</h2>
            {/* Revenue graph */}
          </div>
        );
      case 'checkoutGenerator':
        return (
          <div style={{ backgroundColor: 'rgba(0, 255, 255, 0.1)', border: '2px solid #00ffff', borderRadius: '10px', padding: '20px', height: '100%' }}>
            <h2 style={{ color: '#00ffff', marginTop: 0 }}>Checkout Generator</h2>
            {/* Checkout Generator content */}
          </div>
        );
      case 'paymentHistory':
        return (
          <div style={{ backgroundColor: 'rgba(0, 255, 255, 0.1)', border: '2px solid #00ffff', borderRadius: '10px', padding: '20px', height: '100%' }}>
            <h2 style={{ color: '#00ffff', marginTop: 0 }}>Payment History</h2>
            {/* Payment History content */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ 
        width: '200px', 
        backgroundColor: 'rgba(0, 255, 255, 0.1)', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <StyledButton onClick={() => setCurrentSection('wallet')}>Wallet</StyledButton>
          <StyledButton onClick={() => setCurrentSection('revenue')}>Revenue</StyledButton>
          <StyledButton onClick={() => setCurrentSection('checkoutGenerator')}>Checkout Generator</StyledButton>
          <StyledButton onClick={() => setCurrentSection('paymentHistory')}>Payment History</StyledButton>
        </div>
        <StyledButton onClick={onLogout}>Logout</StyledButton>
      </nav>
      <main style={{ flex: 1, padding: '20px' }}>
        {renderSection()}
      </main>
    </div>
  );
};

export default DashboardContent;