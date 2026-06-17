import React, { useState, useEffect } from 'react';
import ButterflyDiagramCanvas from './ButterflyDiagramCanvas';

const BROWN = '#703737';
const CREAM = '#e8d5b4';
const DARK  = '#1a0f0f';
const GOLD  = '#f6b825';

const BUTTERFLY_EXAMPLE = { numerator1: 1, denominator1: 2, numerator2: 1, denominator2: 3, operator: '+' };
const BUTTERFLY_SLIDE_INDEX = 2;

const Heart = ({ filled }) => (
  <span style={{ fontSize: 18, color: filled ? '#e0245e' : '#5a3a3a', filter: filled ? 'drop-shadow(0 0 3px #e0245e)' : 'none' }}>
    {filled ? '❤' : '♡'}
  </span>
);

const slides = [
  {
    title: 'WELCOME, WIZARD',
    icon: '🧙',
    body: 'You are a young wizard between the Fraction Islands. Each islands guards monsters that can only be defeated with correctly cast fraction spells.\n\nThis quick guide explains how battles work before you set the game',
  },
  {
    title: 'THE SAME CONTAINER',
    icon: '🪄',
    body: 'On the Similiar Island, When two fractions share the same denominator, they are stored in the "Same Container" — picture both fractions poured into one jar split into equal slices.\n\nBecause the slices already match, you skip cross-multiplying and just add or subtract the top numbers (numerators) directly.',
    visual: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, margin: '10px 0' }}>
        {['2', '1'].map((n, i) => (
          <React.Fragment key={i}>
            {i === 1 && <span style={{ fontSize: 20, fontWeight: 900, color: GOLD }}>+</span>}
            <div style={{
              width: 54, height: 64, border: `2px solid ${BROWN}`, borderRadius: 6,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              background: 'rgba(112,55,55,0.08)', overflow: 'hidden',
            }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: DARK }}>{n}</div>
              <div style={{ height: 2, background: BROWN }} />
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: DARK }}>5</div>
            </div>
          </React.Fragment>
        ))}
        <span style={{ fontSize: 20, fontWeight: 900, color: GOLD }}>=</span>
        <div style={{
          width: 54, height: 64, border: `2px solid ${GOLD}`, borderRadius: 6,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          background: 'rgba(246,184,37,0.12)',
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: DARK }}>3</div>
          <div style={{ height: 2, background: GOLD }} />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: DARK }}>5</div>
        </div>
      </div>
    ),
  },
  {
    title: 'THE BUTTERFLY METHOD',
    icon: '🦋',
    body: 'On Dissimilar Island, the denominators do not match — so the Same Container trick will not work. Instead, cross-multiply like a butterfly\'s wings:\n\n1. LEFT numerator × RIGHT denominator\n2. RIGHT numerator × LEFT denominator\n3. Multiply BOTH denominators together for the new bottom number\n4. Combine the two cross products with the operator for the new top number\n\nDraw the ∞ symbol to open the fields, then fill in each step.',
    isButterfly: true,
  },
  {
    title: 'HYBRID ISLAND',
    icon: '🌀',
    body: 'Hybrid Island throws mixed numbers at you — a whole number plus a fraction (e.g. 1 1/2).\n\nBefore casting, convert each mixed number into an improper fraction:\n\nwhole × denominator + numerator, kept over the same denominator.\n\nOnce both fractions are improper, finish the spell with the Butterfly Method.',
    visual: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '10px 0', fontSize: 13, fontWeight: 900, color: DARK }}>
        <span>1</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>1</span><div style={{ width: 22, height: 2, background: BROWN, margin: '3px 0' }} /><span>2</span>
        </div>
        <span style={{ fontSize: 18, color: GOLD }}>→</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>3</span><div style={{ width: 22, height: 2, background: GOLD, margin: '3px 0' }} /><span>2</span>
        </div>
      </div>
    ),
  },
  {
    title: 'CASTING A SPELL',
    icon: '✨',
    body: 'Casting works in pieces, just like assembling a spell from components:\n\n1. Draw a circle to channel your magic and reveal the input fields.\n2. Select the pieces — fill in the denominator and the numerator expression (e.g. 2+1).\n3. Combine them into your final fraction, simplified if possible.\n4. Press Cast Spell to unleash it on the enemy!',
  },
  {
    title: 'YOUR LIVES',
    icon: '💗',
    body: 'You begin every battle with 3 lives.\n\nEvery time you cast an incorrect spell, you lose a life and the enemy strikes back. Lose all 3 lives and the battle ends in defeat — so think before you cast!',
    visual: (
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '12px 0' }}>
        <Heart filled /><Heart filled /><Heart filled />
      </div>
    ),
  },
  {
    title: 'STREAKS & MULTIPLIERS',
    icon: '🔥',
    body: 'Cast correct spells back-to-back to build a streak. Each streak point raises your score multiplier by 0.2x, up to a maximum of 2.0x.\n\nA single wrong answer — or using a hint — resets your streak to zero. Stay sharp and chain your correct casts for maximum points!',
  },
  {
    title: 'ENEMY & BOSS HEALTH',
    icon: '👾',
    body: 'Every enemy has a 3 hearts across a number of hit points. Each correct spell chips away part of their health, regardless of whether the problem is addition or subtraction — the same casting rules apply both ways.\n\nStage 6 of every island holds a Boss with much more health than a regular enemy — defeat it to conquer the island!',
    isLast: true,
  },
];

