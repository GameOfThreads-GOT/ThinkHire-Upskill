import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import authService from '../services/authService';

const domainQuestions = {
  ml: [
    "Tell me about your ML background—what kinds of models have you worked with most recently?",
    "How do you define the difference between machine learning and traditional programming?",
    "Explain bias vs variance in your own words.",
    "What is overfitting? How do you detect and fix it?",
    "How do you handle missing data in a dataset?",
    "Can you explain the difference between supervised, unsupervised, and reinforcement learning?",
    "Walk me through the train/validation/test split and why we do it.",
    "What evaluation metrics do you commonly use for classification?",
    "What evaluation metrics do you use for regression?",
    "Explain regularization and why it's used.",
    "Explain how decision trees work internally.",
    "Compare Random Forest and Gradient Boosting models.",
    "How does XGBoost achieve better performance than standard GBMs?",
    "Walk me through how backpropagation works.",
    "What is the purpose of activation functions in neural nets?",
    "How do Batch Norm and Layer Norm work?",
    "What techniques do you use to optimize model training speed?",
    "What are embeddings and where are they used?",
    "Explain how you would tune hyperparameters systematically.",
    "What's the difference between online learning and batch learning?",
    "Explain the architecture of a Transformer model.",
    "How does attention work (self-attention vs cross-attention)?",
    "What's your approach to deploying ML models at scale?",
    "How do you monitor model drift in production?",
    "Explain feature stores and why they matter in ML pipelines.",
    "How do you ensure fairness and avoid model bias?",
    "Walk me through an ML project you built—model, pipeline, evaluation, deployment.",
    "How do you design an end-to-end ML architecture for high throughput?",
    "How do you version models and datasets?",
    "Give an example of a time your model failed in production—what happened and what did you fix?"
  ],
  ds: [
    "Walk me through your approach to exploring a dataset.",
    "Explain the difference between correlation and causation.",
    "What is a p-value?",
    "What assumptions does linear regression make?",
    "How do you identify outliers?",
    "What is A/B testing and how do you design one?",
    "Define statistical significance in simple words.",
    "What kinds of data cleaning steps do you do commonly?",
    "Explain central limit theorem.",
    "What is CLTV? How is it calculated?",
    "Explain logistic regression and its decision boundary.",
    "How do you choose between precision, recall, and F1-score?",
    "How do you handle imbalanced datasets?",
    "Explain clustering and give use cases.",
    "Compare k-means vs hierarchical clustering.",
    "How do you engineer features for tabular data?",
    "Explain PCA and when to use it.",
    "What's your approach to time-series forecasting?",
    "How do you prevent data leakage?",
    "Walk me through a DS project you're proud of.",
    "How do you build a recommendation system from scratch?",
    "Explain survival analysis and when it's useful.",
    "How do you perform uplift modeling?",
    "Explain anomaly detection approaches.",
    "How do you select KPIs for a product or business?",
    "Explain how you evaluate marketing performance analytically.",
    "How do you measure model stability over time?",
    "Explain cohort analysis with an example.",
    "How would you forecast demand for a new product with no historical data?",
    "What makes a data science solution 'production-ready'?"
  ],
  se: [
    "Tell me about the languages you're strongest in.",
    "Explain OOP principles.",
    "How does memory allocation work?",
    "What's the difference between heap vs stack?",
    "Explain time complexity with examples.",
    "What is a REST API?",
    "How does HTTPS work?",
    "What is multithreading?",
    "Explain pass-by-value vs pass-by-reference.",
    "What is an interface?",
    "Explain how garbage collection works.",
    "What is a deadlock and how do you avoid it?",
    "Explain MVC architecture.",
    "How does a database index work?",
    "Compare SQL vs NoSQL.",
    "How would you design a caching layer?",
    "Explain microservices architecture.",
    "What's your approach to writing scalable code?",
    "How do you test APIs effectively?",
    "Explain CI/CD.",
    "Design a URL shortener.",
    "How would you scale a chat application?",
    "Explain load balancing strategies.",
    "How do you ensure database consistency at scale?",
    "What is eventual consistency?",
    "How do you avoid race conditions in distributed systems?",
    "Explain CAP theorem.",
    "How do you handle high concurrency systems?",
    "Walk me through a complex system you built.",
    "What trade-offs do you consider when choosing architectures?"
  ],
  fin: [
    "Explain the difference between assets, liabilities, and equity.",
    "What is EBITDA?",
    "How do you read an income statement?",
    "What is working capital?",
    "Explain NPV.",
    "What is IRR?",
    "What is liquidity?",
    "What are derivatives?",
    "Explain risk vs return.",
    "What is compounding?",
    "Walk me through DCF analysis.",
    "How do you evaluate company valuation?",
    "What drives stock prices?",
    "Explain portfolio diversification.",
    "What is beta?",
    "How do interest rates affect the economy?",
    "Explain bond pricing.",
    "Compare mutual funds vs ETFs.",
    "Explain market efficiency.",
    "How do you analyze credit risk?",
    "Explain the Black-Scholes model.",
    "What are hedging strategies?",
    "Walk me through M&A analysis.",
    "What are structured financial products?",
    "Explain VaR and its limitations.",
    "How do banks manage operational risk?",
    "Explain financial contagion.",
    "What stress testing methodology would you use?",
    "How do you forecast economic indicators?",
    "Explain yield curve inversion and market implications."
  ],
  pm: [
    "What's your product philosophy?",
    "Explain the product lifecycle.",
    "How do you define a good product requirement?",
    "What is a user persona?",
    "How do you define success metrics for a feature?",
    "Explain MVP with example.",
    "What is a user journey map?",
    "How do you prioritize features?",
    "Explain the Kano model.",
    "What makes good UX?",
    "How do you gather user feedback?",
    "Explain A/B testing in product decisions.",
    "How do you handle conflict between engineering and marketing teams?",
    "Describe your roadmap creation process.",
    "How do you estimate effort?",
    "Walk me through your PRD structure.",
    "Explain north-star metric.",
    "How do you balance innovation vs maintenance?",
    "What's your biggest product failure?",
    "How do you evaluate new opportunities?",
    "How do you scale a product internationally?",
    "How do you design onboarding for a complex product?",
    "Explain product-market fit indicators.",
    "How do you manage declines in engagement?",
    "Walk me through a zero-to-one product you'd build.",
    "Explain pricing strategy frameworks.",
    "How do you create a growth loop?",
    "How do you run a product experiment end-to-end?",
    "What KPIs would you track for SaaS?",
    "Explain how you manage tech debt as a PM."
  ],
  ux: [
    "What's your design philosophy?",
    "Walk me through your design process.",
    "What is user research?",
    "Explain heuristic evaluation.",
    "What is an information architecture?",
    "What is a wireframe?",
    "Explain prototyping levels (low/mid/high fidelity).",
    "How do you choose color palettes?",
    "Explain typography hierarchy.",
    "What makes a good user flow?",
    "How do you conduct usability testing?",
    "Explain accessibility guidelines (WCAG).",
    "How do you present design to stakeholders?",
    "Explain design systems.",
    "How do you maintain consistency across screens?",
    "Describe how you gather user pain points.",
    "How do you iterate on feedback?",
    "Explain UX metrics like SUS, CSAT, NPS.",
    "Describe one major UX redesign you did.",
    "How do you design for mobile-first?",
    "Explain cognitive load in UI.",
    "How do you use data in design decisions?",
    "How do you design for different personas at once?",
    "What's your process for interaction design?",
    "How do you handle complex dashboards?",
    "Explain UX for enterprise apps vs consumer apps.",
    "How do you integrate motion design effectively?",
    "How do you manage designer-developer collaboration?",
    "How do you scale design system for multiple products?",
    "Walk me through your most challenging UX project."
  ],
  hr: [
    "Explain the HR lifecycle.",
    "What is workforce planning?",
    "How do you screen candidates?",
    "What is competency-based interviewing?",
    "Explain structured vs unstructured interviews.",
    "How do you evaluate cultural fit?",
    "How do you handle confidential information?",
    "What is succession planning?",
    "Explain onboarding best practices.",
    "How do you resolve employee disputes?",
    "How do you measure employee performance?",
    "Explain OKRs and KPIs for employees.",
    "How do you create training plans?",
    "Explain HR analytics.",
    "How do you handle low-performing employees?",
    "Describe your payroll management process.",
    "What is 360° feedback?",
    "How do you handle diversity & inclusion initiatives?",
    "Explain employee engagement frameworks.",
    "How do you reduce attrition?",
    "How do you run an organization-wide talent audit?",
    "Explain compensation benchmarking.",
    "How do you design incentive programs?",
    "Walk me through handling a workplace investigation.",
    "Explain labor law compliance.",
    "How do you align HR strategy with business strategy?",
    "What's your approach to HR digital transformation?",
    "How do you manage change during restructuring?",
    "How do you manage conflict between senior employees?",
    "Explain how HR can improve company-wide productivity."
  ],
  sales: [
    "What's your sales philosophy?",
    "Explain the difference between inbound vs outbound sales.",
    "What is your prospecting process?",
    "How do you qualify leads?",
    "Explain BANT.",
    "What is your cold outreach approach?",
    "How do you handle objections?",
    "Explain your follow-up strategy.",
    "How do you build relationships with clients?",
    "Describe your typical sales funnel.",
    "How do you run a discovery call?",
    "Explain value-based selling.",
    "How do you personalize presentations?",
    "Walk me through your negotiation strategy.",
    "How do you handle price objections?",
    "Explain upselling vs cross-selling.",
    "How do you forecast revenue?",
    "Describe your CRM usage.",
    "Explain account management best practices.",
    "How do you prevent churn?",
    "How do you segment enterprise vs SMB clients?",
    "Explain sales enablement workflows.",
    "How do you evaluate sales pipeline health?",
    "Walk me through building a full sales playbook.",
    "How do you train new sales reps?",
    "What's your approach to large-deal closing?",
    "Explain partner/channel sales strategy.",
    "How do you handle multi-stakeholder sales cycles?",
    "What KPIs matter most in a modern sales team?",
    "How do you scale a sales organization?"
  ]
};

