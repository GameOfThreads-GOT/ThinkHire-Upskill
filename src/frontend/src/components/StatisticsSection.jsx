const StatisticsSection = ({ sessionScores }) => {
  const getStats = () => [
    { 
      label: 'Interviews Taken', 
      value: sessionScores.length.toString(), 
      change: `+${sessionScores.length > 0 ? '1' : '0'} today` 
    },
    { 
      label: 'Questions Practiced', 
      value: sessionScores.length.toString(), 
      change: sessionScores.length > 0 ? 'Based on recent attempts' : 'No data yet' 
    },
    { 
      label: 'Current Streak', 
      value: sessionScores.length > 0 ? `${sessionScores.length} days` : '0 days', 
      change: sessionScores.length > 0 ? 'Keep it up!' : 'Start practicing today' 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {getStats().map((stat, index) => (
        <div 
          key={index} 
          className="bg-[var(--xai-bg-secondary)]/60 backdrop-blur-sm p-6 rounded-2xl border border-[var(--xai-border)] transition-all duration-200 hover:border-[var(--xai-border-light)]"
        >
          <div className="text-4xl font-bold text-[var(--xai-text-primary)] mb-2">
            {stat.value}
          </div>
          <div className="text-lg text-[var(--xai-text-primary)] font-medium mb-1">
            {stat.label}
          </div>
          <div className="text-sm text-[var(--xai-text-secondary)]">
            {stat.change}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsSection;