import React, { useState } from 'react';
import axios from 'axios';

interface ChargeGeneratorProps {
  coinbaseApiKey: string;
}

const ChargeGenerator: React.FC<ChargeGeneratorProps> = ({ coinbaseApiKey }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [chargeLink, setChargeLink] = useState('');
  const [copied, setCopied] = useState(false);

  const createCharge = async () => {
    try {
      const response = await axios.post(
        'https://api.commerce.coinbase.com/charges',
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

      setChargeLink(response.data.data.hosted_url);
    } catch (error) {
      console.error('Error creating charge:', error);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(chargeLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendTextMessage = async () => {
    try {
      const response = await axios.post('/api/send-sms', { link: chargeLink });
      alert('SMS sent successfully!');
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('Failed to send SMS');
    }
  };

  return (
    <div className="charge-generator">
      <h2 className="section-title">Generate Charge</h2>
      <div className="form">
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
        <button onClick={createCharge}>Create Charge</button>
      </div>
      {chargeLink && (
        <div className="charge-link">
          <input type="text" value={chargeLink} readOnly />
          <button onClick={copyLink}>{copied ? 'Copied!' : 'Copy'}</button>
          <button onClick={sendTextMessage}>Send SMS</button>
        </div>
      )}
      <style jsx>{`
        .charge-generator {
          background-color: rgba(0, 255, 255, 0.1);
          border: 1px solid #00ffff;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        }
        .section-title {
          padding: 10px 20px;
          font-size: 16px;
          font-weight: bold;
          color: #00ffff;
          background-color: rgba(0, 255, 255, 0.1);
          border: 2px solid #00ffff;
          border-radius: 25px;
          cursor: pointer;
          outline: none;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 0 10px #00ffff, inset 0 0 10px #00ffff;
          text-shadow: 0 0 5px #00ffff;
          display: inline-block;
          margin-bottom: 20px;
        }
        .form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        input, select {
          background-color: rgba(0, 255, 255, 0.1);
          border: 1px solid #00ffff;
          color: #00ffff;
          padding: 5px 10px;
          border-radius: 5px;
        }
        button {
          background-color: #00ffff;
          color: black;
          border: none;
          padding: 5px 10px;
          cursor: pointer;
          border-radius: 5px;
        }
        .charge-link {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }
        .charge-link input {
          flex-grow: 1;
        }
      `}</style>
    </div>
  );
};

export default ChargeGenerator;