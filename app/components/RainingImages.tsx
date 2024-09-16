import React, { useEffect, useRef } from 'react';

const EthereumRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const usdcImage = new Image();
    const baseImage = new Image();
    usdcImage.src = '/images/usdc-logo.png';
    baseImage.src = '/images/base-logo.png';

    const symbols = [];
    const maxSymbols = 50;
    let mouse = { x: 0, y: 0 };

    class Symbol {
      x: number;
      y: number;
      speed: number;
      image: HTMLImageElement;
      size: number;
      angle: number;

      constructor(x: number, y: number, speed: number, image: HTMLImageElement) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.image = image;
        this.size = 30;
        this.angle = 0;
      }

      draw() {
        ctx?.save();
        ctx?.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx?.rotate(this.angle);
        ctx?.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
        ctx?.restore();
      }

      update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
          this.y = -this.size;
          this.x = Math.random() * canvas.width;
        }

        // Enhanced ripple effect
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200; // Increased from 100 to 200
        const repulsionStrength = 15; // Increased from 5 to 15

        if (distance < maxDistance) {
          const angle = Math.atan2(dy, dx);
          const force = Math.pow((maxDistance - distance) / maxDistance, 2); // Exponential force
          this.x += Math.cos(angle) * force * repulsionStrength;
          this.y += Math.sin(angle) * force * repulsionStrength;
          this.angle = angle;
          
          // Add a slight randomness to prevent symbols from clumping
          this.x += (Math.random() - 0.5) * 2;
          this.y += (Math.random() - 0.5) * 2;
        } else {
          // Gradually return to original angle when not affected by mouse
          this.angle *= 0.95;
        }

        // Keep symbols within canvas bounds
        this.x = Math.max(0, Math.min(canvas.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height, this.y));
      }
    }

    const initSymbols = () => {
      for (let i = 0; i < maxSymbols; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const speed = 1 + Math.random() * 3;
        const image = Math.random() > 0.5 ? usdcImage : baseImage;
        symbols.push(new Symbol(x, y, speed, image));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      symbols.forEach((symbol) => {
        symbol.draw();
        symbol.update();
      });
      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);

    initSymbols();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 1 }} />;
};

export default EthereumRain;