import React, { useRef, useState, useEffect } from 'react';

const DrawingCanvas = ({ onCircleDetected }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const lastPointRef = useRef(null);
  const hueRef = useRef(0);
  const [magicCircle, setMagicCircle] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    hueRef.current = 220; // start at blue
    setIsDrawing(true);
    lastPointRef.current = { x, y };
    setPoints([{ x, y }]);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Cycle between blue (220) and purple (280)
    hueRef.current = 220 + ((hueRef.current - 220 + 2) % 60);
    const hue = hueRef.current;

    // Outer glow pass
    ctx.save();
    ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.4)`;
    ctx.lineWidth = 18;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();

    // Core bright trail
    ctx.save();
    ctx.strokeStyle = `hsl(${hue}, 100%, 75%)`;
    ctx.lineWidth = 5;
    ctx.shadowBlur = 18;
    ctx.shadowColor = `hsl(${hue}, 100%, 80%)`;
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();

    // White hot centre
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#fff';
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();

    lastPointRef.current = { x, y };
    setPoints(prev => [...prev, { x, y }]);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      checkForCircle();
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (isDrawing) {
      setIsDrawing(false);
      clearCanvas();
    }
  };

  useEffect(() => {
    if (!isDrawing) return;
    const interval = setInterval(() => {
      new Audio('/SoundEffects/drawSound.wav').play().catch(() => {});
    }, 500);
    return () => clearInterval(interval);
  }, [isDrawing]);

  const checkForCircle = () => {
    if (points.length < 20) { clearCanvas(); return; }

    const centerX = points.reduce((s, p) => s + p.x, 0) / points.length;
    const centerY = points.reduce((s, p) => s + p.y, 0) / points.length;
    const distances = points.map(p => Math.hypot(p.x - centerX, p.y - centerY));
    const avg = distances.reduce((s, d) => s + d, 0) / distances.length;
    const stdDev = Math.sqrt(distances.reduce((s, d) => s + (d - avg) ** 2, 0) / distances.length);
    const startEnd = Math.hypot(points[0].x - points[points.length - 1].x, points[0].y - points[points.length - 1].y);

    if (stdDev < avg * 0.3 && startEnd < avg * 0.5) {
      clearCanvas();
      new Audio('/SoundEffects/confirmDrawing.wav').play().catch(() => {});
      setMagicCircle({ x: centerX, y: centerY, r: avg });
      setTimeout(() => {
        setMagicCircle(null);
        onCircleDetected({ centerX, centerY, radius: avg });
      }, 900);
      return;
    }
    clearCanvas();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPoints([]);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
      <style>{`
        @keyframes magicCircleFade {
          0%   { opacity: 0; transform: scale(0.7); }
          30%  { opacity: 1; transform: scale(1.05); }
          70%  { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.1); }
        }
      `}</style>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={380}
          height={240}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onContextMenu={handleContextMenu}
          style={{ background: 'transparent', display: 'block' }}
        />
        {magicCircle && (
          <img
            src="/InteractableUI/SimilarMagicCircle.png"
            alt="magic circle"
            style={{
              position: 'absolute',
              left: magicCircle.x - magicCircle.r,
              top:  magicCircle.y - magicCircle.r,
              width:  magicCircle.r * 2,
              height: magicCircle.r * 2,
              pointerEvents: 'none',
              animation: 'magicCircleFade 0.9s ease-out forwards',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DrawingCanvas;
