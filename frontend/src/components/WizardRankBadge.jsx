import React from 'react';
import './components.css';

const RANK_STYLES = {
  Apprentice: { icon: '🪄', background: '#8a5a36', glow: 'rgba(138,90,54,0.5)' },
  Mage: { icon: '🔮', background: '#5b6b8c', glow: 'rgba(91,107,140,0.5)' },
  Archmage: { icon: '⚡', background: '#7b3fa0', glow: 'rgba(123,63,160,0.6)' },
  'Grand Wizard': { icon: '👑', background: '#f6b825', glow: 'rgba(246,184,37,0.7)' },
};

const WizardRankBadge = ({ rank, className = '' }) => {
  if (!rank) return null;
  const style = RANK_STYLES[rank] || RANK_STYLES.Apprentice;

  return (
    <span
      className={`wizard-rank-badge ${className}`}
      style={{
        backgroundColor: style.background,
        boxShadow: `0 0 12px ${style.glow}`,
      }}
    >
      <span className="wizard-rank-icon">{style.icon}</span>
      {rank}
    </span>
  );
};

export default WizardRankBadge;
