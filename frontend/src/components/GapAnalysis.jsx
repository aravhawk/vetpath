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

  const formatSalary = (wage) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(wage);
  };

  if (loading) {
    return (
      <div className="card max-w-2xl mx-auto text-center py-12">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">Analyzing your skills gap...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
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
    return { level: 'Development Needed', color: 'red', message: 'Consider a stepping-stone position.' };
  };

  const readiness = getReadinessLevel(currentAnalysis?.match_percentage || 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Career Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-navy-900">{career.occupation_title}</h2>
            <p className="text-gray-600 mt-1">{career.description}</p>
            <div className="flex gap-4 mt-3 text-sm">
              <span className="text-green-700 font-medium">
                {formatSalary(career.median_wage)}/yr median
              </span>
              <span className="text-gray-500">{career.industry}</span>
              <span className="text-gray-500">{career.education_required}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Readiness Score */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Your Readiness Score</h3>

        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={readiness.color === 'green' ? '#22c55e' :
                        readiness.color === 'blue' ? '#3b82f6' :
                        readiness.color === 'yellow' ? '#eab308' : '#ef4444'}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(currentAnalysis?.match_percentage || 0) * 3.52} 352`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-bold text-navy-900">
                {Math.round(currentAnalysis?.match_percentage || 0)}%
              </span>
              <span className="text-xs text-gray-500">Match</span>
            </div>
          </div>

          <div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium
              ${readiness.color === 'green' ? 'bg-green-100 text-green-800' :
                readiness.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                readiness.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'}`}>
              {readiness.level}
            </div>
            <p className="text-gray-600 mt-2">{readiness.message}</p>
            <p className="text-sm text-gray-500 mt-1">
              Estimated time to job-ready: <strong>{currentAnalysis?.estimated_time_to_ready}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Skills Gaps */}
      {currentAnalysis?.gaps && currentAnalysis.gaps.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">
            Skills to Develop ({currentAnalysis.gaps.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {currentAnalysis.gaps.map((gap, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-sm"
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
          <h3 className="font-semibold text-gray-800 mb-4">Recommended Training</h3>
          <div className="space-y-4">
            {currentAnalysis.recommendations.slice(0, 5).map((rec, index) => (
              <TrainingCard key={index} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* No Gaps Message */}
      {(!currentAnalysis?.gaps || currentAnalysis.gaps.length === 0) && (
        <div className="card bg-green-50 border border-green-200">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-green-800">You're Fully Qualified!</h4>
              <p className="text-green-700 text-sm">
                Your military experience has prepared you well for this role.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="btn-secondary">
          Back to Careers
        </button>
        <button onClick={onContinue} className="btn-primary">
          Generate Resume
        </button>
      </div>
    </div>
  );
}

function TrainingCard({ recommendation }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-navy-800">{recommendation.certification}</h4>
          <p className="text-sm text-gray-600 mt-1">
            For: <span className="text-amber-700">{recommendation.skill_gap}</span>
          </p>
        </div>
        {recommendation.va_eligible && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            VA Eligible
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
        <div>
          <span className="text-gray-500">Time:</span>
          <div className="font-medium">{recommendation.estimated_time}</div>
        </div>
        <div>
          <span className="text-gray-500">Cost:</span>
          <div className="font-medium">{recommendation.cost}</div>
        </div>
        <div>
          <span className="text-gray-500">Provider:</span>
          <div className="font-medium">{recommendation.provider || 'Various'}</div>
        </div>
      </div>
    </div>
  );
}

export default GapAnalysis;
