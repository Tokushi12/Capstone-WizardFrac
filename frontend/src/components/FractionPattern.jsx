import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import './components.css';

const FractionPattern = forwardRef(({ problem, onAnswerSubmit, onWrongAnswer, onStepCorrect, onRequestNewProblem }, ref) => {
  const [correctNum1, setCorrectNum1] = useState(0);
  const [correctNum2, setCorrectNum2] = useState(0);
  const [correctDen,  setCorrectDen]  = useState(0);
  const [operator,    setOperator]    = useState('+');

  const [denValue,     setDenValue]     = useState('');
  const [exprValue,    setExprValue]    = useState('');
  const [answerValue,  setAnswerValue]  = useState('');
  const [fracNumValue, setFracNumValue] = useState('');
  const [fracDenValue, setFracDenValue] = useState('');

  const [lockedDen,     setLockedDen]     = useState(null);
  const [lockedExpr,    setLockedExpr]    = useState(null);
  const [lockedAns,     setLockedAns]     = useState(null);
  const [lockedFracNum, setLockedFracNum] = useState(null);
  const [lockedFracDen, setLockedFracDen] = useState(null);

  const [resultNum, setResultNum] = useState(null);

  // phase: 'den' | 'expr' | 'answer' | 'fraction' | 'ready' | 'result' | 'done' | 'wrong'
  const [phase, setPhase] = useState('den');

  const [errors, setErrors] = useState([]);

  const denInputRef    = useRef();
  const exprInputRef   = useRef();
  const answerInputRef = useRef();
  const fracNumRef     = useRef();
  const fracDenRef     = useRef();

  useEffect(() => {
    const match = problem.match(/(\d+)\/(\d+)\s*([+-])\s*(\d+)\/(\d+)/);
    if (match) {
      setCorrectNum1(parseInt(match[1]));
      setCorrectDen(parseInt(match[2]));
      setOperator(match[3]);
      setCorrectNum2(parseInt(match[4]));
    }
  }, [problem]);

  useEffect(() => {
    if (phase === 'den')      setTimeout(() => denInputRef.current?.focus(),    50);
    if (phase === 'expr')     setTimeout(() => exprInputRef.current?.focus(),   50);
    if (phase === 'answer')   setTimeout(() => answerInputRef.current?.focus(), 50);
    if (phase === 'fraction') setTimeout(() => fracNumRef.current?.focus(),     50);
  }, [phase]);

  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

  // Derived correct answer values
  const correctResult = operator === '+' ? correctNum1 + correctNum2 : correctNum1 - correctNum2;
  const divisor       = correctDen > 0 ? gcd(Math.abs(correctResult), correctDen) : 1;
  const simplifiedNum = correctDen > 0 ? correctResult / divisor : correctResult;
  const simplifiedDen = correctDen > 0 ? correctDen / divisor : 1;
  const isWholeAnswer = simplifiedDen === 1;

  /* ── Lock each field in turn, no validation until Cast Spell ── */
  const handleDenSubmit = () => {
    const v = denValue.trim();
    if (!v) return;
    setLockedDen(v);
    setPhase('expr');
  };

  const handleExprSubmit = () => {
    const v = exprValue.trim();
    if (!v) return;
    setLockedExpr(v);
    setExprValue('');
    setPhase('answer');
  };

  const handleAnswerSubmit = () => {
    const v = answerValue.trim();
    if (!v) return;
    setLockedAns(v);
    setAnswerValue('');
    setPhase('fraction');
  };

  const handleFracNumSubmit = () => {
    const v = fracNumValue.trim();
    if (!v) return;
    setLockedFracNum(v);
    setFracNumValue('');
    if (isWholeAnswer) {
      setPhase('ready');
    } else {
      setTimeout(() => fracDenRef.current?.focus(), 50);
    }
  };

  const handleFracDenSubmit = () => {
    const v = fracDenValue.trim();
    if (!v) return;
    setLockedFracDen(v);
    setFracDenValue('');
    setPhase('ready');
  };

  /* ── Cast Spell: validate everything at once ── */
  const handleCastSpell = () => {
    if (phase !== 'ready') return;

    const errs = [];

    // Check denominator (small circle)
    const denOk = parseInt(lockedDen) === correctDen;
    if (!denOk) errs.push(`Denominator: should be ${correctDen}, you entered ${lockedDen}.`);

    // Check expression (big circle)
    const exprMatch = (lockedExpr || '').trim().match(/^(-?\d+)\s*([+-])\s*(\d+)$/);
    if (!exprMatch) {
      errs.push(`Expression: format should be like ${correctNum1}${operator}${correctNum2}, got "${lockedExpr}".`);
    } else {
      const tA = parseInt(exprMatch[1]), tOp = exprMatch[2], tB = parseInt(exprMatch[3]);
      if (tA !== correctNum1 || tB !== correctNum2 || tOp !== operator) {
        errs.push(`Expression: should be ${correctNum1} ${operator} ${correctNum2}, got "${lockedExpr}".`);
      }
    }

    // Check expression answer (big circle)
    if (parseInt(lockedAns) !== correctResult) {
      errs.push(`Answer: ${correctNum1} ${operator} ${correctNum2} = ${correctResult}, not ${lockedAns}.`);
    }

    // Check final fraction (bottom)
    const userFracNum = parseInt(lockedFracNum);
    if (isWholeAnswer) {
      if (userFracNum !== simplifiedNum) {
        errs.push(`Result: should be ${simplifiedNum}, you entered ${lockedFracNum}.`);
      }
    } else {
      const userFracDen = parseInt(lockedFracDen);
      const okSimplified   = userFracNum === simplifiedNum  && userFracDen === simplifiedDen;
      const okUnsimplified = userFracNum === correctResult   && userFracDen === correctDen;
      if (!okSimplified && !okUnsimplified) {
        errs.push(`Result: should be ${simplifiedNum}/${simplifiedDen}, you entered ${lockedFracNum}/${lockedFracDen}.`);
      }
    }

    if (errs.length > 0) {
      setErrors(errs);
      setPhase('wrong');
      onWrongAnswer?.(errs.join(' | '), `${lockedExpr}=${lockedAns}`);
      setTimeout(() => onRequestNewProblem?.(), 3000);
      return;
    }

    // All correct — animate then submit
    setErrors([]);
    setPhase('result');
    onStepCorrect?.();

    setTimeout(() => {
      setResultNum(correctResult);
      setTimeout(() => {
        if (correctResult === 0)      onAnswerSubmit('0');
        else if (simplifiedDen === 1) onAnswerSubmit(`${simplifiedNum}`);
        else                          onAnswerSubmit(`${simplifiedNum}/${simplifiedDen}`);
        setPhase('done');
      }, 1200);
    }, 1800);
  };

  useImperativeHandle(ref, () => ({
    submitCurrentStep: () => {
      if      (phase === 'den')                                handleDenSubmit();
      else if (phase === 'expr')                               handleExprSubmit();
      else if (phase === 'answer')                             handleAnswerSubmit();
      else if (phase === 'fraction' && lockedFracNum === null) handleFracNumSubmit();
      else if (phase === 'fraction' && lockedFracNum !== null) handleFracDenSubmit();
      else if (phase === 'ready')                              handleCastSpell();
    }
  }));

  const handleKeyDown = (e, fn) => {
    if (e.key === 'Enter') { e.preventDefault(); fn(); }
  };

  /* ── Styles ── */
  const circleBase = {
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2.5px solid #888',
    background: '#fff',
    position: 'absolute',
  };
  const inputBase = {
    border: 'none', background: 'transparent',
    textAlign: 'center', outline: 'none', color: '#111',
  };
  const fracInputStyle = {
    fontSize: 18, fontWeight: 700,
    width: 60, textAlign: 'center',
    border: '2px solid #8b5cf6',
    borderRadius: 6,
    padding: '4px 0',
    outline: 'none',
    color: '#111',
    background: '#fff',
  };

  const isWrong       = phase === 'wrong';
  const isSmallActive = phase === 'den';
  const isBigActive   = phase === 'expr' || phase === 'answer';
  const isReady       = phase === 'ready';
  const isFraction    = phase === 'fraction';
  const glowStyle     = { borderColor: '#8b5cf6', boxShadow: '0 0 10px rgba(139,92,246,0.4)' };
  const wrongStyle    = { borderColor: '#dc2626', boxShadow: '0 0 10px rgba(220,38,38,0.35)' };

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      gap: '12px', padding: '16px', userSelect: 'none',
    }}>

      {/* Hint */}
      <div style={{ fontSize: '13px', color: '#555', minHeight: 18, textAlign: 'center' }}>
        {phase === 'den'    && 'Enter the denominator of the problem.'}
        {phase === 'expr'   && 'Enter the expression of the problem.'}
        {phase === 'answer' && 'Enter the answer of your expression.'}
        {isFraction && !isWholeAnswer && lockedFracNum === null && 'Enter the numerator of the result.'}
        {isFraction && !isWholeAnswer && lockedFracNum !== null && 'Enter the denominator of the result.'}
        {isFraction && isWholeAnswer  && 'Enter the whole number result.'}
        {phase === 'ready'  && 'All set! Press Cast Spell to fire!'}
        {phase === 'result' && 'Checking..'}
        {phase === 'done'   && 'Hit!'}
        {phase === 'wrong'  && 'Check what went wrong — next problem coming up…'}
      </div>

      {/* Pattern */}
      <div style={{ position: 'relative', width: 200, height: 200 }}>

        {/* Connector */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
             viewBox="0 0 200 200">
          <line x1="86" y1="86" x2="168" y2="168"
                stroke="#bbb" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />
        </svg>

        {/* Big circle */}
        <div
          onClick={() => {
            if (phase === 'expr')   exprInputRef.current?.focus();
            if (phase === 'answer') answerInputRef.current?.focus();
          }}
          style={{
            ...circleBase,
            top: 8, left: 8, width: 148, height: 148,
            flexDirection: 'column', gap: 4,
            opacity: lockedDen === null ? 0.45 : 1,
            cursor: isBigActive ? 'text' : 'default',
            ...(isBigActive               ? { borderColor: '#8b5cf6', borderWidth: 3 } : {}),
            ...(isReady                   ? glowStyle : {}),
            ...(isWrong                   ? wrongStyle : {}),
            zIndex: 2,
          }}
        >
          {phase === 'den' && (
            <span style={{ fontSize: 13, color: '#aaa' }}>numerator</span>
          )}

          {phase === 'expr' && (
            <input
              ref={exprInputRef}
              type="text"
              value={exprValue}
              onChange={e => setExprValue(e.target.value)}
              onKeyDown={e => handleKeyDown(e, handleExprSubmit)}
              placeholder={`? ${operator} ?`}
              style={{ ...inputBase, fontSize: 20, fontWeight: 600, width: '80%' }}
            />
          )}

          {phase === 'answer' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#444' }}>{lockedExpr} =</span>
              <input
                ref={answerInputRef}
                type="number"
                value={answerValue}
                onChange={e => setAnswerValue(e.target.value)}
                onKeyDown={e => handleKeyDown(e, handleAnswerSubmit)}
                placeholder="?"
                style={{ ...inputBase, fontSize: 22, fontWeight: 700, width: '50%' }}
              />
            </div>
          )}

          {(isFraction || isReady) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#555' }}>{lockedExpr} = {lockedAns}</span>
            </div>
          )}

          {phase === 'wrong' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#dc2626' }}>{lockedExpr} = {lockedAns}</span>
            </div>
          )}

          {(phase === 'result' || phase === 'done') && (
            resultNum !== null ? (
              <span style={{ fontSize: 30, fontWeight: 700, color: '#8b5cf6', animation: 'pop .4s ease' }}>
                {resultNum}
              </span>
            ) : (
              <span style={{ fontSize: 16, color: '#888' }}>{lockedExpr} = {correctResult}</span>
            )
          )}
        </div>

        {/* Small circle */}
        <div
          onClick={() => { if (phase === 'den') denInputRef.current?.focus(); }}
          style={{
            ...circleBase,
            bottom: 4, right: 4, width: 64, height: 64,
            cursor: phase === 'den' ? 'text' : 'default',
            ...(isSmallActive ? { borderColor: '#8b5cf6', borderWidth: 2.5 } : {}),
            ...(isReady       ? glowStyle : {}),
            ...(isWrong       ? wrongStyle : {}),
            zIndex: 2,
          }}
        >
          {lockedDen === null ? (
            <input
              ref={denInputRef}
              type="number"
              value={denValue}
              onChange={e => setDenValue(e.target.value)}
              onKeyDown={e => handleKeyDown(e, handleDenSubmit)}
              placeholder="?"
              style={{ ...inputBase, fontSize: 16, fontWeight: 600, width: '90%' }}
            />
          ) : (
            <span style={{
              fontSize: 18, fontWeight: 700,
              color: isWrong ? '#dc2626' : '#111',
            }}>{lockedDen}</span>
          )}
        </div>
      </div>

      {/* Final answer — fraction or whole number */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minHeight: 64 }}>
        {isWholeAnswer ? (
          isFraction ? (
            <input
              ref={fracNumRef}
              type="number"
              value={fracNumValue}
              onChange={e => setFracNumValue(e.target.value)}
              onKeyDown={e => handleKeyDown(e, handleFracNumSubmit)}
              placeholder="?"
              style={{ ...fracInputStyle, fontSize: 22 }}
            />
          ) : (
            <span style={{ fontSize: 22, fontWeight: 700, color: isWrong ? '#dc2626' : '#333' }}>
              {lockedFracNum ?? '?'}
            </span>
          )
        ) : (
          <>
            {/* Numerator */}
            {isFraction && lockedFracNum === null ? (
              <input
                ref={fracNumRef}
                type="number"
                value={fracNumValue}
                onChange={e => setFracNumValue(e.target.value)}
                onKeyDown={e => handleKeyDown(e, handleFracNumSubmit)}
                placeholder="?"
                style={fracInputStyle}
              />
            ) : (
              <span style={{ fontSize: 18, fontWeight: 700, color: isWrong ? '#dc2626' : '#333' }}>
                {lockedFracNum ?? '?'}
              </span>
            )}

            {/* Fraction bar */}
            <div style={{ width: 100, height: 2, background: '#888' }} />

            {/* Denominator */}
            {isFraction && lockedFracNum !== null ? (
              <input
                ref={fracDenRef}
                type="number"
                value={fracDenValue}
                onChange={e => setFracDenValue(e.target.value)}
                onKeyDown={e => handleKeyDown(e, handleFracDenSubmit)}
                placeholder="?"
                style={fracInputStyle}
              />
            ) : (
              <span style={{ fontSize: 18, fontWeight: 600, color: isWrong ? '#dc2626' : '#333' }}>
                {lockedFracDen ?? '?'}
              </span>
            )}
          </>
        )}
      </div>

      {/* Error list */}
      {errors.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 280, width: '100%' }}>
          {errors.map((err, i) => (
            <div key={i} style={{
              fontSize: 12,
              color: '#991b1b',
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: 8,
              padding: '6px 10px',
            }}>
              {err}
            </div>
          ))}
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
