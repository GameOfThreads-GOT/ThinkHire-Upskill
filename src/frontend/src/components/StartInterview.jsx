import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const StartInterview = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const interviewDomains = [
    { id: 'ml', name: 'Machine Learning Engineer' },
    { id: 'ds', name: 'Data Scientist' },
    { id: 'se', name: 'Software Engineer' },
    { id: 'fin', name: 'Finance' },
    { id: 'pm', name: 'Product Manager' },
    { id: 'ux', name: 'UX Designer' },
    { id: 'hr', name: 'HR Specialist' },
    { id: 'sales', name: 'Sales' }
  ];

  const handleStartInterview = () => {
    console.log('Start Live Interview button clicked');
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted, selected domain:', selectedDomain);
    if (selectedDomain) {
      setIsLoading(true);
      // Navigate to live interview page with parameters
      console.log('Navigating to live interview page');
      navigate(`/live-interview?domain=${selectedDomain}`);
    } else {
      console.log('No domain selected');
    }
  };

  return (
    <div className="bg-[var(--xai-bg-secondary)]/60 backdrop-blur-sm p-6 rounded-2xl border border-[var(--xai-border)] transition-all duration-200 hover:border-[var(--xai-border-light)]">
      <h3 className="text-2xl mb-3 text-[var(--xai-text-primary)] font-bold">
        Start Interview
      </h3>
      <p className="text-[var(--xai-text-secondary)] mb-4">
        Begin a live mock interview session with our AI interviewer.
      </p>
      
      {!showForm ? (
        <button
          className="px-6 py-3 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg font-medium hover:bg-[var(--xai-bg-tertiary)] transition-all cursor-pointer"
          onClick={handleStartInterview}
        >
          Start Interview
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[var(--xai-text-primary)] font-medium mb-2">
              Select Interview Domain:
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full p-3 border border-[var(--xai-border)] rounded-lg bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] font-medium focus:outline-none focus:border-[var(--xai-text-primary)] transition-all cursor-pointer"
              disabled={isLoading}
            >
              <option value="">Choose a domain</option>
              {interviewDomains.map(domain => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              className="px-6 py-3 bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg font-medium hover:bg-[var(--xai-bg-secondary)] transition-all cursor-pointer"
              onClick={() => setShowForm(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg font-medium hover:bg-[var(--xai-bg-tertiary)] transition-all cursor-pointer flex items-center gap-2"
              disabled={!selectedDomain || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--xai-text-primary)] border-t-transparent rounded-full animate-spin"></div>
                  Starting...
                </>
              ) : (
                'Begin Interview'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StartInterview;