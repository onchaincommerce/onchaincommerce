import React, { useState } from 'react';
import axios from 'axios';

interface CheckoutGeneratorProps {
  coinbaseApiKey: string;
}

const CheckoutGenerator: React.FC<CheckoutGeneratorProps> = ({ coinbaseApiKey }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [checkoutId, setCheckoutId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const createCheckout = async () => {
    try {
      const response = await axios.post(
        'https://api.commerce.coinbase.com/checkouts',
        {
          name,
          description,
          pricing_type: 'fixed_price',
          local_price: {
            amount,
            currency,
          },
        },
        {
          headers: {
            'X-CC-Api-Key': coinbaseApiKey,
            'X-CC-Version': '2018-03-22',
          },
        }
      );

      setCheckoutId(response.data.data.id);
      setError('');
    } catch (err) {
      console.error('Error creating checkout:', err);
      setError('Failed to create checkout. Please try again.');
    }
  };

  const getCheckoutLink = () => {
    return `https://commerce.coinbase.com/checkout/${checkoutId}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getCheckoutLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendTextMessage = async () => {
    try {
      await axios.post('/api/send-sms', { phoneNumber, message: getCheckoutLink() });
      alert('SMS sent successfully!');
    } catch (err) {
      console.error('Error sending SMS:', err);
      alert('Failed to send SMS. Please try again.');
    }
  };

  return (
    <div className="checkout-generator">
      <h2 className="section-title">Generate Checkout</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
      </select>
      <button onClick={createCheckout}>Create Checkout</button>
      {error && <p className="error">{error}</p>}
      {checkoutId && (
        <div className="checkout-link">
          <input type="text" value={getCheckoutLink()} readOnly />
          <button onClick={copyLink}>
            {copied ? 'Copied!' : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>
          <input
            type="tel"
            placeholder="Phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <button onClick={sendTextMessage}>Send SMS</button>
        </div>
      )}
      <style jsx>{`
        .checkout-generator {
          background-color: rgba(0, 255, 255, 0.1);
          border: 1px solid #00ffff;
          border-radius: 10px;
          padding: 20px;
          color: #00ffff;
        }
        .section-title {
          margin-top: 0;
        }
        input, select {
          display: block;
          width: 100%;
          margin-bottom: 10px;
          padding: 5px;
          background-color: rgba(0, 255, 255, 0.1);
          border: 1px solid #00ffff;
          color: #00ffff;
        }
        button {
          background-color: #00ffff;
          color: black;
          border: none;
          padding: 5px 10px;
          cursor: pointer;
          border-radius: 5px;
        }
        .error {
          color: #ff0000;
        }
        .checkout-link {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }
        .checkout-link input {
          flex-grow: 1;
        }
        .checkout-link button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default CheckoutGenerator;
