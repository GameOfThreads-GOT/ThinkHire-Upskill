const SessionAnalysis = ({ sessionScores, onReset }) => {
  const getSessionAverage = () => {
    if (sessionScores.length === 0) return 0;
    const total = sessionScores.reduce((sum, item) => sum + item.score, 0);
    const average = total / sessionScores.length;
    return Math.round(average * 10) / 10;
  };

  return (
    <div className="bg-[var(--xai-bg-secondary)]/60 backdrop-blur-sm p-4 rounded-2xl border border-[var(--xai-border)] transition-all duration-200 hover:border-[var(--xai-border-light)]">
      <h3 className="text-xl mb-2 text-[var(--xai-text-primary)] font-bold">Session Analysis</h3>
      <div className="flex flex-col items-center gap-3">
        <div className="text-center">
          <div className="text-4xl font-bold text-[var(--xai-text-primary)]">
            {getSessionAverage()}%
          </div>
          <div className="text-xs text-[var(--xai-text-secondary)] mt-1">
            Avg Score
          </div>
        </div>
        <div className="text-center w-full">
          <p className="text-xs text-[var(--xai-text-secondary)] mb-2">
            Videos: {sessionScores.length}
          </p>
          <button 
            className="px-4 py-1.5 text-sm bg-[var(--xai-bg-tertiary)] border border-[var(--xai-border)] rounded-lg hover:bg-[var(--xai-bg-secondary)] transition-all cursor-pointer font-medium"
            onClick={onReset}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
    
  );
};

export default SessionAnalysis;