"use client";

import React, { useState, useEffect } from 'react';
import { useCoinbaseWallet } from '../wallet/CoinbaseWalletProvider';
import { ethers } from 'ethers';
import Analytics from './Analytics';
import PaymentLinks from './PaymentLinks';
import PaymentHistory from './PaymentHistory';
import StyledButton from '../StyledButton';
import SciFiBackground from '../SciFiBackground';
import styles from './Dashboard.module.css';
import Cart from './Cart';
import Subscriptions from './Subscriptions';

// USDC contract address on Base
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// USDC ABI (including transfer function)
const USDC_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  }
];

interface DashboardProps {
  apiKey: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ apiKey, onLogout }) => {
  const [activeTab, setActiveTab] = useState('analytics');
  const { address, provider } = useCoinbaseWallet();
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchUSDCBalance();
  }, [address, provider]);

  const fetchUSDCBalance = async () => {
    if (address && provider) {
      try {
        const contract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
        const balance = await contract.balanceOf(address);
        setUsdcBalance(ethers.utils.formatUnits(balance, 6));
      } catch (error) {
        console.error('Error fetching USDC balance:', error);
        setUsdcBalance('Error');
      }
    }
  };

  const handleWithdraw = async () => {
    if (!address || !provider || !withdrawAmount || !withdrawAddress) return;

    setWithdrawStatus('pending');
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
      const amount = ethers.utils.parseUnits(withdrawAmount, 6);

      const tx = await contract.transfer(withdrawAddress, amount);
      await tx.wait();

      setWithdrawStatus('success');
      fetchUSDCBalance();
    } catch (error) {
      console.error('Error during withdrawal:', error);
      setWithdrawStatus('error');
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const copyAddressToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address).then(() => {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      });
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleMaxAmount = () => {
    if (usdcBalance) {
      setWithdrawAmount(usdcBalance);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <SciFiBackground />
      <nav className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <h2 className={styles.dashboardTitle}>Onchain Commerce</h2>
          <div className={styles.navButtons}>
            <StyledButton
              onClick={() => handleTabChange('analytics')}
              className={`${styles.navButton} ${activeTab === 'analytics' ? styles.activeTab : ''}`}
            >
              Analytics
            </StyledButton>
            <StyledButton
              onClick={() => handleTabChange('paymentLinks')}
              className={`${styles.navButton} ${activeTab === 'paymentLinks' ? styles.activeTab : ''}`}
            >
              Payment Links
            </StyledButton>
            <StyledButton
              onClick={() => handleTabChange('paymentHistory')}
              className={`${styles.navButton} ${activeTab === 'paymentHistory' ? styles.activeTab : ''}`}
            >
              Payment History
            </StyledButton>
            <StyledButton
              onClick={() => handleTabChange('cart')}
              className={`${styles.navButton} ${activeTab === 'cart' ? styles.activeTab : ''}`}
            >
              Cart
            </StyledButton>
            <StyledButton
              onClick={() => handleTabChange('subscriptions')}
              className={`${styles.navButton} ${activeTab === 'subscriptions' ? styles.activeTab : ''}`}
            >
              Subscriptions
            </StyledButton>
          </div>
        </div>
        <div className={styles.sidebarBottom}>
          <div className={styles.walletInfo}>
            <div className={styles.totalBalance}>
              Balance: {usdcBalance !== null ? `${parseFloat(usdcBalance).toFixed(2)} USDC` : 'Loading...'}
            </div>
            <button 
              className={styles.walletAddress} 
              onClick={copyAddressToClipboard}
            >
              {copyFeedback ? 'Copied!' : `Wallet: ${address ? truncateAddress(address) : 'Not connected'}`}
            </button>
          </div>
          <div className={styles.buttonContainer}>
            <StyledButton onClick={onLogout} className={styles.logoutButton}>
              Logout
            </StyledButton>
            <StyledButton onClick={() => setIsWithdrawModalOpen(true)} className={styles.withdrawButton}>
              Withdraw
            </StyledButton>
          </div>
        </div>
      </nav>
      <main className={styles.mainContent}>
        {activeTab === 'analytics' && <Analytics apiKey={apiKey} />}
        {activeTab === 'paymentLinks' && <PaymentLinks apiKey={apiKey} />}
        {activeTab === 'paymentHistory' && <PaymentHistory apiKey={apiKey} />}
        {activeTab === 'cart' && <Cart />}
        {activeTab === 'subscriptions' && <Subscriptions />}
      </main>
      {isWithdrawModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Withdraw USDC</h3>
            <div className={styles.inputContainer}>
              <input
                type="text"
                placeholder="Amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className={styles.withdrawInput}
              />
              <button onClick={handleMaxAmount} className={styles.maxButton}>Max</button>
            </div>
            <input
              type="text"
              placeholder="Recipient Address"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              className={styles.withdrawInput}
            />
            <div className={styles.modalButtonContainer}>
              <StyledButton onClick={() => setIsWithdrawModalOpen(false)} className={styles.closeButton}>
                Close
              </StyledButton>
              <StyledButton onClick={handleWithdraw} disabled={withdrawStatus === 'pending'} className={styles.confirmButton}>
                {withdrawStatus === 'pending' ? 'Processing...' : 'Confirm Withdrawal'}
              </StyledButton>
            </div>
            {withdrawStatus === 'success' && <p className={styles.statusMessage}>Withdrawal successful!</p>}
            {withdrawStatus === 'error' && <p className={styles.statusMessage}>Error occurred during withdrawal. Please try again.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;