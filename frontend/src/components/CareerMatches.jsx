import React, { useState } from 'react';

function CareerMatches({ matches, skills, onSelectCareer, onBack }) {
  const [industryFilter, setIndustryFilter] = useState('all');
  const [salaryFilter, setSalaryFilter] = useState('all');

  // Get unique industries from matches
  const industries = ['all', ...new Set(matches.map(m => m.industry))];

  // Filter matches
  const filteredMatches = matches.filter(match => {
    if (industryFilter !== 'all' && match.industry !== industryFilter) return false;
    if (salaryFilter === '50k' && match.median_wage < 50000) return false;
    if (salaryFilter === '75k' && match.median_wage < 75000) return false;
    if (salaryFilter === '100k' && match.median_wage < 100000) return false;
    return true;
  });

  const formatSalary = (wage) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(wage);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="section-heading">Your Career Matches</h2>
        <p className="text-gray-600">
          Based on your skills, we found {matches.length} matching careers.
          Click on a career to see gap analysis and generate a resume.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="input-field py-2"
            >
              {industries.map(ind => (
                <option key={ind} value={ind}>
                  {ind === 'all' ? 'All Industries' : ind.charAt(0).toUpperCase() + ind.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Salary
            </label>
            <select
              value={salaryFilter}
              onChange={(e) => setSalaryFilter(e.target.value)}
              className="input-field py-2"
            >
              <option value="all">Any Salary</option>
              <option value="50k">$50,000+</option>
              <option value="75k">$75,000+</option>
              <option value="100k">$100,000+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-4">
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
              formatSalary={formatSalary}
            />
          ))
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-500">No careers match your current filters.</p>
            <button
              onClick={() => {
                setIndustryFilter('all');
                setSalaryFilter('all');
              }}
              className="text-flag-blue hover:underline mt-2"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="flex justify-start">
        <button onClick={onBack} className="btn-secondary">
          Back to Skills
        </button>
      </div>
    </div>
  );
}

function CareerCard({ career, rank, onSelect, formatSalary }) {
  const getOutlookColor = (outlook) => {
    const outlookLower = outlook.toLowerCase();
    if (outlookLower.includes('much faster')) return 'text-green-600 bg-green-50';
    if (outlookLower.includes('faster')) return 'text-green-600 bg-green-50';
    if (outlookLower.includes('average')) return 'text-yellow-600 bg-yellow-50';
    if (outlookLower.includes('declining')) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getMatchScoreColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div
      className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-flag-blue"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-8 rounded-full bg-navy-100 text-navy-800 flex items-center justify-center font-semibold text-sm">
              {rank}
            </span>
            <h3 className="text-lg font-semibold text-navy-900">
              {career.occupation_title}
            </h3>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {career.description}
          </p>

          <div className="flex flex-wrap gap-3 text-sm">
            <span className="flex items-center text-green-700">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatSalary(career.median_wage)}/yr
            </span>

            <span className={`px-2 py-0.5 rounded ${getOutlookColor(career.job_outlook)}`}>
              {career.job_outlook}
            </span>

            <span className="text-gray-500 capitalize">
              {career.industry}
            </span>
          </div>
        </div>

        <div className="text-right ml-4">
          <div className={`text-2xl font-bold ${getMatchScoreColor(career.skill_match_score)}`}>
            {Math.round(career.skill_match_score)}%
          </div>
          <div className="text-xs text-gray-500">Match</div>
        </div>
      </div>

      {/* Required Skills Preview */}
      {career.required_skills && career.required_skills.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">Key Skills:</div>
          <div className="flex flex-wrap gap-1">
            {career.required_skills.slice(0, 5).map((skill, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {skill}
              </span>
            ))}
            {career.required_skills.length > 5 && (
              <span className="px-2 py-0.5 text-gray-500 text-xs">
                +{career.required_skills.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-flag-blue font-medium flex items-center">
        View Details & Gap Analysis
        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

export default CareerMatches;
