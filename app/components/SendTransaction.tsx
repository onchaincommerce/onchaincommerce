import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';

interface SendTransactionProps {
  to: string;
  amount: string;
  currency: string;
  onSuccess: () => void;
  onError: (error: Error) => void;
  onClick: () => void;
  buttonText: string;
}

const SendTransaction: React.FC<SendTransactionProps> = ({
  to,
  amount,
  currency,
  onSuccess,
  onError,
  onClick,
  buttonText
}) => {
  const { wallets } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendTransaction = async () => {
    if (!wallets[0]) {
      onError(new Error('No wallet connected'));
      return;
    }

    setIsLoading(true);

    try {
      const wallet = wallets[0];
      const provider = await wallet.getEthereumProvider();

      const transactionRequest = {
        to,
        value: ethers.utils.parseEther(amount).toHexString(),
      };

      const transactionHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transactionRequest],
      });

      console.log('Transaction Hash:', transactionHash);
      onSuccess();
    } catch (error) {
      console.error('Error sending transaction:', error);
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
      disabled={isLoading}
    >
      {isLoading ? 'Processing...' : buttonText}
    </button>
  );
};

export default SendTransaction;