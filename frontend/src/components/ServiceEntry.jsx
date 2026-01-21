import React, { useState } from 'react';
import { parseExperience } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const BRANCHES = [
  { name: 'Army', icon: '⭐' },
  { name: 'Navy', icon: '⚓' },
  { name: 'Air Force', icon: '✈️' },
  { name: 'Marine Corps', icon: '🦅' },
  { name: 'Coast Guard', icon: '🛟' },
  { name: 'Space Force', icon: '🚀' },
];

function ServiceEntry({ profile, onProfileSubmit, onBack }) {
  const [formData, setFormData] = useState(profile || {
    branch: '',
    years_of_service: '',
    mos_code: '',
    rank: '',
    experience_description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Parse the experience
      const result = await parseExperience(formData.experience_description);

      // Create profile object
      const newProfile = {
        branch: formData.branch,
        years_of_service: parseInt(formData.years_of_service) || 0,
        mos_code: formData.mos_code || null,
        rank: formData.rank || null,
        experience_description: formData.experience_description,
      };

      onProfileSubmit(newProfile, result.skills);
    } catch (err) {
      setError(err.message || 'Failed to parse experience. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isValid = formData.branch && formData.years_of_service && formData.experience_description.length >= 50;
  const charCount = formData.experience_description.length;

  return (
    <div className="card max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
      <h2 className="section-heading">Tell Us About Your Service</h2>
        <p className="text-navy-300">
          Share your military experience and our AI will translate it into civilian career opportunities.
      </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Branch and Years Row */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-2">
              Branch of Service <span className="text-flag-red">*</span>
            </label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select your branch...</option>
              {BRANCHES.map(branch => (
                <option key={branch.name} value={branch.name}>
                  {branch.icon} {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-200 mb-2">
              Years of Service <span className="text-flag-red">*</span>
            </label>
            <input
              type="number"
              name="years_of_service"
              value={formData.years_of_service}
              onChange={handleChange}
              min="1"
              max="40"
              className="input-field"
              placeholder="e.g., 4"
              required
            />
          </div>
        </div>

        {/* MOS and Rank Row */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-2">
              MOS/Rate/AFSC
              <span className="text-navy-500 font-normal ml-2">(Optional)</span>
            </label>
            <input
              type="text"
              name="mos_code"
              value={formData.mos_code}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 11B, IT, 3D0X2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-200 mb-2">
              Highest Rank Achieved
              <span className="text-navy-500 font-normal ml-2">(Optional)</span>
            </label>
            <input
              type="text"
              name="rank"
              value={formData.rank}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., E-5, Sergeant"
            />
          </div>
        </div>

        {/* Experience Description */}
        <div>
          <label className="block text-sm font-medium text-navy-200 mb-2">
            Describe Your Military Experience <span className="text-flag-red">*</span>
          </label>
          <textarea
            name="experience_description"
            value={formData.experience_description}
            onChange={handleChange}
            rows={6}
            className="input-field resize-none"
            placeholder="Example: I served 4 years as an 11B Infantryman in the US Army. Led a 9-person squad during deployment. Responsible for equipment maintenance valued at $2M. Trained junior soldiers on tactics and equipment operation. Coordinated logistics for multiple field operations..."
            required
          />
          <div className="mt-2 flex justify-between items-center">
            <p className="text-sm text-navy-400">
              {charCount < 50 ? (
                <span className="text-amber-400">
                  {50 - charCount} more characters needed
                </span>
              ) : (
                <span className="text-green-400">
                  ✓ Minimum reached
                </span>
            )}
          </p>
            <p className="text-sm text-navy-500">{charCount} characters</p>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-navy-800/30 rounded-xl p-5 border border-navy-700/30">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-flag-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-flag-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Tips for Better Results</h4>
              <ul className="text-sm text-navy-300 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-flag-red">•</span>
                  Include numbers: team size, budget/equipment values, quantities
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-flag-red">•</span>
                  Mention leadership roles and responsibilities
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-flag-red">•</span>
                  Describe technical skills and equipment you worked with
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-flag-red">•</span>
                  Include any certifications or special training
                </li>
          </ul>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            Back
            </span>
          </button>
          <button
            type="submit"
            disabled={!isValid || loading}
            className="btn-primary"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <LoadingSpinner size="small" />
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Parse My Experience
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ServiceEntry;
