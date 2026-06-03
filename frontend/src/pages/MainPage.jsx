import React, { useEffect, useRef } from 'react';
import './MainPage.css';

const MainPage = ({ onStart }) => {
  const canvasRef = useRef(null);
  const frameRef  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.6 + 0.3,
      alpha: Math.random() * 0.6 + 0.4,
      twinkleSpeed: Math.random() * 0.008 + 0.003,
      twinkleDir: Math.random() < 0.5 ? 1 : -1,
      vx: (Math.random() - 0.5) * 0.00007,
      vy: (Math.random() - 0.5) * 0.00007,
      color: ['#ffffff','#cce4ff','#ffe8cc','#e0ccff'][Math.floor(Math.random() * 4)],
    }));

    const NEBULAE = [
      { cx: 0.15, cy: 0.25, r: 0.25, c: [100, 60, 200] },
      { cx: 0.80, cy: 0.55, r: 0.20, c: [60, 100, 220] },
      { cx: 0.50, cy: 0.78, r: 0.16, c: [180, 60, 150] },
      { cx: 0.35, cy: 0.45, r: 0.14, c: [60, 160, 200] },
    ];

    const shootingStars = [];
    let nextShot = Date.now() + 2000 + Math.random() * 3000;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      NEBULAE.forEach(n => {
        const gx = n.cx * w, gy = n.cy * h, gr = n.r * Math.max(w, h);
        const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        grad.addColorStop(0, `rgba(${n.c[0]},${n.c[1]},${n.c[2]},0.13)`);
        grad.addColorStop(1, `rgba(${n.c[0]},${n.c[1]},${n.c[2]},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(gx, gy, gr, 0, Math.PI * 2);
        ctx.fill();
      });

      stars.forEach(p => {
        p.alpha += p.twinkleSpeed * p.twinkleDir;
        if (p.alpha > 1)   { p.alpha = 1;   p.twinkleDir = -1; }
        if (p.alpha < 0.2) { p.alpha = 0.2; p.twinkleDir =  1; }
        p.x = (p.x + p.vx + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (p.r > 1.2) {
          ctx.globalAlpha = p.alpha * 0.35;
          ctx.beginPath();
          ctx.arc(p.x * w, p.y * h, p.r * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      const now = Date.now();
      if (now >= nextShot) {
        const angle = (25 + Math.random() * 35) * Math.PI / 180;
        const speed = 0.007 + Math.random() * 0.005;
        shootingStars.push({
          x: Math.random() * 0.65, y: Math.random() * 0.4,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          alpha: 1, tail: [], tailLen: 28 + Math.floor(Math.random() * 18),
        });
        nextShot = now + 2500 + Math.random() * 4000;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.tail.unshift({ x: s.x, y: s.y });
        if (s.tail.length > s.tailLen) s.tail.pop();
        s.x += s.vx; s.y += s.vy; s.alpha -= 0.013;
        if (s.x > 1.1 || s.y > 1.1 || s.alpha <= 0) { shootingStars.splice(i, 1); continue; }
        if (s.tail.length > 1) {
          const last = s.tail[s.tail.length - 1];
          const tg = ctx.createLinearGradient(s.x * w, s.y * h, last.x * w, last.y * h);
          tg.addColorStop(0, `rgba(255,255,255,${s.alpha})`);
          tg.addColorStop(1, 'rgba(200,220,255,0)');
          ctx.save();
          ctx.strokeStyle = tg; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(s.x * w, s.y * h);
          s.tail.forEach(tp => ctx.lineTo(tp.x * w, tp.y * h));
          ctx.stroke(); ctx.restore();
        }
        ctx.save(); ctx.globalAlpha = s.alpha;
        const hg = ctx.createRadialGradient(s.x * w, s.y * h, 0, s.x * w, s.y * h, 5);
        hg.addColorStop(0, 'rgba(255,255,255,1)'); hg.addColorStop(1, 'rgba(200,220,255,0)');
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(s.x * w, s.y * h, 5, 0, Math.PI * 2);
        ctx.fill(); ctx.restore();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="main-page">
      <canvas ref={canvasRef} className="main-canvas" />

      <div className="main-content">
        <div className="main-title-group">
          <h1 className="main-title">WIZARDFRAC</h1>
          <h2 className="main-solve">SOLVE IT!</h2>
          <p className="main-tagline">Master your fractions skills</p>
        </div>

        <button className="main-start-btn" onClick={onStart}>
          Start your Journey
        </button>
      </div>
    </div>
  );
};

export default MainPage;
