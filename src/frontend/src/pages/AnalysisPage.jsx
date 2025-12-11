import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import logo from '../assets/thinkhire-logo.svg';

const AnalysisPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { analysisData, question, answer, domain, sessionScores, questionIndex } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(analysisData || null);

  // If no data is provided, show a message
  const [noData, setNoData] = useState(!analysisData);

  useEffect(() => {
    // If we don't have analysis data, fetch it from the backend
    if (!analysisData && question && answer && domain) {
      fetchAnalysis();
    } else if (!analysisData) {
      // If no data is provided at all, set noData to true
      setNoData(true);
      setLoading(false);
    }
  }, []);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      const response = await fetch('/api/analyze-text-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          answer,
          domain
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Check if it's a quota exceeded error
        if (response.status === 429 || errorText.includes('quota') || errorText.includes('Quota')) {
          throw new Error('API quota exceeded. Using simulated analysis results.');
        }
        throw new Error(`Analysis failed (${response.status}): ${errorText || 'Unknown error'}`);
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Analysis error:', err);
      // Even if there's an error, we can show mock data
      if (err.message.includes('quota') || err.message.includes('Quota')) {
        setError('API quota exceeded. Showing simulated analysis results.');
        // Set mock data for demonstration
        setAnalysis({
          technical_accuracy: 80,
          clarity_structure: 75,
          depth_of_knowledge: 70,
          communication: 85,
          reasoning: 80,
          strengths: [
            "Demonstrates solid understanding of core concepts",
            "Well-structured response with clear points",
            "Uses appropriate technical terminology"
          ],
          improvements: [
            "Could provide more specific examples",
            "Consider addressing potential counterarguments",
            "Add more quantitative data where relevant"
          ],
          suggestions: [
            "Include real-world case studies to illustrate points",
            "Mention relevant frameworks or tools in your field",
            "Practice structuring responses using the STAR method"
          ],
          recommended_resources: [
            { "title": "Domain-Specific Guide", "description": "Specialized resources for your field" },
            { "title": "Interview Preparation Kit", "description": "Comprehensive interview preparation materials" }
          ]
        });
      } else {
        setError(`Failed to analyze answer: ${err.message}. Please check your internet connection and try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to go back to the dashboard
  const handleBackToDashboard = () => {
    // Navigate without passing state to prevent auto-loading analysis
    navigate('/dashboard');
  };

  // Function to try another question
  const handleTryAnother = () => {
    // Navigate back to knowledge check with the same domain
    navigate('/dashboard', { 
      state: { 
        action: 'tryAnother', 
        domain: domain,
        questionIndex: questionIndex
      } 
    });
  };

  // Calculate overall score out of 10 (with decimals)
  const calculateOverallScore = () => {
    if (!analysis) return 0;

    const scores = [
      analysis.technical_accuracy || 0,
      analysis.clarity_structure || 0,
      analysis.depth_of_knowledge || 0,
      analysis.communication || 0,
      analysis.reasoning || 0
    ];

    const total = scores.reduce((sum, score) => sum + score, 0);
    const average = total / scores.length;

    // Convert to scale of 10 and round to 1 decimal place
    return (average / 10).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--xai-bg-primary)] text-[var(--xai-text-primary)] transition-colors duration-300">
        <Header title="Answer Analysis" />

        <main className="flex-1 p-8 max-w-[1400px] mx-auto w-full">
          <div className="text-center py-16">
            <h2 className="text-3xl mb-4 text-[var(--xai-text-primary)] font-bold">Analyzing your response...</h2>
            <div className="inline-block w-12 h-12 border-4 border-[var(--xai-text-primary)] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[var(--xai-text-secondary)]">Our AI is evaluating your answer</p>
          </div>
        </main>
      </div>
    );
  }

  if (noData) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--xai-bg-primary)] text-[var(--xai-text-primary)] transition-colors duration-300">
        <Header title="Answer Analysis" />

        <main className="flex-1 p-8 max-w-[1400px] mx-auto w-full">
          <div className="bg-[var(--xai-bg-secondary)]/60 backdrop-blur-sm p-8 rounded-2xl border border-[var(--xai-border)] text-center">
            <h2 className="text-3xl mb-4 text-[var(--xai-text-primary)] font-bold">No Analysis Data Available</h2>
            <p className="text-[var(--xai-text-secondary)] mb-6">Please complete a knowledge check or speech analysis to view detailed results.</p>
            <Link to="/dashboard" className="inline-block px-6 py-3 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] rounded-xl font-semibold hover:bg-[var(--xai-bg-tertiary)] transition-all no-underline border border-[var(--xai-border)]">Go to Dashboard</Link>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--xai-bg-primary)] text-[var(--xai-text-primary)] transition-colors duration-300">
        <Header title="Answer Analysis" />

        <main className="flex-1 p-8 max-w-[1400px] mx-auto w-full">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-xl"></div>
            <div className="relative bg-[var(--xai-bg-secondary)]/80 backdrop-blur-lg p-8 rounded-2xl border-2 border-red-500/50 text-center">
              <h2 className="text-3xl mb-4 text-red-500 font-bold">Oops! Something Went Wrong</h2>
              <p className="text-[var(--xai-text-secondary)] mb-6 text-lg">{error}</p>
              <button className="px-8 py-3 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] rounded-xl font-semibold hover:bg-[var(--xai-bg-tertiary)] transition-all border border-[var(--xai-border)] cursor-pointer active:scale-95" onClick={fetchAnalysis}>Try Again</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--xai-bg-primary)] text-[var(--xai-text-primary)] transition-colors duration-300">
      <Header title="Answer Analysis" />

      <main className="flex-1 p-8 max-w-[1400px] mx-auto w-full">
        {/* Overall Score Card */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--xai-primary)] to-[var(--xai-secondary)] rounded-3xl opacity-20 blur-xl"></div>
          <div className="relative bg-[var(--xai-bg-secondary)]/80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-[var(--xai-border)] overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--xai-primary)]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-[var(--xai-secondary)]/5 rounded-full blur-3xl"></div>
            <div className="relative">
              <h2 className="text-3xl mb-8 text-[var(--xai-text-primary)] font-bold text-center">Overall Score</h2>
              <div className="text-center mb-6">
                <div className="inline-flex items-baseline gap-2">
                  <span className="text-7xl font-bold bg-gradient-to-r from-[var(--xai-primary)] to-[var(--xai-accent)] text-transparent bg-clip-text">{calculateOverallScore()}</span>
                  <span className="text-3xl text-[var(--xai-text-secondary)] font-semibold">/10</span>
                </div>
              </div>
              <p className="text-[var(--xai-text-secondary)] text-center text-lg">Based on comprehensive performance analysis</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--xai-bg-secondary)]/70 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-[var(--xai-border)] mb-6 transition-all duration-200 hover:border-[var(--xai-border-light)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-gradient-to-b from-[var(--xai-primary)] to-[var(--xai-accent)] rounded-full"></div>
            <h2 className="text-2xl text-[var(--xai-text-primary)] font-bold">Question</h2>
          </div>
          <p className="text-[var(--xai-text-secondary)] leading-relaxed p-6 bg-[var(--xai-bg-tertiary)]/60 rounded-xl border-l-4 border-l-[var(--xai-primary)] border border-[var(--xai-border)]">{question || "Question not available"}</p>
        </div>

        <div className="bg-[var(--xai-bg-secondary)]/70 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-[var(--xai-border)] mb-8 transition-all duration-200 hover:border-[var(--xai-border-light)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-gradient-to-b from-[var(--xai-secondary)] to-[var(--xai-accent)] rounded-full"></div>
            <h2 className="text-2xl text-[var(--xai-text-primary)] font-bold">Your Response</h2>
          </div>
          <p className="text-[var(--xai-text-secondary)] leading-relaxed p-6 bg-[var(--xai-bg-tertiary)]/60 rounded-xl border-l-4 border-l-[var(--xai-secondary)] border border-[var(--xai-border)]">{answer || "Answer not available"}</p>
        </div>

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-1 h-10 bg-gradient-to-b from-[var(--xai-primary)] via-[var(--xai-secondary)] to-[var(--xai-accent)] rounded-full"></div>
            <h2 className="text-4xl text-[var(--xai-text-primary)] font-bold">Performance Metrics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[var(--xai-bg-secondary)]/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-[var(--xai-border)] transition-all duration-200 hover:border-[var(--xai-border-light)] overflow-hidden">
              <div className="relative">
                <h3 className="text-lg mb-4 text-[var(--xai-text-primary)] font-bold">Technical Accuracy</h3>
                <div className="text-5xl font-bold text-[var(--xai-text-primary)] mb-4 text-center">{analysis?.technical_accuracy || 0}%</div>
                <div className="w-full h-4 bg-[var(--xai-bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 shadow-lg relative"
                    style={{
                      width: `${analysis?.technical_accuracy || 0}%`,
                      backgroundColor: 'var(--xai-primary)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--xai-bg-secondary)]/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-[var(--xai-border)] transition-all duration-200 hover:border-[var(--xai-border-light)] overflow-hidden">
              <div className="relative">
                <h3 className="text-lg mb-4 text-[var(--xai-text-primary)] font-bold">Clarity & Structure</h3>
                <div className="text-5xl font-bold text-[var(--xai-text-primary)] mb-4 text-center">{analysis?.clarity_structure || 0}%</div>
                <div className="w-full h-4 bg-[var(--xai-bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 shadow-lg relative"
                    style={{
                      width: `${analysis?.clarity_structure || 0}%`,
                      backgroundColor: 'var(--xai-secondary)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--xai-bg-secondary)]/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-[var(--xai-border)] transition-all duration-200 hover:border-[var(--xai-border-light)] overflow-hidden">
              <div className="relative">
                <h3 className="text-lg mb-4 text-[var(--xai-text-primary)] font-bold">Depth of Knowledge</h3>
                <div className="text-5xl font-bold text-[var(--xai-text-primary)] mb-4 text-center">{analysis?.depth_of_knowledge || 0}%</div>
                <div className="w-full h-4 bg-[var(--xai-bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 shadow-lg relative"
                    style={{
                      width: `${analysis?.depth_of_knowledge || 0}%`,
                      backgroundColor: 'var(--xai-accent)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--xai-bg-secondary)]/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-[var(--xai-border)] transition-all duration-200 hover:border-[var(--xai-border-light)] overflow-hidden">
              <div className="relative">
                <h3 className="text-lg mb-4 text-[var(--xai-text-primary)] font-bold">Communication</h3>
                <div className="text-5xl font-bold text-[var(--xai-text-primary)] mb-4 text-center">{analysis?.communication || 0}%</div>
                <div className="w-full h-4 bg-[var(--xai-bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 shadow-lg relative"
                    style={{
                      width: `${analysis?.communication || 0}%`,
                      backgroundColor: 'var(--xai-primary)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--xai-bg-secondary)]/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-[var(--xai-border)] transition-all duration-200 hover:border-[var(--xai-border-light)] overflow-hidden">
              <div className="relative">
                <h3 className="text-lg mb-4 text-[var(--xai-text-primary)] font-bold">Reasoning</h3>
                <div className="text-5xl font-bold text-[var(--xai-text-primary)] mb-4 text-center">{analysis?.reasoning || 0}%</div>
                <div className="w-full h-4 bg-[var(--xai-bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 shadow-lg relative"
                    style={{
                      width: `${analysis?.reasoning || 0}%`,
                      backgroundColor: 'var(--xai-accent)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--xai-bg-secondary)]/70 backdrop-blur-xl p-10 rounded-2xl shadow-lg border border-[var(--xai-border)] mb-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-1 h-10 bg-gradient-to-b from-[var(--xai-primary)] via-[var(--xai-secondary)] to-[var(--xai-accent)] rounded-full"></div>
            <h2 className="text-3xl text-[var(--xai-text-primary)] font-bold">Detailed Feedback</h2>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl mb-6 text-[var(--xai-primary)] font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--xai-primary)] to-[var(--xai-accent)] flex items-center justify-center text-white font-bold">✓</div>
                <span>Strengths</span>
              </h3>
              <ul className="space-y-3">
                {(analysis?.strengths || []).map((strength, index) => (
                  <li key={index} className="flex gap-3 p-4 bg-[var(--xai-bg-tertiary)]/60 rounded-xl border-l-4 border-l-[var(--xai-primary)] border border-[var(--xai-border)] text-[var(--xai-text-secondary)] transition-all duration-200 hover:border-l-[var(--xai-border-light)]">
                    <span className="text-[var(--xai-primary)] font-bold mt-0.5">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl mb-6 text-[var(--xai-secondary)] font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--xai-secondary)] to-[var(--xai-primary)] flex items-center justify-center text-white font-bold">!</div>
                <span>Areas for Improvement</span>
              </h3>
              <ul className="space-y-3">
                {(analysis?.improvements || []).map((improvement, index) => (
                  <li key={index} className="flex gap-3 p-4 bg-[var(--xai-bg-tertiary)]/60 rounded-xl border-l-4 border-l-[var(--xai-secondary)] border border-[var(--xai-border)] text-[var(--xai-text-secondary)] transition-all duration-200 hover:border-l-[var(--xai-border-light)]">
                    <span className="text-[var(--xai-secondary)] font-bold mt-0.5">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl mb-6 text-[var(--xai-accent)] font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--xai-accent)] to-[var(--xai-secondary)] flex items-center justify-center text-white font-bold text-lg">★</div>
                <span>Suggestions for Growth</span>
              </h3>
              <ul className="space-y-3">
                {(analysis?.suggestions || []).map((suggestion, index) => (
                  <li key={index} className="flex gap-3 p-4 bg-[var(--xai-bg-tertiary)]/60 rounded-xl border-l-4 border-l-[var(--xai-accent)] border border-[var(--xai-border)] text-[var(--xai-text-secondary)] transition-all duration-200 hover:border-l-[var(--xai-border-light)]">
                    <span className="text-[var(--xai-accent)] font-bold mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-[var(--xai-bg-secondary)]/70 backdrop-blur-xl p-10 rounded-2xl shadow-lg border border-[var(--xai-border)] mb-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-1 h-10 bg-gradient-to-b from-[var(--xai-accent)] via-[var(--xai-secondary)] to-[var(--xai-primary)] rounded-full"></div>
            <h2 className="text-3xl text-[var(--xai-text-primary)] font-bold">Recommended Resources</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(analysis?.recommended_resources || []).map((resource, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--xai-primary)]/10 to-[var(--xai-accent)]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-lg"></div>
                <div className="relative p-6 bg-[var(--xai-bg-tertiary)]/60 rounded-xl border border-[var(--xai-border)] transition-all duration-200 hover:border-[var(--xai-border-light)]">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl mt-1">📚</div>
                    <h3 className="text-lg font-bold text-[var(--xai-text-primary)]">{resource.title}</h3>
                  </div>
                  <p className="text-[var(--xai-text-secondary)] leading-relaxed">{resource.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-6 justify-center mt-12">
          <button className="px-8 py-3 bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-xl font-semibold hover:bg-[var(--xai-bg-secondary)] transition-all duration-200 cursor-pointer" onClick={handleBackToDashboard}>
            Back to Dashboard
          </button>
          <button className="px-8 py-3 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-xl font-semibold hover:bg-[var(--xai-bg-tertiary)] transition-all duration-200 cursor-pointer" onClick={handleTryAnother}>
            Try Another Question
          </button>
        </div>
      </main>

      <footer className="text-center p-6 bg-[var(--xai-bg-secondary)] border-t border-[var(--xai-border)] mt-auto">
        <p className="text-[var(--xai-text-secondary)]">&copy; 2025 ThinkHire. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AnalysisPage;