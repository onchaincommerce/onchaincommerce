"use client";

import React from 'react';
import MoneyRain from './MoneyRain';

interface LoginPageProps {
  onEnter: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onEnter }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="sunset-gradient">
        <MoneyRain />
      </div>
      <button
        onClick={onEnter}
        className="px-8 py-4 text-xl font-bold text-white bg-blue-800 rounded-lg hover:bg-blue-900 transition-colors animate-bounce-slow glow-button z-10"
      >
        Enter
      </button>
    </div>
  );
};

export default LoginPage;