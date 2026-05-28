import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import './components.css';

const FractionPattern = forwardRef(({ problem, onAnswerSubmit, onWrongAnswer, onStepCorrect }, ref) => {
  const [correctNum1, setCorrectNum1]   = useState(0);
  const [correctNum2, setCorrectNum2]   = useState(0);
  const [correctDen,  setCorrectDen]    = useState(0);
  const [operator,    setOperator]      = useState('+');

  // Input values
  const [denValue,  setDenValue]  = useState('');
  const [num1Value, setNum1Value] = useState('');
  const [num2Value, setNum2Value] = useState('');

  // What's locked/confirmed inside each circle
  const [lockedDen,  setLockedDen]  = useState(null);   // number, shown inside small circle
  const [lockedNum1, setLockedNum1] = useState(null);   // number, shown inside big circle
  const [lockedNum2, setLockedNum2] = useState(null);   // number, shown inside big circle
  const [resultNum,  setResultNum]  = useState(null);   // final animated result
  const [pendingAnswer, setPendingAnswer] = useState(null); // holds answer until Cast Spell

  // phase: 'den' | 'num1' | 'num2' | 'result' | 'done'
  const [phase, setPhase] = useState('den');

  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState(''); // 'error' | 'hint'

  const denInputRef  = useRef();
  const numInputRef  = useRef();

  useEffect(() => {
    const match = problem.match(/(\d+)\/(\d+)\s*([+-])\s*(\d+)\/(\d+)/);
    if (match) {
      setCorrectNum1(parseInt(match[1]));
      setCorrectDen(parseInt(match[2]));
      setOperator(match[3]);
      setCorrectNum2(parseInt(match[4]));
    }
  }, [problem]);

  // Auto-focus the right input when phase changes
  useEffect(() => {
    if (phase === 'den')  setTimeout(() => denInputRef.current?.focus(), 50);
    if (phase === 'num1') setTimeout(() => numInputRef.current?.focus(), 50);
    if (phase === 'num2') setTimeout(() => numInputRef.current?.focus(), 50);
  }, [phase]);

  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

  // Expose submitCurrentStep so the Cast Spell button still works
  useImperativeHandle(ref, () => ({
    submitCurrentStep: () => {
      if (phase === 'den')    handleDenSubmit();
      if (phase === 'num1')   handleNum1Submit();
      if (phase === 'num2')   handleNum2Submit();
      if (phase === 'result') handleCastSpell();
    }
  }));

  const showError = (msg) => {
    setStatusMsg(msg);
    setStatusType('error');
  };

  const clearStatus = () => {
    setStatusMsg('');
    setStatusType('');
  };

  /* ── Step 1: denominator ── */
  const handleDenSubmit = () => {
    const v = parseInt(denValue);
    if (!v || v <= 0) { showError('Enter a valid denominator.'); return; }
    if (v !== correctDen) {
      onWrongAnswer?.(
        'For similar fractions, the denominator stays the same. Look at the denominators in the problem!',
        String(v)
      );
      setDenValue('');
      showError(`Incorrect — the denominator should be ${correctDen}.`);
      return;
    }
    setLockedDen(v);
    clearStatus();
    onStepCorrect?.();
    setPhase('num1');
  };

  /* ── Step 2: first numerator ── */
  const handleNum1Submit = () => {
    const v = parseInt(num1Value);
    if (isNaN(v)) { showError('Enter a valid number.'); return; }
    if (v !== correctNum1) {
      onWrongAnswer?.(
        `Enter the first numerator from the problem (${correctNum1}).`,
        String(v)
      );
      setNum1Value('');
      showError(`That's not right — enter ${correctNum1}, the first numerator.`);
      return;
    }
    setLockedNum1(v);
    setNum1Value('');
    clearStatus();
    setPhase('num2');
  };

  /* ── Step 3: second numerator → compute result, wait for Cast Spell ── */
  const handleNum2Submit = () => {
    const v = parseInt(num2Value);
    if (isNaN(v)) { showError('Enter a valid number.'); return; }
    if (v !== correctNum2) {
      onWrongAnswer?.(
        `Enter the second numerator from the problem (${correctNum2}).`,
        String(v)
      );
      setNum2Value('');
      showError(`That's not right — enter ${correctNum2}, the second numerator.`);
      return;
    }
    setLockedNum2(v);
    setNum2Value('');
    clearStatus();
    setPhase('result');

    // Compute the result and store it as pending — do NOT call onAnswerSubmit yet
    setTimeout(() => {
      const sumDiff = operator === '+' ? correctNum1 + correctNum2 : correctNum1 - correctNum2;
      setResultNum(sumDiff);
      onStepCorrect?.();

      const divisor = gcd(Math.abs(sumDiff), correctDen);
      const simplifiedNum = sumDiff / divisor;
      const simplifiedDen = correctDen / divisor;

      let answer;
      if (sumDiff === 0) {
        answer = '0';
      } else if (simplifiedDen === 1) {
        answer = `${simplifiedNum}`;
      } else {
        answer = `${simplifiedNum}/${simplifiedDen}`;
      }

      // Store answer but wait for Cast Spell
      setPendingAnswer(answer);
    }, 1800);
  };

  /* ── Cast Spell: fires the stored answer ── */
  const handleCastSpell = () => {
    if (pendingAnswer === null) return;
    onAnswerSubmit(pendingAnswer);
    setPhase('done');
  };

  /* ── Key handler — Enter submits the active step ── */
  const handleKeyDown = (e, submitFn) => {
    if (e.key === 'Enter') { e.preventDefault(); submitFn(); }
  };

  /* ────────────────────────────────────────────────
     Shared styles
  ──────────────────────────────────────────────── */
  const circleBase = {
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2.5px solid #888',
    background: '#fff',
    position: 'absolute',
  };

  const bigActive   = { borderColor: '#8b5cf6', borderWidth: 3 };
  const smallActive = { borderColor: '#8b5cf6', borderWidth: 2.5 };

  const inputBase = {
    border: 'none',
    background: 'transparent',
    textAlign: 'center',
    outline: 'none',
    color: '#111',
    width: '80%',
  };

  const opSymStyle = {
    fontSize: '1rem',
    color: '#666',
    margin: '0 2px',
  };

  /* ────────────────────────────────────────────────
     Render
  ──────────────────────────────────────────────── */
  const isBigActive   = phase === 'num1' || phase === 'num2';
  const isSmallActive = phase === 'den';
  const isDone        = phase === 'done' || phase === 'result';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      userSelect: 'none',
    }}>

      {/* Hint label */}
      <div style={{ fontSize: '13px', color: '#555', minHeight: 18, textAlign: 'center' }}>
        {phase === 'den'    && `Enter the denominator (${correctDen}) into the small circle`}
        {phase === 'num1'   && `Enter the first numerator (${correctNum1}) in the big circle`}
        {phase === 'num2'   && `Enter the second numerator (${correctNum2}) in the big circle`}
        {phase === 'result' && (pendingAnswer !== null ? '✨ Ready — cast your spell!' : 'Calculating…')}
        {phase === 'done'   && '✓ Correct!'}
      </div>

      {/* Fraction pattern — big circle + connector + small circle */}
      <div style={{ position: 'relative', width: 200, height: 200 }}>

        {/* SVG connector line */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
             viewBox="0 0 200 200">
          <line x1="86" y1="86" x2="168" y2="168"
                stroke="#bbb" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />
        </svg>

        {/* Big circle — numerator */}
        <div style={{
          ...circleBase,
          top: 8, left: 8,
          width: 148, height: 148,
          cursor: isBigActive ? 'text' : 'default',
          opacity: lockedDen === null ? 0.5 : 1,
          ...(isBigActive ? bigActive : {}),
          zIndex: 2,
          flexDirection: 'column',
          gap: 2,
        }}
          onClick={() => { if (isBigActive) numInputRef.current?.focus(); }}
        >
          {/* Content inside big circle */}
          {phase === 'den' && (
            <span style={{ fontSize: 13, color: '#aaa' }}>numerator</span>
          )}

          {(phase === 'num1' || phase === 'num2') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
              {lockedNum1 !== null && (
                <span style={{ fontSize: 22, fontWeight: 600, animation: 'pop .3s ease' }}>{lockedNum1}</span>
              )}
              {lockedNum1 !== null && phase === 'num2' && (
                <span style={opSymStyle}>{operator === '+' ? '+' : '−'}</span>
              )}
              <input
                ref={numInputRef}
                type="number"
                value={phase === 'num1' ? num1Value : num2Value}
                onChange={e => phase === 'num1' ? setNum1Value(e.target.value) : setNum2Value(e.target.value)}
                onKeyDown={e => handleKeyDown(e, phase === 'num1' ? handleNum1Submit : handleNum2Submit)}
                placeholder={phase === 'num1' ? correctNum1 : correctNum2}
                style={{ ...inputBase, fontSize: 22, fontWeight: 600, width: lockedNum1 !== null ? 50 : '70%' }}
              />
            </div>
          )}

          {(phase === 'result' || phase === 'done') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
              {resultNum !== null ? (
                <span style={{ fontSize: 28, fontWeight: 700, color: '#8b5cf6', animation: 'pop .4s ease' }}>
                  {resultNum}
                </span>
              ) : (
                <>
                  <span style={{ fontSize: 20, fontWeight: 600 }}>{lockedNum1}</span>
                  <span style={opSymStyle}>{operator === '+' ? '+' : '−'}</span>
                  <span style={{ fontSize: 20, fontWeight: 600 }}>{lockedNum2}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Small circle — denominator */}
        <div style={{
          ...circleBase,
          bottom: 4, right: 4,
          width: 64, height: 64,
          cursor: phase === 'den' ? 'text' : 'default',
          ...(isSmallActive ? smallActive : {}),
          zIndex: 2,
        }}
          onClick={() => { if (phase === 'den') denInputRef.current?.focus(); }}
        >
          {lockedDen === null ? (
            <input
              ref={denInputRef}
              type="number"
              value={denValue}
              onChange={e => setDenValue(e.target.value)}
              onKeyDown={e => handleKeyDown(e, handleDenSubmit)}
              placeholder={correctDen}
              style={{ ...inputBase, fontSize: 16, fontWeight: 600, width: '90%' }}
            />
          ) : (
            <span style={{ fontSize: 18, fontWeight: 700, animation: 'pop .3s ease' }}>{lockedDen}</span>
          )}
        </div>
      </div>

      {/* Fraction bar + denominator label below */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <div style={{ width: 100, height: 2, background: '#888' }} />
        <span style={{ fontSize: 18, fontWeight: 600, color: '#333' }}>
          {lockedDen !== null ? lockedDen : '?'}
        </span>
      </div>

      {/* Error / status message */}
      {statusMsg && (
        <div style={{
          fontSize: 13,
          color: statusType === 'error' ? '#dc2626' : '#555',
          textAlign: 'center',
          maxWidth: 260,
        }}>
          {statusMsg}
        </div>
      )}

      <style>{`
        @keyframes pop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
});

FractionPattern.displayName = 'FractionPattern';
export default FractionPattern;