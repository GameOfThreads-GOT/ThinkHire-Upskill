import { Link } from 'react-router-dom';

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-light)]">
      <header className="bg-[var(--background-card)] px-8 py-4 border-b border-[var(--border-color)] shadow-[var(--shadow-primary)]">
        <Link to="/" className="text-[var(--accent-primary)] no-underline hover:text-[var(--accent-secondary)] transition-colors">← Back to Home</Link>
        <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">ThinkHire</h1>
      </header>

      <main className="flex-1 p-8 max-w-[1000px] mx-auto w-full">
        <section className="py-8">
          <h2 className="text-4xl text-center mb-4 text-[var(--text-primary)] font-bold">HOW IT WORKS</h2>
          <p className="text-center text-lg text-[var(--text-secondary)] max-w-[700px] mx-auto mb-12">
            A simple, powerful workflow that turns your interviews into measurable growth.
          </p>
          
          <div className="space-y-8">
            <div className="bg-[var(--background-card)] p-6 rounded-[var(--border-radius)] shadow-[var(--shadow-primary)] border border-[var(--border-color)] flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center text-2xl font-bold">1</div>
              <div className="flex-1">
                <h3 className="text-2xl mb-3 text-[var(--text-primary)] font-semibold">Set Up Your Interview</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Start by selecting your role, difficulty level, and interview mode (Voice or Text).
                  You'll also get quick pre-interview tips to warm up and understand what to expect.
                  (Based on Phase 1 in your architecture diagram on page 5)
                </p>
              </div>
            </div>
            
            <div className="bg-[var(--background-card)] p-6 rounded-[var(--border-radius)] shadow-[var(--shadow-primary)] border border-[var(--border-color)] flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center text-2xl font-bold">2</div>
              <div className="flex-1">
                <h3 className="text-2xl mb-3 text-[var(--text-primary)] font-semibold">Choose Your Mode — Voice or Text</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="mode">
                    <h4 className="text-xl mb-3 text-[var(--text-primary)] font-semibold">Voice-Based Interview</h4>
                    <ul className="list-disc pl-6 text-[var(--text-secondary)] space-y-2 leading-relaxed">
                      <li>Real-time WebRTC session</li>
                      <li>AI interviewer speaks questions</li>
                      <li>You answer naturally</li>
                      <li>System captures tone, confidence, clarity, pace, fillers</li>
                      <li>(Phase 2A on page 5)</li>
                    </ul>
                  </div>
                  <div className="mode">
                    <h4 className="text-xl mb-3 text-[var(--text-primary)] font-semibold">Text Q&A Mode</h4>
                    <ul className="list-disc pl-6 text-[var(--text-secondary)] space-y-2 leading-relaxed">
                      <li>Ideal for analyzing thinking patterns</li>
                      <li>AI tests problem-solving step-by-step</li>
                      <li>Tracks reasoning flow and structure</li>
                      <li>(Phase 2B on page 5)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-[var(--background-card)] p-6 rounded-[var(--border-radius)] shadow-[var(--shadow-primary)] border border-[var(--border-color)] flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center text-2xl font-bold">3</div>
              <div className="flex-1">
                <h3 className="text-2xl mb-3 text-[var(--text-primary)] font-semibold">Get Adaptive, Role-Specific Questions</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Your AI interviewer uses GPT-4o to:
                </p>
                <ul className="list-disc pl-6 text-[var(--text-secondary)] space-y-2 leading-relaxed">
                  <li>Ask role-specific questions (ML, DS, SWE, HR, GD etc.)</li>
                  <li>Follow up based on your exact answer</li>
                  <li>Adjust difficulty dynamically</li>
                  <li>Spot weak areas instantly</li>
                </ul>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  This gives you realism no human mock interview can maintain.
                  (Adaptive Intelligence mentioned on page 3 & 4)
                </p>
              </div>
            </div>
            
            <div className="bg-[var(--background-card)] p-6 rounded-[var(--border-radius)] shadow-[var(--shadow-primary)] border border-[var(--border-color)] flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center text-2xl font-bold">4</div>
              <div className="flex-1">
                <h3 className="text-2xl mb-3 text-[var(--text-primary)] font-semibold">Receive Real-Time Evaluation While Answering</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  During the interview, the system evaluates you on:
                </p>
                <ul className="list-disc pl-6 text-[var(--text-secondary)] space-y-2 leading-relaxed">
                  <li>Technical accuracy</li>
                  <li>Communication clarity</li>
                  <li>Logical reasoning</li>
                  <li>Confidence & tone</li>
                  <li>Speaking patterns (WPM, pauses, fillers)</li>
                </ul>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Your answers are analyzed as you speak/type.
                  (Advanced analytics on page 3)
                </p>
              </div>
            </div>
            
            <div className="bg-[var(--background-card)] p-6 rounded-[var(--border-radius)] shadow-[var(--shadow-primary)] border border-[var(--border-color)] flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center text-2xl font-bold">5</div>
              <div className="flex-1">
                <h3 className="text-2xl mb-3 text-[var(--text-primary)] font-semibold">Deep-Dive Report + Dashboard</h3>
                <div className="space-y-6 mt-4">
                  <h4 className="text-xl mb-2 text-[var(--text-primary)] font-semibold">Full Report Includes:</h4>
                  <ul className="list-disc pl-6 text-[var(--text-secondary)] space-y-2 leading-relaxed">
                    <li>Complete transcript</li>
                    <li>Multi-dimensional scores</li>
                    <li>Confidence & communication metrics</li>
                    <li>Cognitive Breakdown Score</li>
                    <li>Writing-to-Speaking Gap insights</li>
                    <li>(Pages 3 & 7)</li>
                  </ul>
                </div>
                <div className="space-y-6 mt-4">
                  <h4 className="text-xl mb-2 text-[var(--text-primary)] font-semibold">Smart Dashboard:</h4>
                  <p>Visual charts show:</p>
                  <ul className="list-disc pl-6 text-[var(--text-secondary)] space-y-2 leading-relaxed">
                    <li>Weakness patterns</li>
                    <li>Growth areas</li>
                    <li>Performance over time</li>
                    <li>Strength/weakness highlights</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-[var(--background-card)] p-6 rounded-[var(--border-radius)] shadow-[var(--shadow-primary)] border border-[var(--border-color)] flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center text-2xl font-bold">6</div>
              <div className="flex-1">
                <h3 className="text-2xl mb-3 text-[var(--text-primary)] font-semibold">Personalized Improvement Plan</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Based on your weaknesses, the system generates a custom growth plan with:
                </p>
                <ul className="list-disc pl-6 text-[var(--text-secondary)] space-y-2 leading-relaxed">
                  <li>Curated resources</li>
                  <li>Practice roadmap</li>
                  <li>Priority-ordered topics</li>
                  <li>Next-interview suggestions</li>
                </ul>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  (Page 3 & 4: Personalized growth system)
                </p>
              </div>
            </div>
            
            <div className="bg-[var(--background-card)] p-6 rounded-[var(--border-radius)] shadow-[var(--shadow-primary)] border border-[var(--border-color)] flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center text-2xl font-bold">7</div>
              <div className="flex-1">
                <h3 className="text-2xl mb-3 text-[var(--text-primary)] font-semibold">Practice. Improve. Repeat.</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  You can take another interview, review past performance, or drill specific weakness areas.
                </p>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  The system learns you over time — getting smarter with each attempt.
                  (Architecture feedback loop on page 5)
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="text-center p-6 bg-[var(--background-card)] border-t border-[var(--border-color)] mt-auto">
        <p className="text-[var(--text-secondary)]">&copy; 2025 ThinkHire. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HowItWorksPage;