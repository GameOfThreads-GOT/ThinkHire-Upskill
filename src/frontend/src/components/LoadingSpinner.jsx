const LoadingSpinner = ({ size = 'md', message = 'Analyzing your response...' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12">
      <div className="relative">
        {/* Outer rotating circle */}
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-[var(--xai-border)] border-t-[var(--xai-text-primary)] animate-spin`}
        />
        {/* Inner pulsing circle */}
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
            size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'
          } rounded-full animate-pulse`}
          style={{ backgroundColor: 'var(--xai-text-primary)', opacity: 0.3 }}
        />
      </div>

      {message && (
        <div className="flex flex-col items-center space-y-2">
          <p
            className="text-lg font-medium animate-pulse"
            style={{ color: 'var(--xai-text-primary)' }}
          >
            {message}
          </p>
          <div className="flex space-x-1">
            <div
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: 'var(--xai-text-primary)',
                animationDelay: '0ms'
              }}
            />
            <div
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: 'var(--xai-text-secondary)',
                animationDelay: '150ms'
              }}
            />
            <div
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: 'var(--xai-highlight)',
                animationDelay: '300ms'
              }}
            />
          </div>
        </div>
      )}

      <div className="text-sm text-center max-w-md" style={{ color: 'var(--xai-text-secondary)' }}>
        <p>Our AI is evaluating your answer</p>
        <p className="mt-2">This may take a few moments...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;