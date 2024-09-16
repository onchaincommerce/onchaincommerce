"use client";

import React, { useEffect, useRef } from 'react';

const MoneySymbolCursor: React.FC = () => {
  const cursorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moneySymbols = ['💰', '💵', '💸'];
    let lastCreationTime = 0;
    const creationInterval = 50;
    
    const handlePointerMove = (e: PointerEvent) => {
      const { clientX, clientY } = e;
      const currentTime = Date.now();

      if (currentTime - lastCreationTime > creationInterval && Math.random() < 0.5) {
        lastCreationTime = currentTime;
        const symbol = document.createElement('div');
        symbol.textContent = moneySymbols[Math.floor(Math.random() * moneySymbols.length)];
        symbol.classList.add('money-symbol');
        symbol.style.left = `${clientX}px`;
        symbol.style.top = `${clientY}px`;
        
        cursorContainerRef.current?.appendChild(symbol);

        requestAnimationFrame(() => {
          symbol.style.opacity = '1';
          symbol.style.transform = `translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px)`;
        });

        setTimeout(() => {
          symbol.style.opacity = '0';
        }, 500);

        setTimeout(() => {
          cursorContainerRef.current?.removeChild(symbol);
        }, 1000);
      }
    };

    document.addEventListener('pointermove', handlePointerMove);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <>
      <div ref={cursorContainerRef} id="cursor-container" />
      <style jsx global>{`
        .money-symbol {
          position: fixed;
          pointer-events: none;
          font-size: 20px;
          opacity: 0;
          transition: transform 0.5s, opacity 0.5s;
          z-index: 9999;
        }
      `}</style>
    </>
  );
};

export default MoneySymbolCursor;