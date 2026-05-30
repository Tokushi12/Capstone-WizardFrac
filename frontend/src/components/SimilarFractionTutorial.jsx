import React, { useState } from 'react';

const inputBox = (value, active, locked) => ({
  width: 52, height: 44, borderRadius: 8, border: `2px solid ${locked ? '#10b981' : active ? '#8b5cf6' : '#d1d5db'}`,
  background: locked ? '#d1fae5' : active ? '#ede9fe' : '#f9fafb',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 20, fontWeight: 800, color: locked ? '#065f46' : active ? '#5b21b6' : '#9ca3af',
  transition: 'all 0.3s',
});

const Label = ({ text, color = '#6b7280' }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{text}</div>
);

const StepDiagram = ({ step }) => {
  const den = 5, num1 = 2, num2 = 1, expr = '2+1', result = 3, fracN = 3, fracD = 5;

  const denLocked  = step >= 2;
  const exprLocked = step >= 3;
  const ansLocked  = step >= 4;
  const fracLocked = step >= 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '10px 0', minHeight: 180 }}>

      {/* Problem statement */}
      <div style={{ fontSize: 22, fontWeight: 800, color: '#374151', letterSpacing: 1 }}>
        <span style={{ color: '#3b82f6' }}>{num1}/{den}</span>
        {' + '}
        <span style={{ color: '#f59e0b' }}>{num2}/{den}</span>
        {' = ?'}
      </div>

      {/* Denominator row */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Label text="Denominator (small circle)" color={step === 1 ? '#8b5cf6' : '#6b7280'} />
        <div style={inputBox(den, step === 1, denLocked)}>{denLocked ? den : step === 1 ? '?' : ''}</div>
      </div>

      {/* Expression + Answer row */}
      {step >= 2 && (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Label text="Expression (big circle)" color={step === 2 ? '#8b5cf6' : '#6b7280'} />
            <div style={inputBox(expr, step === 2, exprLocked)}>{exprLocked ? expr : step === 2 ? '?' : ''}</div>
          </div>
          {step >= 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Label text="Result" color={step === 3 ? '#8b5cf6' : '#6b7280'} />
              <div style={inputBox(result, step === 3, ansLocked)}>{ansLocked ? result : '?'}</div>
            </div>
          )}
        </div>
      )}

      {/* Final fraction */}
      {step >= 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Label text="Final answer" color={step === 4 ? '#8b5cf6' : '#6b7280'} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={inputBox(fracN, step === 4, fracLocked)}>{fracLocked ? fracN : step === 4 ? '?' : ''}</div>
            <div style={{ width: 52, height: 3, background: fracLocked ? '#10b981' : '#9ca3af', borderRadius: 2 }} />
            <div style={inputBox(fracD, step === 4, fracLocked)}>{fracLocked ? fracD : step === 4 ? '?' : ''}</div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div style={{ marginTop: 4, padding: '6px 20px', background: '#8b5cf6', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 14 }}>
          Cast Spell ✨
        </div>
      )}
    </div>
  );
};

const slides = [
  {
    step: 0,
    title: 'Similar Island',
    body: 'In Similar Island, both fractions always share the same denominator (bottom number). That makes them easy to add or subtract — no cross-multiplying needed! Follow the steps below to cast your spell.',
    computation: null,
    color: null,
  },
  {
    step: 1,
    title: 'Step 1 — Enter the Denominator',
    body: 'The small circle asks for the denominator. Because both fractions share the same bottom number, just type that number in. For 2/5 + 1/5, enter 5.',
    computation: 'Denominator → 5',
    color: '#8b5cf6',
  },
  {
    step: 2,
    title: 'Step 2 — Enter the Expression',
    body: 'The big circle asks for the expression. Write the two numerators joined by the operator. For 2/5 + 1/5, type "2+1".',
    computation: 'Expression → 2+1',
    color: '#3b82f6',
  },
  {
    step: 3,
    title: 'Step 3 — Enter the Result',
    body: 'Now solve the expression you just wrote. 2 + 1 = 3, so type 3.',
    computation: '2 + 1 = 3',
    color: '#f59e0b',
  },
  {
    step: 4,
    title: 'Step 4 — Write the Final Fraction',
    body: 'Enter the numerator (3) and denominator (5) of your answer. If the fraction can be simplified, write the simplified form.',
    computation: '3 / 5',
    color: '#10b981',
  },
  {
    step: 5,
    title: 'Step 5 — Cast the Spell!',
    body: 'All fields are filled. Press Cast Spell to check your answer. If everything is correct, you deal damage to the enemy!',
    computation: null,
    color: null,
    isLast: true,
  },
];

const SimilarFractionTutorial = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const total = slides.length;

  const next = () => { if (index < total - 1) setIndex(i => i + 1); else onComplete(); };
  const prev = () => { if (index > 0) setIndex(i => i - 1); };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.80)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, width: 520, maxWidth: '95vw',
        boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* Top bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 20px', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb',
        }}>
          <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>SIMILAR ISLAND TUTORIAL</span>
          <button onClick={onComplete} style={{
            fontSize: 12, color: '#9ca3af', background: 'none',
            border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 12px', cursor: 'pointer',
          }}>Skip Tutorial</button>
        </div>

        {/* Diagram */}
        <div style={{
          background: '#f9fafb', minHeight: 180,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '16px 0', borderBottom: '1px solid #e5e7eb',
        }}>
          <StepDiagram step={slide.step} />
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: '#111827', fontWeight: 700 }}>{slide.title}</h2>
          <p style={{ margin: 0, fontSize: 15, color: '#374151', lineHeight: 1.6 }}>{slide.body}</p>
          {slide.computation && (
            <div style={{
              display: 'flex', justifyContent: 'center', padding: '12px 24px',
              background: `${slide.color}15`, border: `2px solid ${slide.color}`, borderRadius: 12,
            }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: slide.color, letterSpacing: 2 }}>
                {slide.computation}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px', borderTop: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#f9fafb',
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {slides.map((_, i) => (
              <div key={i} style={{
                width: i === index ? 18 : 8, height: 8, borderRadius: 4,
                background: i === index ? '#8b5cf6' : '#d1d5db', transition: 'all 0.2s',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={prev} disabled={index === 0} style={{
              padding: '8px 20px', fontSize: 14, fontWeight: 600,
              border: '2px solid #d1d5db', borderRadius: 8,
              cursor: index === 0 ? 'not-allowed' : 'pointer',
              background: '#fff', color: index === 0 ? '#9ca3af' : '#374151',
            }}>← Back</button>
            <button onClick={next} style={{
              padding: '8px 24px', fontSize: 14, fontWeight: 700,
              border: 'none', borderRadius: 8, cursor: 'pointer',
              background: slide.isLast ? '#10b981' : '#8b5cf6', color: '#fff',
            }}>
              {slide.isLast ? 'Start Playing!' : 'Next →'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SimilarFractionTutorial;