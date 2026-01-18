import React, { useState } from 'react';
import { matchCareers } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

function SkillsReview({ skills, onSkillsConfirm, onBack }) {
  const [editedSkills, setEditedSkills] = useState(skills);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all skills as a flat list for display
  const getAllSkills = () => {
    const allSkills = [];
    if (editedSkills.technical_skills) {
      allSkills.push(...editedSkills.technical_skills.map(s => ({ skill: s, type: 'technical' })));
    }
    if (editedSkills.soft_skills) {
      allSkills.push(...editedSkills.soft_skills.map(s => ({ skill: s, type: 'soft' })));
    }
    if (editedSkills.transferable_skills) {
      allSkills.push(...editedSkills.transferable_skills.map(s => ({ skill: s, type: 'transferable' })));
    }
    return allSkills;
  };

  const removeSkill = (skillToRemove, type) => {
    setEditedSkills(prev => ({
      ...prev,
      [`${type}_skills`]: prev[`${type}_skills`].filter(s => s !== skillToRemove),
    }));
  };

  const addSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim()) {
      setEditedSkills(prev => ({
        ...prev,
        transferable_skills: [...(prev.transferable_skills || []), newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);

    try {
      // Get all skills for matching
      const allSkillsList = [
        ...(editedSkills.technical_skills || []),
        ...(editedSkills.soft_skills || []),
        ...(editedSkills.transferable_skills || []),
      ];

      // Match careers
      const result = await matchCareers(allSkillsList);
      onSkillsConfirm(editedSkills, result.matches);
    } catch (err) {
      setError(err.message || 'Failed to match careers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const allSkills = getAllSkills();

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="section-heading">Review Your Skills</h2>
      <p className="text-gray-600 mb-6">
        We've identified these skills from your experience. Review and edit as needed.
      </p>

      {/* Leadership Summary */}
      {editedSkills.leadership && (
        <div className="bg-navy-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-navy-800 mb-2">Leadership Experience</h3>
          <div className="text-sm text-navy-700">
            <p><strong>Level:</strong> {editedSkills.leadership.level}</p>
            <p><strong>Scope:</strong> {editedSkills.leadership.scope}</p>
            <p><strong>Context:</strong> {editedSkills.leadership.context}</p>
          </div>
        </div>
      )}

      {/* Experience Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {editedSkills.years_experience && (
          <StatBox label="Years Experience" value={editedSkills.years_experience} />
        )}
        {editedSkills.asset_responsibility && (
          <StatBox label="Asset Responsibility" value={editedSkills.asset_responsibility} />
        )}
        {editedSkills.security_clearance && (
          <StatBox label="Security Clearance" value={editedSkills.security_clearance} />
        )}
        {editedSkills.certifications?.length > 0 && (
          <StatBox label="Certifications" value={editedSkills.certifications.length} />
        )}
      </div>

      {/* Skills Tags */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Identified Skills</h3>
        <div className="flex flex-wrap gap-2">
          {allSkills.map(({ skill, type }, index) => (
            <SkillTag
              key={`${type}-${index}`}
              skill={skill}
              type={type}
              onRemove={() => removeSkill(skill, type)}
            />
          ))}
          {allSkills.length === 0 && (
            <p className="text-gray-500 italic">No skills identified. Add some below.</p>
          )}
        </div>
      </div>

      {/* Add Skill */}
      <form onSubmit={addSkill} className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Add Additional Skills
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="input-field flex-1"
            placeholder="e.g., Project Management, Forklift Certified"
          />
          <button
            type="submit"
            className="btn-secondary px-4"
            disabled={!newSkill.trim()}
          >
            Add
          </button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {/* Confirmation */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-green-800 font-medium">Does this look accurate?</p>
            <p className="text-green-700 text-sm mt-1">
              You can remove skills that don't apply or add ones we missed.
              These will be used to match you with civilian careers.
            </p>
          </div>
        </div>
      </div>

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
          onClick={handleConfirm}
          disabled={allSkills.length === 0 || loading}
          className="btn-primary flex items-center space-x-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="small" />
              <span>Finding Careers...</span>
            </>
          ) : (
            <span>Find Matching Careers</span>
          )}
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-semibold text-navy-800 truncate">{value}</div>
    </div>
  );
}

function SkillTag({ skill, type, onRemove }) {
  const typeColors = {
    technical: 'bg-blue-100 text-blue-800 border-blue-200',
    soft: 'bg-green-100 text-green-800 border-green-200',
    transferable: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${typeColors[type] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {skill}
      <button
        onClick={onRemove}
        className="ml-2 hover:opacity-70"
        aria-label={`Remove ${skill}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

export default SkillsReview;
