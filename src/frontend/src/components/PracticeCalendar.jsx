const PracticeCalendar = ({ sessionScores }) => {
  // Get score intensity (1-4) based on value
  const getIntensity = (score) => {
    if (!score) return 0;
    if (score <= 25) return 1;
    if (score <= 50) return 2;
    if (score <= 75) return 3;
    return 4;
  };

  // Get heatmap color based on intensity
  const getHeatmapColor = (intensity) => {
    const colors = {
      0: 'bg-[var(--xai-bg-tertiary)]',
      1: 'bg-[#1a1a1a]',
      2: 'bg-[#333333]',
      3: 'bg-[#4d4d4d]',
      4: 'bg-[#666666]'
    };
    return colors[intensity] || colors[0];
  };

  // Generate last 30 days
  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const days = getLast30Days();

  // Get score for a specific date
  const getScoreForDate = (dateStr) => {
    const scoreObj = sessionScores.find(score => 
      score.timestamp.split('T')[0] === dateStr
    );
    return scoreObj ? scoreObj.score : null;
  };

  return (
    <div className="bg-[var(--xai-bg-secondary)] p-6 rounded-xl border border-[var(--xai-border)] transition-all duration-200 hover:border-[var(--xai-border-light)]">
      <h3 className="text-xl font-bold text-[var(--xai-text-primary)] mb-4">Practice Calendar</h3>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const score = getScoreForDate(day);
          const intensity = getIntensity(score);
          const dayOfMonth = new Date(day).getDate();
          
          return (
            <div
              key={index}
              className={`aspect-square flex items-center justify-center text-xs rounded ${getHeatmapColor(intensity)} ${score ? 'border border-[var(--xai-border)]' : ''}`}
              title={score ? `${day}: ${score}%` : day}
            >
              {dayOfMonth}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-[var(--xai-text-secondary)] mt-2">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-[var(--xai-bg-tertiary)] border border-[var(--xai-border)] rounded"></div>
          <div className="w-3 h-3 bg-[#1a1a1a] rounded"></div>
          <div className="w-3 h-3 bg-[#333333] rounded"></div>
          <div className="w-3 h-3 bg-[#4d4d4d] rounded"></div>
          <div className="w-3 h-3 bg-[#666666] rounded"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default PracticeCalendar;