const KnowledgeCheck = ({ onSessionScoresUpdate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.action === 'tryAnother' && location.state?.domain) {
      setSelectedDomain(location.state.domain);
      // Move to next question
      const nextIndex = (location.state.questionIndex !== undefined) ? location.state.questionIndex + 1 : 0;
      setCurrentQuestionIndex(nextIndex);
      setShowForm(true);

      // Clear state to prevent loops
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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

  const getCurrentQuestion = () => {
    const questions = domainQuestions[selectedDomain] || [];
    const index = currentQuestionIndex % questions.length;
    return questions[index] || "No questions available for this domain.";
  };

  const handleStartKnowledgeCheck = () => {
    setShowForm(true);
  };

  const handleDomainSelect = (domainId) => {
    setSelectedDomain(domainId);
    setCurrentQuestionIndex(0);
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (userAnswer.trim() && selectedDomain) {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/analyze-text-answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: getCurrentQuestion(),
            answer: userAnswer,
            domain: selectedDomain
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze answer');
        }

        const analysisData = await response.json();

        let newScore = null;
        if (analysisData) {
          const avgScore = Math.round((
            (analysisData.technical_accuracy || 0) +
            (analysisData.clarity_structure || 0) +
            (analysisData.depth_of_knowledge || 0) +
            (analysisData.communication || 0) +
            (analysisData.reasoning || 0)
          ) / 5);

          newScore = {
            question: getCurrentQuestion(),
            score: avgScore,
            timestamp: new Date().toISOString()
          };

          // Save to session scores
          const savedScores = authService.getSessionScores();
          const updatedScores = [...savedScores, newScore];
          authService.saveSessionScores(updatedScores);
        }

        navigate('/analysis', {
          state: {
            analysisData,
            question: getCurrentQuestion(),
            answer: userAnswer,
            domain: selectedDomain,
            questionIndex: currentQuestionIndex,
            sessionScores: newScore ? [newScore] : []
          }
        });
      } catch (error) {
        console.error('Error analyzing answer:', error);
        alert(`Error: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-[var(--xai-bg-secondary)]/60 backdrop-blur-sm p-6 rounded-2xl border border-[var(--xai-border)] transition-all duration-200 hover:border-[var(--xai-border-light)]">      <h3 className="text-2xl mb-3 text-[var(--xai-text-primary)] font-bold">
        Knowledge Check
      </h3>
      <p className="text-[var(--xai-text-secondary)] mb-4">
        Test your readiness with text-based interview questions.
      </p>
      <button
        className="px-6 py-3 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg font-medium hover:bg-[var(--xai-bg-tertiary)] transition-all active:scale-95 cursor-pointer"
        onClick={handleStartKnowledgeCheck}
      >
        Start Knowledge Check
      </button>
      {showForm && (
        <div className="mt-6">
          {isSubmitting ? (
            <div className="p-8 bg-[var(--xai-bg-secondary)]/70 backdrop-blur-lg rounded-2xl border border-[var(--xai-border)]">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-6">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-2 border-[var(--xai-border)] border-t-[var(--xai-text-primary)] rounded-full animate-spin"></div>
                  </div>
                </div>
                <h3 className="text-xl font-medium text-[var(--xai-text-primary)] mb-2">
                  Analyzing Your Response
                </h3>
                <p className="text-[var(--xai-text-secondary)] mb-4 text-center">
                  Our AI is evaluating your answer
                </p>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--xai-text-primary)', animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--xai-text-secondary)', animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--xai-highlight)', animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>          ) : (
            <form onSubmit={handleAnswerSubmit} className="p-4 bg-[var(--xai-bg-tertiary)]/40 rounded-xl border border-[var(--xai-border)]">
              <div className="form-group">
                <label className="text-[var(--xai-text-primary)] font-medium mb-2 block">
                  Select Domain:
                </label>
                <select
                  value={selectedDomain}
                  onChange={(e) => handleDomainSelect(e.target.value)}
                  className="w-full p-3 border border-[var(--xai-border)] rounded-lg bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] font-medium focus:outline-none focus:border-[var(--xai-text-primary)] transition-all cursor-pointer"
                >
                  <option value="">Choose a domain</option>
                  {interviewDomains.map(domain => (
                    <option key={domain.id} value={domain.id}>
                      {domain.name}
                    </option>
                  ))}
                </select>
              </div>              {selectedDomain && (
                <>
                  <div className="form-group mt-4">
                    <label className="text-[var(--xai-text-primary)] font-medium mb-2 block">
                      Question {currentQuestionIndex + 1} of {domainQuestions[selectedDomain]?.length || 0}:
                    </label>
                    <p className="text-[var(--xai-text-secondary)] p-4 bg-[var(--xai-bg-secondary)]/60 rounded-lg border-l border-l-[var(--xai-text-primary)] mb-4 leading-relaxed">
                      {getCurrentQuestion()}
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="text-[var(--xai-text-primary)] font-medium mb-2 block">
                      Your Answer:
                    </label>
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="w-full p-4 border border-[var(--xai-border)] rounded-xl bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] resize-y min-h-[120px] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all duration-300"
                      rows="6"
                      placeholder="Type your answer here..."
                    />
                  </div>
                </>
              )}              <div className="form-actions flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  className="px-6 py-3 bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg font-medium hover:bg-[var(--xai-bg-secondary)] transition-all cursor-pointer active:scale-95"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg font-medium hover:bg-[var(--xai-bg-tertiary)] transition-all cursor-pointer active:scale-95"
                  disabled={!selectedDomain || !userAnswer.trim()}
                >
                  Submit for Analysis
                </button>
              </div>            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeCheck;
