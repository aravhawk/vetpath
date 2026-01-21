import React, { useState } from 'react';

function CareerMatches({ matches, onSelectCareer, onBack }) {
  const [industryFilter, setIndustryFilter] = useState('all');

  // Get unique industries from matches
  const industries = ['all', ...new Set(matches.map(m => m.industry))];

  // Filter matches
  const filteredMatches = matches.filter(match => {
    if (industryFilter !== 'all' && match.industry !== industryFilter) return false;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="section-heading">Your Career Matches</h2>
        <p className="text-navy-300">
          Based on your skills, we found <span className="text-white font-semibold">{matches.length}</span> matching careers.
          Click on a career to see gap analysis and generate a resume.
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-navy-200 mb-2">
              Industry
            </label>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="input-field py-2.5"
            >
              {industries.map(ind => (
                <option key={ind} value={ind}>
                  {ind === 'all' ? 'All Industries' : ind.charAt(0).toUpperCase() + ind.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-navy-400 mb-4">
        Showing {filteredMatches.length} of {matches.length} careers
      </p>

      {/* Career Cards */}
      <div className="space-y-4 mb-8">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match, index) => (
            <CareerCard
              key={match.occupation_code}
              career={match}
              rank={index + 1}
              onSelect={() => onSelectCareer(match)}
            />
          ))
        ) : (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-navy-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-navy-400 mb-3">No careers match your current filters.</p>
            <button
              onClick={() => {
                setIndustryFilter('all');
                setSalaryFilter('all');
              }}
              className="text-flag-red hover:text-flag-red/80 font-medium transition-colors"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="flex justify-start">
        <button onClick={onBack} className="btn-secondary">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Skills
          </span>
        </button>
      </div>
    </div>
  );
}

function CareerCard({ career, rank, onSelect }) {
  const getOutlookStyle = (outlook) => {
    const outlookLower = outlook.toLowerCase();
    if (outlookLower.includes('much faster') || outlookLower.includes('faster')) {
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
    if (outlookLower.includes('average')) {
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
    if (outlookLower.includes('declining')) {
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
    return 'bg-navy-700/50 text-navy-300 border-navy-600/50';
  };

  const getMatchScoreColor = (score) => {
    if (score >= 70) return 'from-green-500 to-green-400';
    if (score >= 50) return 'from-yellow-500 to-yellow-400';
    return 'from-navy-500 to-navy-400';
  };

  return (
    <div
      className="card hover:border-flag-red/30 transition-all duration-300 cursor-pointer group"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-flag-blue/30 to-flag-red/20 flex items-center justify-center font-bold text-white border border-navy-600/50">
              {rank}
            </span>
            <h3 className="text-lg font-bold text-white group-hover:text-flag-red transition-colors truncate">
              {career.occupation_title}
            </h3>
          </div>

          <p className="text-navy-300 text-sm mb-4 line-clamp-2">
            {career.description}
          </p>

          <div className="flex flex-wrap gap-3 text-sm">
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${getOutlookStyle(career.job_outlook)}`}>
              {career.job_outlook}
            </span>

            <span className="text-navy-400 capitalize flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {career.industry}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className={`text-3xl font-bold bg-gradient-to-r ${getMatchScoreColor(career.skill_match_score)} bg-clip-text text-transparent`}>
            {Math.round(career.skill_match_score)}%
          </div>
          <div className="text-xs text-navy-500 font-medium">MATCH</div>
        </div>
      </div>

      {/* Required Skills Preview */}
      {career.required_skills && career.required_skills.length > 0 && (
        <div className="mt-4 pt-4 border-t border-navy-700/50">
          <div className="text-xs text-navy-500 mb-2 font-medium">KEY SKILLS</div>
          <div className="flex flex-wrap gap-1.5">
            {career.required_skills.slice(0, 5).map((skill, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-navy-800/50 text-navy-300 rounded-md text-xs border border-navy-700/50"
              >
                {skill}
              </span>
            ))}
            {career.required_skills.length > 5 && (
              <span className="px-2 py-1 text-navy-500 text-xs">
                +{career.required_skills.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-flag-red font-medium flex items-center group-hover:gap-2 transition-all">
        View Details & Gap Analysis
        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

export default CareerMatches;
