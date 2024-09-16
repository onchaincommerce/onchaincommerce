"use client";

import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

const GlowingButton = () => {
  const { login, ready, authenticated } = usePrivy();

  const handleClick = () => {
    if (ready && !authenticated) {
      login();
    }
  };

  return (
    <>
      <button className="glow-button" onClick={handleClick}>
        Enter
      </button>
      <style jsx>{`
        .glow-button {
          padding: 20px 60px;
          font-size: 28px;
          font-weight: 900;
          color: #00ffff;
          background-color: rgba(0, 255, 255, 0.1);
          border: 2px solid #00ffff;
          border-radius: 50px;
          cursor: pointer;
          outline: none;
          position: relative;
          overflow: hidden;
          animation: pulse 2s infinite;
          box-shadow: 0 0 20px #00ffff, inset 0 0 20px #00ffff;
          text-shadow: 0 0 10px #00ffff;
          transition: all 0.3s ease;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 20px #00ffff, inset 0 0 20px #00ffff;
          }
          50% {
            box-shadow: 0 0 40px #00ffff, inset 0 0 30px #00ffff;
          }
        }

        .glow-button:hover {
          background-color: rgba(0, 255, 255, 0.3);
          box-shadow: 0 0 50px #00ffff, inset 0 0 30px #00ffff;
          text-shadow: 0 0 15px #00ffff;
        }
      `}</style>
    </>
  );
};

export default GlowingButton;