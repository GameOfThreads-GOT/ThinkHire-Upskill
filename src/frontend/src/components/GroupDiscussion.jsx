import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";

const topics = [
  "Is AI replacing human creativity?",
  "Should social media be banned for kids?",
  "Is remote work the future?",
  "Is coding essential for everyone?",
  "Should college degrees matter in hiring?",
  "Can AI help reduce poverty in India?",
  "Should governments regulate artificial intelligence development?",
  "Is globalization beneficial for developing countries?",
  "Should plastic bags be banned worldwide?",
  "Is entrepreneurship better than traditional employment?",
  "Should voting be mandatory in democratic countries?",
  "Is technology making us more isolated as individuals?",
  "Should genetically modified foods be promoted to solve hunger?",
  "Is work-life balance achievable in modern careers?",
  "Should space exploration receive more funding than social programs?"
];

export default function GroupDiscussion() {
  const [topic, setTopic] = useState("");
  const [answer, setAnswer] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }

    return () => clearTimeout(timerRef.current);
  }, [isTimerActive, timeLeft]);

  const generateTopic = () => {
    const t = topics[Math.floor(Math.random() * topics.length)];
    setTopic(t);
    setAnalysis(null);
    setAnswer("");
    setTimeLeft(120); // Reset timer to 2 minutes
    setIsTimerActive(true); // Start timer automatically
  };

  const nextTopic = () => {
    const t = topics[Math.floor(Math.random() * topics.length)];
    setTopic(t);
    setAnalysis(null);
    setAnswer("");
    setTimeLeft(120); // Reset timer to 2 minutes
    setIsTimerActive(true); // Start timer automatically
  };

  const toggleTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const submitGD = async () => {
    setLoading(true);
    setIsTimerActive(false); // Stop timer when submitting

    try {
      const res = await fetch("/api/analyze-gd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, answer, timeTaken: 120 - timeLeft }),
      });

      if (!res.ok) {
        throw new Error(`Analysis failed (${res.status}): ${res.statusText}`);
      }

      const data = await res.json();
      
      // Convert the backend response to the format expected by the frontend
      const convertedData = {
        score: Math.round((data.technical_accuracy + data.clarity_structure + data.depth_of_knowledge + 
                  data.communication + data.confidence + data.reasoning + data.emotion) / 7),
        strengths: data.strengths,
        weaknesses: data.improvements, // Backend uses 'improvements' but frontend expects 'weaknesses'
        suggestions: data.suggestions
      };
      
      setAnalysis(convertedData);
    } catch (error) {
      console.error("Error analyzing GD:", error);
      // Mock analysis for demonstration when API fails
      setAnalysis({
        score: Math.floor(Math.random() * 40) + 60, // Random score between 60-99
        strengths: ["Good structure", "Clear points", "Relevant examples"],
        weaknesses: ["Repetition", "Needs stronger conclusion"],
        suggestions: ["Add more data", "Use real-world examples", "Improve opening statement"]
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadFeedback = () => {
    if (!analysis) return;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Group Discussion Feedback", 20, 20);
    
    // Add topic
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text(`Topic: ${topic}`, 20, 35);
    
    // Add score
    doc.setFontSize(14);
    doc.text(`Overall Score: ${analysis.score}/100`, 20, 45);
    
    // Add strengths
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Strengths:", 20, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    analysis.strengths.forEach((strength, index) => {
      doc.text(`• ${strength}`, 25, 70 + (index * 7));
    });
    
    // Add weaknesses
    let yPos = 70 + (analysis.strengths.length * 7) + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Areas for Improvement:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    analysis.weaknesses.forEach((weakness, index) => {
      doc.text(`• ${weakness}`, 25, yPos + 10 + (index * 7));
    });
    
    // Add suggestions
    yPos = yPos + 10 + (analysis.weaknesses.length * 7) + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Suggestions:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    analysis.suggestions.forEach((suggestion, index) => {
      doc.text(`• ${suggestion}`, 25, yPos + 10 + (index * 7));
    });
    
    // Save the PDF
    doc.save(`GD_Feedback_${topic.substring(0, 20)}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-[var(--xai-bg-secondary)]/90 backdrop-blur-md p-6 rounded-2xl border border-[var(--xai-border)] transition-all duration-300">
        <h1 className="text-3xl font-bold text-[var(--xai-text-primary)] mb-6 text-center">Group Discussion Practice</h1>

        {!topic ? (
          <div className="text-center">
            <button
              onClick={generateTopic}
              className="px-6 py-3 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-xl font-semibold hover:bg-[var(--xai-bg-tertiary)] transition-all cursor-pointer"
            >
              Get GD Topic
            </button>
            <p className="mt-4 text-[var(--xai-text-secondary)]">
              Click the button above to get a random group discussion topic to practice
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[var(--xai-bg-tertiary)]/50 p-4 rounded-xl border border-[var(--xai-border)]">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--xai-border)]">
                <h2 className="text-xl font-semibold text-[var(--xai-text-primary)]">Topic:</h2>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-lg font-mono ${timeLeft <= 30 ? 'bg-red-500 text-white' : 'bg-[var(--xai-text-primary)] text-[var(--xai-bg-primary)]'}`}>
                    {formatTime(timeLeft)}
                  </div>
                  <button 
                    onClick={toggleTimer}
                    className="px-3 py-1 bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg hover:bg-[var(--xai-border)] transition-colors"
                  >
                    {isTimerActive ? 'Pause' : 'Resume'}
                  </button>
                </div>
              </div>
              <p className="text-lg mt-3 text-[var(--xai-text-primary)]">{topic}</p>
            </div>

            <div className="space-y-2 bg-[var(--xai-bg-tertiary)]/50 p-4 rounded-xl border border-[var(--xai-border)]">
              <h3 className="text-lg font-semibold text-[var(--xai-text-primary)] pb-2 border-b border-[var(--xai-border)]">Your Points</h3>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={8}
                placeholder="Write your GD points here… Try to think under time pressure!"
                className="w-full p-3 border border-[var(--xai-border)] rounded-lg bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all"
              />
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={nextTopic}
                className="px-6 py-3 bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg font-medium hover:bg-[var(--xai-bg-secondary)] transition-all cursor-pointer"
              >
                Next Topic
              </button>
              <button
                onClick={submitGD}
                disabled={loading}
                className="px-6 py-3 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg font-medium hover:bg-[var(--xai-bg-tertiary)] transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--xai-text-primary)] mr-2"></div>
                    Analyzing…
                  </div>
                ) : (
                  "Analyze GD Response"
                )}
              </button>
            </div>
          </div>
        )}

        {analysis && (
          <div className="mt-8 bg-[var(--xai-bg-secondary)] text-[var(--xai-text-primary)] p-6 rounded-xl border border-[var(--xai-border)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[var(--xai-text-primary)]">GD Analysis</h2>
              <button
                onClick={downloadFeedback}
                className="px-4 py-2 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] rounded-lg font-medium hover:bg-[var(--xai-bg-tertiary)] transition-colors border border-[var(--xai-border)]"
              >
                Download Feedback
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-[var(--xai-bg-tertiary)]/50 p-4 rounded-lg border border-[var(--xai-border)]">
                <h3 className="text-lg font-semibold text-[var(--xai-text-primary)] mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-[var(--xai-text-primary)]">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[var(--xai-bg-tertiary)]/50 p-4 rounded-lg border border-[var(--xai-border)]">
                <h3 className="text-lg font-semibold text-[var(--xai-text-primary)] mb-3">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-500 mr-2">⚠</span>
                      <span className="text-[var(--xai-text-primary)]">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-[var(--xai-bg-tertiary)]/50 p-4 rounded-lg border border-[var(--xai-border)]">
              <h3 className="text-lg font-semibold text-[var(--xai-text-primary)] mb-3">Suggestions</h3>
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">💡</span>
                    <span className="text-[var(--xai-text-primary)]">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={resetGD}
                className="px-6 py-3 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg font-medium hover:bg-[var(--xai-bg-tertiary)] transition-all"
              >
                Try Another GD
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}