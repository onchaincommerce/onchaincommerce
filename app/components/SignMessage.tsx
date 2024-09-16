import { useWallets } from '@privy-io/react-auth';

export const signMessage = async (message: string) => {
  const { wallets } = useWallets();
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
