"use client";

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useCoinbaseWallet } from '../wallet/CoinbaseWalletProvider';
import StyledButton from '../StyledButton';
import styles from './RefundButton.module.css';

interface RefundButtonProps {
  charge: {
    id: string;
    pricing: { local: { amount: string; currency: string } };
  };
}

const RefundButton: React.FC<RefundButtonProps> = ({ charge }) => {
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundAddress, setRefundAddress] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);
  const { wallet, address, balance } = useCoinbaseWallet();

  const handleRefund = async () => {
    if (!refundAddress) {
      alert('Please enter a refund address');
      return;
    }

    setIsRefunding(true);
    try {
      if (!wallet || !address) {
        throw new Error('Wallet not connected');
      }

      const amountWei = ethers.utils.parseEther(amount);
      const balanceWei = ethers.utils.parseEther(balance || '0');

      if (amountWei.gt(balanceWei)) {
        alert(`Insufficient balance. Your current balance is ${balance} ETH`);
        return;
      }

      const provider = new ethers.providers.Web3Provider(wallet);
      const signer = provider.getSigner();

      const amountUSDC = ethers.utils.parseUnits(charge.pricing.local.amount, 6);
      const usdcContractAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

      // Create USDC contract instance
      const usdcContract = new ethers.Contract(
        usdcContractAddress,
        ['function transfer(address to, uint256 amount) returns (bool)'],
        signer
      );

      // Send the transaction
      const tx = await signer.sendTransaction({
        to: refundAddress,
        value: amountUSDC,
        gasLimit: gasLimit,
        gasPrice: gasPrice
      });

      console.log('Refund transaction hash:', receipt.transactionHash);
      alert(`Refund initiated! Transaction hash: ${receipt.transactionHash}`);
      setRefundAddress('');
      setIsRefundModalOpen(false);
    } catch (error) {
      console.error('Refund failed:', error);
      if (error instanceof Error) {
        alert(`Refund failed: ${error.message}`);
      } else {
        alert('Refund failed. Please try again.');
      }
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <>
      <StyledButton onClick={() => setIsRefundModalOpen(true)} className={styles.refundButton}>
        Refund USDC
      </StyledButton>

      {isRefundModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.title}>Refund USDC</h2>
            <div className={styles.refundForm}>
              <p>Refund amount: {charge.pricing.local.amount} USDC</p>
              <input
                type="text"
                value={refundAddress}
                onChange={(e) => setRefundAddress(e.target.value)}
                placeholder="Enter refund address"
                className={styles.addressInput}
              />
              <StyledButton 
                onClick={handleRefund} 
                className={styles.refundButton}
                disabled={isRefunding || !refundAddress}
              >
                {isRefunding ? 'Refunding...' : 'Refund USDC'}
              </StyledButton>
              <StyledButton 
                onClick={() => setIsRefundModalOpen(false)} 
                className={styles.closeButton}
              >
                Close
              </StyledButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RefundButton;