"use client";

import React, { useEffect, useRef } from 'react';

const MoneyRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cryptoSymbols = ['₿', 'Ξ', 'Ł', 'Ð', '₳', '₴', 'Ӿ', 'Ż', 'Ð', '◈'];
    const particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      size: number;
      speed: number;
      symbol: string;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.size = Math.random() * 24 + 12;
        this.speed = Math.random() * 3 + 1;
        this.symbol = cryptoSymbols[Math.floor(Math.random() * cryptoSymbols.length)];
        this.color = this.getRandomColor();
      }

      getRandomColor() {
        const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff0000', '#0000ff'];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
          this.y = Math.random() * canvas.height - canvas.height;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.font = `${this.size}px Arial`;
        ctx.fillText(this.symbol, this.x, this.y);
      }
    }

    for (let i = 0; i < 100; i++) {
      particles.push(new Particle());
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />;
};

export default MoneyRain;