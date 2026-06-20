import React, { useState, useEffect } from 'react';
import CompetencyMasteryCard from '../components/CompetencyMasteryCard';
import WizardRankBadge from '../components/WizardRankBadge';
import MisconceptionPanel from '../components/MisconceptionPanel';
import './StudentDashboard.css';
import LoadingScreen from '../components/LoadingScreen';

const RANK_TIERS = [
  { rank: 'Apprentice', icon: '🪄' },
  { rank: 'Mage', icon: '🔮' },
  { rank: 'Archmage', icon: '⚡' },
  { rank: 'Grand Wizard', icon: '👑' },
];

const StudentDashboard = ({ studentId, studentNickname, selectedCharacter, onBack }) => {
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/game-progress/diagnostics/${studentId}`);
        if (!response.ok) throw new Error('Failed to fetch diagnostics');
        const data = await response.json();
        setDiagnostics(data);
      } catch (err) {
        const message = err.message === 'Failed to fetch'
          ? 'Cannot reach the server. Make sure the backend is running on http://localhost:8080.'
          : err.message;
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    if (studentId) fetchDiagnostics();
  }, [studentId]);

  if (loading) {
    return <LoadingScreen message="LOADING PROGRESS..." />;
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
        <button className="back-btn" onClick={onBack}>← Back to Lobby</button>
      </div>
    );
  }

  const { summary, competencies, gameHistory, dissimilarMisconceptions } = diagnostics;
  const hasData = summary.totalSessions > 0;
  const accuracy = summary.totalCorrect + summary.totalIncorrect > 0
    ? Math.round((summary.totalCorrect / (summary.totalCorrect + summary.totalIncorrect)) * 100)
    : 0;

  const currentRankIndex = Math.max(0, RANK_TIERS.findIndex(t => t.rank === summary?.wizardRank));

  const TOTAL_ISLAND_STAGES = 18; // 3 islands x 6 stages
  const completedStages = new Set(
    (gameHistory || [])
      .filter(entry => entry.status === 'COMPLETED')
      .map(entry => `${entry.island}-${entry.level}`)
  ).size;
  const proficientCount = (competencies || []).filter(c => c.masteryLevel === 'Proficient').length;

  const achievements = [
    {
      id: 'quest-champion',
      icon: '🗺️',
      title: 'Quest Champion',
      description: 'Complete all the quests',
      progress: Math.min(completedStages, TOTAL_ISLAND_STAGES),
      goal: TOTAL_ISLAND_STAGES,
    },
    {
      id: 'spell-master',
      icon: '✨',
      title: 'Spell Master',
      description: 'Cast 100 correct spells',
      progress: Math.min(summary.totalCorrect, 100),
      goal: 100,
    },
    {
      id: 'mastery-mage',
      icon: '🎓',
      title: 'Mastery Mage',
      description: 'Reach Proficient in every skill',
      progress: proficientCount,
      goal: competencies?.length || 3,
    },
  ];

  return (
    <div className="dashboard-container">

      {/* Back */}
      <div className="dashboard-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
      </div>

      {/* Profile */}
      <div className="profile-bar">
        <img
          className="profile-avatar"
          src={selectedCharacter?.name?.toLowerCase().includes('girl') ? '/Female.png' : '/Male.png'}
          alt="Player avatar"
        />
        <div className="profile-info">
          <p className="profile-name">{studentNickname || 'Wizard'}</p>
          <WizardRankBadge rank={summary?.wizardRank} />
        </div>
      </div>

      {/* Badges */}
      <div className="badges-section">
        <div className="badges-header">
          <h3 className="section-title">Badges</h3>
        </div>
        <div className="badges-row">
          {RANK_TIERS.map((tier, index) => (
            <div
              key={tier.rank}
              className={`badge-circle ${index <= currentRankIndex ? 'badge-unlocked' : 'badge-locked'}`}
              title={tier.rank}
            >
              <span className="badge-icon">{tier.icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="achievements-section">
        <h3 className="section-title">Achievements</h3>
        <div className="achievements-list">
          {achievements.map(a => (
            <div key={a.id} className="achievement-row">
              <span className="achievement-icon">{a.icon}</span>
              <div className="achievement-body">
                <p className="achievement-title">{a.title}</p>
                <p className="achievement-desc">{a.description}</p>
                <div className="achievement-bar-track">
                  <div
                    className="achievement-bar-fill"
                    style={{ width: `${Math.min(100, (a.progress / a.goal) * 100)}%` }}
                  />
                </div>
              </div>
              <span className="achievement-count">{a.progress}/{a.goal}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="dashboard-title-row">
        <div className="dashboard-title-box">
          <h1 className="dashboard-title">Progress Dashboard</h1>
          <p className="dashboard-subtitle">Your wizard training journey</p>
        </div>
      </div>

      <div className="dashboard-divider dashboard-divider-stats">
        <span>Stats</span>
      </div>

      {!hasData ? (
        <div className="empty-state">
          <span className="empty-state-icon">🧙‍♂️</span>
          <h2>Your Adventure Awaits</h2>
          <p>Start playing to see your progress and mastery stats here.</p>
        </div>
      ) : (
        <div className="dashboard-content">

          {/* Stat cards */}
          <div className="stats-row">
            <div className="stat-card stat-correct">
              <span className="stat-card-icon">✅</span>
              <div className="stat-card-value">{summary.totalCorrect}</div>
              <div className="stat-card-label">Correct Answers</div>
            </div>
            <div className="stat-card stat-incorrect">
              <span className="stat-card-icon">❌</span>
              <div className="stat-card-value">{summary.totalIncorrect}</div>
              <div className="stat-card-label">Wrong Answers</div>
            </div>
            <div className="stat-card stat-sessions">
              <span className="stat-card-icon">🎮</span>
              <div className="stat-card-value">{summary.totalSessions}</div>
              <div className="stat-card-label">Sessions Played</div>
            </div>
            <div className="stat-card stat-multiplier">
              <span className="stat-card-icon">⚡</span>
              <div className="stat-card-value">{accuracy}%</div>
              <div className="stat-card-label">Overall Accuracy</div>
            </div>
          </div>

          {/* Competencies */}
          {competencies?.length > 0 && (
            <div className="competencies-section">
              <h3 className="section-title">Competency Mastery</h3>
              <div className="competencies-grid">
                {competencies.map(comp => (
                  <CompetencyMasteryCard key={comp.competencyId} competency={comp} />
                ))}
              </div>
            </div>
          )}

          {/* Misconceptions */}
          <MisconceptionPanel misconceptions={dissimilarMisconceptions} />

          {/* Gameplay history */}
          <div className="history-section">
            <h3 className="section-title">History Game</h3>            {gameHistory?.length > 0 ? (
              <div className="history-table-wrap">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Nickname</th>
                      <th>Island</th>
                      <th>Lvl</th>
                      <th>Hint</th>
                      <th>Points</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameHistory.map((entry, index) => (
                      <tr key={`${entry.island}-${entry.level}-${index}`}>
                        <td>{entry.nickname || '—'}</td>
                        <td>{entry.island}</td>
                        <td>{entry.level}</td>
                        <td className={entry.hintsUsed > 0 ? 'hint-used' : 'hint-none'}>
                          {entry.hintLabel}
                        </td>
                        <td>{entry.points}</td>
                        <td className={entry.status === 'COMPLETED' ? 'status-completed' : 'status-not-completed'}>
                          {entry.status === 'COMPLETED' ? 'Completed' : 'Not Completed'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="history-empty">No completed games yet. Finish a level to see your history here.</p>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
