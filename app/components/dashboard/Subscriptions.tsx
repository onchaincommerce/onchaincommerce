import React, { useState, useEffect } from 'react';
import { useCoinbaseWallet } from '../wallet/CoinbaseWalletProvider';
import { ethers } from 'ethers';
import styles from './Subscriptions.module.css';

interface Subscription {
  id: string;
  name: string;
  price: number;
  interval: 'daily' | 'weekly' | 'monthly';
}

const Subscriptions: React.FC = () => {
  const { address, provider, smartWallet } = useCoinbaseWallet();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [newSubscription, setNewSubscription] = useState<Subscription>({
    id: '', name: '', price: 0, interval: 'monthly'
  });
  const [activeSubscriptions, setActiveSubscriptions] = useState<string[]>([]);

  useEffect(() => {
    // Load subscriptions from local storage or API
    const savedSubscriptions = localStorage.getItem('subscriptions');
    if (savedSubscriptions) {
      setSubscriptions(JSON.parse(savedSubscriptions));
    }
  }, []);

  useEffect(() => {
    // Save subscriptions to local storage
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  const addSubscription = () => {
    if (newSubscription.name && newSubscription.price > 0) {
      setSubscriptions([...subscriptions, { ...newSubscription, id: Date.now().toString() }]);
      setNewSubscription({ id: '', name: '', price: 0, interval: 'monthly' });
    }
  };

  const activateSubscription = async (subscription: Subscription) => {
    if (!smartWallet) {
      console.error('Smart wallet not initialized');
      return;
    }

    try {
      // Create a session key for this subscription
      const sessionKeyAddress = await smartWallet.createSessionKey({
        permissions: [
          {
            target: address, // The merchant's address
            value: ethers.utils.parseEther(subscription.price.toString()),
            functionSelector: '0x', // Allow any function call
          },
        ],
        expirationDate: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
      });

      console.log(`Session key created: ${sessionKeyAddress}`);

      // Here you would typically store the session key and subscription details
      // in your backend to manage recurring payments

      setActiveSubscriptions([...activeSubscriptions, subscription.id]);

      // For demonstration, we'll just log the activation
      console.log(`Subscription activated: ${subscription.name}`);
    } catch (error) {
      console.error('Error activating subscription:', error);
    }
  };

  const cancelSubscription = (subscriptionId: string) => {
    // Here you would typically revoke the session key on the smart wallet
    // and update your backend to stop recurring payments

    setActiveSubscriptions(activeSubscriptions.filter(id => id !== subscriptionId));
    console.log(`Subscription cancelled: ${subscriptionId}`);
  };

  return (
    <div className={styles.subscriptionsContainer}>
      <h2>Manage Subscriptions</h2>
      <div className={styles.newSubscriptionForm}>
        <input
          type="text"
          value={newSubscription.name}
          onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
          placeholder="Subscription name"
        />
        <input
          type="number"
          value={newSubscription.price}
          onChange={(e) => setNewSubscription({ ...newSubscription, price: Number(e.target.value) })}
          placeholder="Price"
        />
        <select
          value={newSubscription.interval}
          onChange={(e) => setNewSubscription({ ...newSubscription, interval: e.target.value as 'daily' | 'weekly' | 'monthly' })}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <button onClick={addSubscription}>Add Subscription</button>
      </div>
      <div className={styles.subscriptionList}>
        {subscriptions.map(subscription => (
          <div key={subscription.id} className={styles.subscriptionItem}>
            <h3>{subscription.name}</h3>
            <p>${subscription.price} / {subscription.interval}</p>
            {activeSubscriptions.includes(subscription.id) ? (
              <button onClick={() => cancelSubscription(subscription.id)}>Cancel Subscription</button>
            ) : (
              <button onClick={() => activateSubscription(subscription)}>Activate Subscription</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscriptions;