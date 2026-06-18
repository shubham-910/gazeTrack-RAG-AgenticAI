import React, { useEffect, useRef } from 'react';

const GazeVisualizer = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Responsive scaling
    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width || 400;
      canvas.height = rect.height || 350;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle parameters
    const particleCount = 45;
    const particles = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1.5,
        color: Math.random() > 0.4 ? 'rgba(99, 102, 241, 0.4)' : 'rgba(16, 185, 129, 0.4)', // Indigo and Emerald
      });
    }

    // Tracking cursor coordinates to simulate eye focus
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let orbitAngle = 0;

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background grid lines (radar overlay)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw dynamic central attention orbit rings
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      orbitAngle += 0.005;

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 75, 0, Math.PI * 2);
      ctx.stroke();

      // Outer dashed tracking ring
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.setLineDash([6, 15]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, 110, orbitAngle, orbitAngle + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dashed state

      // Focus tracking target coordinate
      const target = mouseRef.current.active 
        ? mouseRef.current 
        : { x: centerX + Math.sin(orbitAngle * 2) * 80, y: centerY + Math.cos(orbitAngle * 2) * 60 };

      // Draw target capture crosshairs
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(target.x, target.y, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
      ctx.beginPath();
      ctx.moveTo(target.x - 24, target.y);
      ctx.lineTo(target.x + 24, target.y);
      ctx.moveTo(target.x, target.y - 24);
      ctx.lineTo(target.x, target.y + 24);
      ctx.stroke();

      // Draw and connect particles
      particles.forEach((p, idx) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Bounce boundaries
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle node
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect particles near each other
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 80) {
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 * (1 - dist / 80)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw vector lines from focus target to nearby node particles
        const distToTarget = Math.hypot(p.x - target.x, p.y - target.y);
        if (distToTarget < 130) {
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.3 * (1 - distToTarget / 130)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(target.x, target.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      });

      // Target core pulse
      ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
      ctx.beginPath();
      ctx.arc(target.x, target.y, 4, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/50 flex items-center justify-center min-h-[350px]">
      {/* Dynamic scanline overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent bg-[size:100%_4px] pointer-events-none opacity-40"></div>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block cursor-crosshair" />
    </div>
  );
};

export default GazeVisualizer;
