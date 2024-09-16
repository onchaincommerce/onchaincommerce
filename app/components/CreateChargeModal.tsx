import React, { useState } from 'react';
import axios from 'axios';

interface CreateChargeModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  apiKey: string;
}

const CreateChargeModal: React.FC<CreateChargeModalProps> = ({ isOpen, onRequestClose, apiKey }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [chargeLink, setChargeLink] = useState('');
  const [transactionLink, setTransactionLink] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);

  const handleCreateCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('https://api.commerce.coinbase.com/charges', {
        name,
        description,
        pricing_type: 'fixed_price',
        local_price: {
          amount,
          currency,
        },
      }, {
        headers: {
          'X-CC-Api-Key': apiKey,
          'X-CC-Version': '2018-03-22',
          'Content-Type': 'application/json',
        }
      });
      setChargeLink(response.data.data.hosted_url);
      
      // Poll for charge status
      const pollCharge = setInterval(async () => {
        const chargeResponse = await axios.get(`https://api.commerce.coinbase.com/charges/${response.data.data.id}`, {
          headers: {
            'X-CC-Api-Key': apiKey,
            'X-CC-Version': '2018-03-22',
          }
        });
        const charge = chargeResponse.data.data;
        const completedEvent = charge.timeline.find((event: any) => event.status === 'COMPLETED');
        if (completedEvent) {
          clearInterval(pollCharge);
          setTransactionLink(`https://basescan.org/tx/${completedEvent.transaction_id}`);
        }
      }, 5000); // Poll every 5 seconds
    } catch (error) {
      console.error('Error creating charge:', error);
      setError('Failed to create charge. Please check your input data.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(chargeLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  const sendSMS = async () => {
    setIsSendingSMS(true);
    setError('');
    try {
      await axios.post('/api/send-sms', { to: phoneNumber, body: `Here's your payment link: ${chargeLink}` });
      alert('SMS sent successfully!');
    } catch (error) {
      console.error('Error sending SMS:', error);
      setError('Failed to send SMS. Please try again.');
    } finally {
      setIsSendingSMS(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Create Charge</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleCreateCharge}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Charge Name"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            required
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            required
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Create Charge
          </button>
        </form>
        {chargeLink && (
          <div className="mt-4">
            <p className="mb-2">Charge Link:</p>
            <div className="flex items-center">
              <input
                type="text"
                value={chargeLink}
                readOnly
                className="flex-grow p-2 border border-gray-300 rounded-l"
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 rounded-r transition-colors ${
                  copied 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="mt-4">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number"
                className="w-full p-2 border border-gray-300 rounded mb-2"
              />
              <button
                onClick={sendSMS}
                disabled={isSendingSMS}
                className={`w-full px-4 py-2 text-sm font-medium text-white rounded-md ${
                  isSendingSMS 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSendingSMS ? 'Sending...' : 'Send via SMS'}
              </button>
            </div>
          </div>
        )}
        {transactionLink && (
          <div className="mt-4">
            <p className="mb-2">Transaction Link:</p>
            <a href={transactionLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              View Transaction
            </a>
          </div>
        )}
        <button
          onClick={onRequestClose}
          className="mt-4 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CreateChargeModal;