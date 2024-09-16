"use client";

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useCoinbaseWallet } from '../wallet/CoinbaseWalletProvider';
import StyledButton from '../StyledButton';
import styles from './WithdrawButton.module.css';

const WithdrawButton: React.FC = () => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [amount, setAmount] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const { wallet, address, balance } = useCoinbaseWallet();

  const handleWithdraw = async () => {
    if (!amount || !destinationAddress) {
      alert('Please enter an amount and destination address');
      return;
    }

    setIsWithdrawing(true);
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

      // Estimate gas
      const gasLimit = await provider.estimateGas({
        to: destinationAddress,
        value: amountWei
      });

      // Get current gas price
      const gasPrice = await provider.getGasPrice();

      // Calculate total cost including gas
      const totalCost = amountWei.add(gasPrice.mul(gasLimit));

      if (totalCost.gt(balanceWei)) {
        alert(`Insufficient balance to cover gas fees. Try withdrawing a smaller amount.`);
        return;
      }

      // Send transaction
      const tx = await signer.sendTransaction({
        to: destinationAddress,
        value: amountWei,
        gasLimit: gasLimit,
        gasPrice: gasPrice
      });

      console.log('Withdrawal transaction hash:', tx.hash);
      alert(`Withdrawal successful! Transaction hash: ${tx.hash}`);
      setAmount('');
      setDestinationAddress('');
    } catch (error) {
      console.error('Withdrawal failed:', error);
      if (error instanceof Error) {
        alert(`Withdrawal failed: ${error.message}`);
      } else {
        alert('Withdrawal failed. Please try again.');
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className={styles.withdrawContainer}>
      <h2 className={styles.title}>Withdraw ETH</h2>
      <div className={styles.withdrawForm}>
        <input
          type="text"
          value={amount}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || /^\d*\.?\d*$/.test(value)) {
              setAmount(value);
            }
          }}
          placeholder="Amount (ETH)"
          className={styles.input}
        />
        <input
          type="text"
          value={destinationAddress}
          onChange={(e) => setDestinationAddress(e.target.value)}
          placeholder="Destination Address"
          className={styles.input}
        />
        <StyledButton 
          onClick={handleWithdraw} 
          className={styles.withdrawButton}
          disabled={isWithdrawing || !amount || !destinationAddress}
        >
          {isWithdrawing ? 'Withdrawing...' : 'Withdraw ETH'}
        </StyledButton>
      </div>
    </div>
  );
};

export default WithdrawButton;