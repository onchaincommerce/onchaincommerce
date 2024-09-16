import React, { useState } from 'react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxAmount: string;
  currency: string;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, maxAmount, currency }) => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');

  const handleMaxAmount = () => {
    setAmount(maxAmount);
  };

  const handleSuccess = () => {
    onClose();
  };

  const handleError = (error: Error) => {
    console.error('Error during withdrawal:', error);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-black">Withdraw {currency}</h2>
        <p className="mb-4 text-black">Available balance: {maxAmount} {currency}</p>
        <div className="mb-4">
          <label className="block text-black mb-2">Amount</label>
          <div className="flex">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-l"
              placeholder="Enter amount"
            />
            <button
              onClick={handleMaxAmount}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r"
            >
              Max
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-black mb-2">Destination Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter destination address"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            Cancel
          </button>
          <SendTransaction
            to={address}
            amount={amount}
            currency={currency}
            onSuccess={handleSuccess}
            onError={handleError}
            onClick={handleSuccess}
            buttonText="Confirm"
          />
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;