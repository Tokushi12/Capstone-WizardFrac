import React from 'react';

const MisconceptionPanel = ({ misconceptions }) => {
  if (!misconceptions || misconceptions.length === 0) return null;

  const maxCount = Math.max(...misconceptions.map(m => m.count));

  return (
    <div className="misconceptions-section">
      <h3 className="section-title">Dissimilar Fraction Misconceptions</h3>
      <p className="misconceptions-subtitle">
        Recurring mistakes detected in your Butterfly Method spell casts.
      </p>
      <div className="misconceptions-list">
        {misconceptions.map(m => (
          <div key={m.errorType} className={`misconception-row${m.recurring ? ' is-recurring' : ''}`}>
            <div className="misconception-row-top">
              <span className="misconception-label">{m.label}</span>
              <span className="misconception-count">
                {m.count}x{m.recurring ? ' ⚠ recurring' : ''}
              </span>
            </div>
            <div className="misconception-bar-track">
              <div
                className="misconception-bar-fill"
                style={{ width: `${Math.max(8, (m.count / maxCount) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MisconceptionPanel;
