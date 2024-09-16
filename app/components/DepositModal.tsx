import React from 'react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, walletAddress }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-black">Deposit</h2>
        <p className="text-black mb-4">Your wallet address:</p>
        <p className="bg-gray-100 p-2 rounded break-all text-black">{walletAddress}</p>
        <button 
          onClick={onClose}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DepositModal;