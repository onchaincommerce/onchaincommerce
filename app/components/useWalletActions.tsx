import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';

export const useWalletActions = () => {
  const { wallets } = usePrivy();

  const signMessage = async (message: string) => {
    if (!wallets[0]) throw new Error('No wallet connected');

    const wallet = wallets[0];
    const provider = await wallet.getEthereumProvider();
    const address = wallet.address;

    const signature = await provider.request({
      method: 'personal_sign',
      params: [message, address],
    });

    return signature;
  };

  const sendTransaction = async (to: string, amount: string) => {
    if (!wallets[0]) throw new Error('No wallet connected');

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

    return transactionHash;
  };

  return { signMessage, sendTransaction };
};