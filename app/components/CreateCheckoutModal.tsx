import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface CreateCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
}

const CreateCheckoutModal: React.FC<CreateCheckoutModalProps> = ({ isOpen, onClose, apiKey }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pricingType, setPricingType] = useState('fixed_price');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [collectName, setCollectName] = useState(false);
  const [collectEmail, setCollectEmail] = useState(false);
  const [checkoutId, setCheckoutId] = useState('');
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sendingSMS, setSendingSMS] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const createCheckout = async (checkoutData: any) => {
    try {
      const response = await axios.post(
        'https://api.commerce.coinbase.com/checkouts',
        {
          name: checkoutData.name,
          description: checkoutData.description,
          pricing_type: checkoutData.pricingType,
          local_price: {
            amount: checkoutData.amount,
            currency: checkoutData.currency
          },
          requested_info: [
            ...(checkoutData.collectName ? ['name'] : []),
            ...(checkoutData.collectEmail ? ['email'] : [])
          ]
        },
        {
          headers: {
            'X-CC-Api-Key': apiKey,
            'X-CC-Version': '2018-03-22',
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating checkout:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error.message || 'Failed to create checkout. Please check your input data.');
      }
      throw new Error('Failed to create checkout. Please check your input data.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCheckoutId('');

    try {
      const checkoutData = {
        name,
        description,
        pricingType,
        amount,
        currency,
        collectName,
        collectEmail
      };

      const result = await createCheckout(checkoutData);
      setCheckoutId(result.data.id);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const copyToClipboard = () => {
    const checkoutUrl = `https://commerce.coinbase.com/checkout/${checkoutId}`;
    navigator.clipboard.writeText(checkoutUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000); // Reset after 2 seconds
    });
  };

  const sendSMS = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    setSendingSMS(true);
    try {
      const response = await axios.post('/api/send-sms', {
        to: phoneNumber,
        body: `Here's your Coinbase Commerce checkout link: https://commerce.coinbase.com/checkout/${checkoutId}`
      });
      if (response.data.success) {
        setSmsSent(true);
        setPhoneNumber('');
      } else {
        setError('Failed to send SMS. Please try again.');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      setError('Failed to send SMS. Please try again.');
    }
    setSendingSMS(false);
  };

  useEffect(() => {
    if (!isOpen) {
      // Reset form state when modal is closed
      setName('');
      setDescription('');
      setPricingType('fixed_price');
      setAmount('');
      setCurrency('USD');
      setCollectName(false);
      setCollectEmail(false);
      setCheckoutId('');
      setError('');
      setPhoneNumber('');
      setSendingSMS(false);
      setSmsSent(false);
      setLinkCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Create Checkout</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {!checkoutId ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Checkout Name"
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
            <select
              value={pricingType}
              onChange={(e) => setPricingType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            >
              <option value="fixed_price">Fixed Price</option>
              <option value="no_price">No Price</option>
            </select>
            {pricingType === 'fixed_price' && (
              <>
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
              </>
            )}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={collectName}
                  onChange={(e) => setCollectName(e.target.checked)}
                  className="mr-2"
                />
                Collect Customer Name
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={collectEmail}
                  onChange={(e) => setCollectEmail(e.target.checked)}
                  className="mr-2"
                />
                Collect Customer Email
              </label>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Create Checkout
            </button>
          </form>
        ) : (
          <div className="mt-4">
            <p className="font-semibold mb-2">Checkout Created Successfully!</p>
            <p className="mb-2">Checkout ID: <span className="font-mono bg-gray-100 p-1 rounded">{checkoutId}</span></p>
            <p className="mb-2">Checkout URL:</p>
            <div className="flex mb-4">
              <input
                type="text"
                value={`https://commerce.coinbase.com/checkout/${checkoutId}`}
                readOnly
                className="flex-grow p-2 border border-gray-300 rounded-l"
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 text-white rounded-r transition-colors ${
                  linkCopied ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {linkCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="mb-4">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="w-full p-2 border border-gray-300 rounded mb-2"
              />
              <button
                onClick={sendSMS}
                disabled={sendingSMS}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {sendingSMS ? 'Sending...' : 'Send Checkout Link via SMS'}
              </button>
              {smsSent && <p className="text-green-500 mt-2">SMS sent successfully!</p>}
            </div>
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CreateCheckoutModal;