const PixelBtn = ({ onClick, disabled, primary, children }) => (
  <button onClick={onClick} disabled={disabled} style={{
    position: 'relative',
    padding: '10px 20px',
    background: disabled ? '#4a2a2a' : primary ? BROWN : CREAM,
    border: `3px solid ${BROWN}`,
    color: disabled ? '#6b4040' : primary ? CREAM : BROWN,
    fontFamily: '"Press Start 2P", monospace',
    fontSize: 9,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: 0,
    whiteSpace: 'nowrap',
  }}>
    {children}
  </button>
);

const GameMechanicsIntro = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const [butterflyStep, setButterflyStep] = useState(0);
  const slide = slides[index];
  const total = slides.length;

  const next = () => index < total - 1 ? setIndex(i => i + 1) : onComplete();
  const prev = () => index > 0 && setIndex(i => i - 1);

  useEffect(() => {
    if (index !== BUTTERFLY_SLIDE_INDEX) {
      setButterflyStep(0);
      return;
    }
    const id = setInterval(() => {
      setButterflyStep(s => (s + 1) % 6);
    }, 1100);
    return () => clearInterval(id);
  }, [index]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.78)' }}>
      <div style={{
        position: 'relative',
        width: 420,
        maxWidth: '90vw',
        background: CREAM,
        border: `4px solid ${BROWN}`,
        fontFamily: '"Press Start 2P", monospace',
      }}>
        {/* corner pixels */}
        <div style={{ position:'absolute', inset:5, border:`1px solid ${BROWN}`, pointerEvents:'none' }} />
        {[[-6,-6],[null,-6],[-6,null],[null,null]].map(([t,l],i)=>(
          <div key={i} style={{ position:'absolute', zIndex:10, pointerEvents:'none', width:12, height:12, background:BROWN,
            ...(t!==null?{top:t}:{bottom:-6}), ...(l!==null?{left:l}:{right:-6}) }}/>
        ))}

        {/* Header */}
        <div style={{ background: BROWN, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 9, color: CREAM, letterSpacing: 1 }}>{slide.icon} {slide.title}</span>
          <button onClick={onComplete} style={{ fontSize: 8, color: CREAM, background: 'transparent', border: `1px solid ${CREAM}`, padding: '3px 8px', fontFamily: '"Press Start 2P", monospace', cursor: 'pointer' }}>SKIP</button>
        </div>

        {/* Body */}
        <div style={{ padding: '18px 18px 8px' }}>
          {slide.isButterfly ? (
            <div style={{ width: 368, height: 168, margin: '0 auto', overflow: 'hidden', position: 'relative' }}>
              <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
                <ButterflyDiagramCanvas problem={BUTTERFLY_EXAMPLE} currentStep={butterflyStep} />
              </div>
            </div>
          ) : slide.visual}
          <div style={{ fontSize: 9, color: DARK, lineHeight: 1.9, whiteSpace: 'pre-line' }}>
            {slide.body}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `2px solid ${BROWN}` }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {slides.map((_, i) => (
              <div key={i} style={{ width: i === index ? 14 : 7, height: 7, background: i === index ? BROWN : '#b09090', transition: 'all 0.2s' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <PixelBtn onClick={prev} disabled={index === 0}>← BACK</PixelBtn>
            <PixelBtn onClick={next} primary>{slide.isLast ? 'SET! →' : 'NEXT →'}</PixelBtn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMechanicsIntro;
