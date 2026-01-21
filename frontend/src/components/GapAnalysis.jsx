import React, { useState, useEffect } from 'react';
import { analyzeGaps } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

function GapAnalysis({ skills, career, analysis, onAnalysisComplete, onContinue, onBack }) {
  const [loading, setLoading] = useState(!analysis);
  const [error, setError] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(analysis);

  useEffect(() => {
    if (!analysis && career && skills) {
      fetchAnalysis();
    }
  }, [career, skills, analysis]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      // Combine all skills
      const allSkills = [
        ...(skills.technical_skills || []),
        ...(skills.soft_skills || []),
        ...(skills.transferable_skills || []),
      ];

      const result = await analyzeGaps(allSkills, career.occupation_code);
      setCurrentAnalysis(result.analysis);
      onAnalysisComplete(result.analysis);
    } catch (err) {
      setError(err.message || 'Failed to analyze skills gap.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card max-w-2xl mx-auto text-center py-16 animate-fade-in">
        <LoadingSpinner size="large" />
        <p className="mt-6 text-white font-medium">Analyzing your skills gap...</p>
        <p className="text-navy-400 text-sm mt-2">Our AI is comparing your skills to job requirements</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card max-w-2xl mx-auto animate-fade-in">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6">
          {error}
        </div>
        <div className="flex justify-between">
          <button onClick={onBack} className="btn-secondary">Back</button>
          <button onClick={fetchAnalysis} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  const getReadinessLevel = (pct) => {
    if (pct >= 85) return { level: 'Highly Qualified', color: 'green', message: 'You\'re well-prepared for this role!' };
    if (pct >= 70) return { level: 'Qualified', color: 'blue', message: 'You meet most requirements.' };
    if (pct >= 50) return { level: 'Partially Qualified', color: 'yellow', message: 'Some skill development needed.' };
    return { level: 'Development Needed', color: 'orange', message: 'Consider a stepping-stone position.' };
  };

  const readiness = getReadinessLevel(currentAnalysis?.match_percentage || 0);
  const percentage = currentAnalysis?.match_percentage || 0;

  const colorMap = {
    green: { ring: '#22c55e', bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    blue: { ring: '#3b82f6', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    yellow: { ring: '#eab308', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    orange: { ring: '#f97316', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  };

  const colors = colorMap[readiness.color];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Career Header */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-flag-blue/30 to-flag-red/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-navy-600/50">
            <svg className="w-7 h-7 text-flag-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white">{career.occupation_title}</h2>
            <p className="text-navy-300 mt-1 line-clamp-2">{career.description}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <span className="text-navy-400 capitalize">{career.industry}</span>
              <span className="text-navy-400">{career.education_required}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Readiness Score */}
      <div className="card">
        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-flag-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Your Readiness Score
        </h3>

        <div className="flex items-center gap-8">
          {/* Circular Progress */}
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg className="transform -rotate-90 w-36 h-36">
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke={colors.ring}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${percentage * 3.77} 377`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-4xl font-bold text-white">
                {Math.round(percentage)}%
              </span>
              <span className="text-xs text-navy-400 font-medium">MATCH</span>
            </div>
          </div>

          <div className="flex-1">
            <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
              {readiness.level}
            </div>
            <p className="text-navy-300 mt-3">{readiness.message}</p>
            <p className="text-sm text-navy-400 mt-2">
              Estimated time to job-ready: <span className="text-white font-semibold">{currentAnalysis?.estimated_time_to_ready}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Skills Gaps */}
      {currentAnalysis?.gaps && currentAnalysis.gaps.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Skills to Develop ({currentAnalysis.gaps.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {currentAnalysis.gaps.map((gap, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-sm font-medium"
              >
                {gap}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Training Recommendations */}
      {currentAnalysis?.recommendations && currentAnalysis.recommendations.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-flag-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Recommended Training
          </h3>
          <div className="space-y-4">
            {currentAnalysis.recommendations.slice(0, 5).map((rec, index) => (
              <TrainingCard key={index} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* AI Development Plan */}
      {(currentAnalysis?.development_summary ||
        (currentAnalysis?.development_steps && currentAnalysis.development_steps.length > 0) ||
        (currentAnalysis?.resource_suggestions && currentAnalysis.resource_suggestions.length > 0)) && (
        <div className="card">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-flag-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8c-1.105 0-2 .895-2 2s.895 2 2 2 2 .895 2 2-.895 2-2 2m0-8c.74 0 1.386.404 1.732 1M12 8V7m0 1v8m0 0v1m0-1c-.74 0-1.386-.404-1.732-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Development Plan (AI)
          </h3>

          {currentAnalysis?.development_summary && (
            <p className="text-navy-300 mb-4">{currentAnalysis.development_summary}</p>
          )}

          {currentAnalysis?.development_steps?.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-navy-500 font-medium mb-2">NEXT STEPS</div>
              <ul className="list-disc list-inside text-navy-300 space-y-1">
                {currentAnalysis.development_steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {currentAnalysis?.resource_suggestions?.length > 0 && (
            <div>
              <div className="text-xs text-navy-500 font-medium mb-2">SOURCES OF DEVELOPMENT</div>
              <ul className="list-disc list-inside text-navy-300 space-y-1">
                {currentAnalysis.resource_suggestions.map((resource, idx) => (
                  <li key={idx}>{resource}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* No Gaps Message */}
      {Array.isArray(currentAnalysis?.gaps) && currentAnalysis.gaps.length === 0 && percentage >= 85 && (
        <div className="card bg-green-500/10 border-green-500/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-green-400">You're Fully Qualified!</h4>
              <p className="text-green-400/80 text-sm mt-1">
                Your military experience has prepared you well for this role.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="btn-secondary">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Careers
          </span>
        </button>
        <button onClick={onContinue} className="btn-primary">
          <span className="flex items-center gap-2">
            Generate Resume
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}

function TrainingCard({ recommendation }) {
  return (
    <div className="bg-navy-800/30 border border-navy-700/30 rounded-xl p-5">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white">{recommendation.certification}</h4>
          <p className="text-sm text-navy-400 mt-1">
            For: <span className="text-amber-400 font-medium">{recommendation.skill_gap}</span>
          </p>
        </div>
        {recommendation.va_eligible && (
          <span className="badge-success flex-shrink-0">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            VA Eligible
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
        <div>
          <span className="text-navy-500 text-xs font-medium">TIME</span>
          <div className="text-white font-medium mt-0.5">{recommendation.estimated_time}</div>
        </div>
        <div>
          <span className="text-navy-500 text-xs font-medium">COST</span>
          <div className="text-white font-medium mt-0.5">{recommendation.cost}</div>
        </div>
        <div>
          <span className="text-navy-500 text-xs font-medium">PROVIDER</span>
          <div className="text-white font-medium mt-0.5">{recommendation.provider || 'Various'}</div>
        </div>
      </div>
    </div>
  );
}

export default GapAnalysis;
