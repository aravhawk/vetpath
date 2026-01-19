import React, { useState } from 'react';
import { parseExperience } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const BRANCHES = [
  'Army',
  'Navy',
  'Air Force',
  'Marine Corps',
  'Coast Guard',
  'Space Force',
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

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="section-heading">Tell Us About Your Service</h2>
      <p className="text-gray-600 mb-6">
        Share your military experience and we'll translate it into civilian career opportunities.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Branch and Years Row */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch of Service *
            </label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select branch...</option>
              {BRANCHES.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of Service *
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
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MOS/Rate/AFSC
              <span className="text-gray-400 font-normal ml-1">(Optional)</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Highest Rank Achieved
              <span className="text-gray-400 font-normal ml-1">(Optional)</span>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Describe Your Military Experience *
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
          <p className="mt-1 text-sm text-gray-500">
            {formData.experience_description.length}/50 minimum characters
            {formData.experience_description.length < 50 && (
              <span className="text-amber-600"> (please provide more detail)</span>
            )}
          </p>
        </div>

        {/* Tips */}
        <div className="bg-navy-50 rounded-lg p-4">
          <h4 className="font-medium text-navy-800 mb-2">Tips for Better Results:</h4>
          <ul className="text-sm text-navy-700 space-y-1">
            <li>• Include numbers: team size, budget/equipment values, quantities</li>
            <li>• Mention leadership roles and responsibilities</li>
            <li>• Describe technical skills and equipment you worked with</li>
            <li>• Include any certifications or special training</li>
          </ul>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!isValid || loading}
            className="btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span>Analyzing...</span>
              </>
            ) : (
              <span>Parse My Experience</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ServiceEntry;
