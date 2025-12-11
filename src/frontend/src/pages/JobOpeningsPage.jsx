import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const JobOpeningsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const url = 'https://jsearch.p.rapidapi.com/search?query=developer+jobs+in+chicago&page=1&num_pages=1&country=us&date_posted=all';
        
        const options = {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'jsearch.p.rapidapi.com',
            'x-rapidapi-key': 'fd5da3f1fbmshb67993ecc518ee4p197938jsn52ce2ae8b605'
          }
        };

        const response = await fetch(url, options);
        const data = await response.json();
        
        if (response.ok) {
          setJobs(data.data || []);
        } else {
          throw new Error(data.message || 'Failed to fetch jobs');
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError(err.message || 'An error occurred while fetching job openings');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const sanitizeHTML = (html) => {
    // Remove HTML tags using regex
    return html.replace(/<[^>]*>/g, '');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--xai-bg-primary)] text-[var(--xai-text-primary)] transition-colors duration-300">
      <Header title="Job Openings" />
      
      <main className="flex-1 p-4 md:p-8 max-w-[1400px] mx-auto w-full">
        <div className="mb-8 bg-[var(--xai-bg-secondary)]/60 backdrop-blur-sm p-6 rounded-2xl border border-[var(--xai-border)] transition-all duration-300">
          <h2 className="text-3xl mb-2 text-[var(--xai-text-primary)] font-bold">Developer Jobs in Chicago</h2>
          <p className="text-[var(--xai-text-secondary)] mb-4">Discover the latest developer opportunities in Chicago from top companies</p>
          
          <div className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--xai-text-primary)]"></div>
                <span className="ml-3 text-[var(--xai-text-primary)]">Loading job openings...</span>
              </div>
            ) : error ? (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[var(--xai-text-secondary)] text-lg">No job openings found at the moment.</p>
                <p className="text-[var(--xai-text-secondary)] mt-2">Please check back later for new opportunities.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="bg-[var(--xai-bg-tertiary)]/80 backdrop-blur-sm p-6 rounded-xl border border-[var(--xai-border)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-[var(--xai-text-primary)] mb-2">{job.job_title || job.job_title || 'Untitled Position'}</h3>
                      {job.logo_url && (
                        <img 
                          src={job.logo_url} 
                          alt={`${job.company_name} logo`} 
                          className="w-12 h-12 object-contain rounded"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-[var(--xai-text-secondary)]">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 11-2 0V4a1 1 0 00-1-1H7a1 1 0 00-1 1v12a1 1 0 11-2 0V4z" clipRule="evenodd" />
                        </svg>
                        {job.company_name}
                      </div>
                      
                      <div className="flex items-center text-[var(--xai-text-secondary)]">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {job.location}
                      </div>
                      
                      {job.salary_range && (
                        <div className="flex items-center text-[var(--xai-text-secondary)]">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                          </svg>
                          {job.salary_range}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-6">
                      <span className="text-xs px-2 py-1 bg-[var(--xai-bg-secondary)] text-[var(--xai-text-secondary)] rounded">
                        {formatDate(job.posted_date)}
                      </span>
                      <a 
                        href={job.apply_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg hover:bg-[var(--xai-bg-tertiary)] transition-colors text-sm font-medium"
                      >
                        Apply Now
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobOpeningsPage;