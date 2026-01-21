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
    <div className="card max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
      <h2 className="section-heading">Review Your Skills</h2>
        <p className="text-navy-300">
        We've identified these skills from your experience. Review and edit as needed.
      </p>
      </div>

      {/* Leadership Summary */}
      {editedSkills.leadership && (
        <div className="bg-gradient-to-br from-flag-blue/20 to-flag-red/10 rounded-xl p-5 mb-6 border border-navy-700/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-flag-red/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-flag-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-2">Leadership Experience</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-navy-400">Level:</span>
                  <p className="text-white font-medium">{editedSkills.leadership.level}</p>
                </div>
                <div>
                  <span className="text-navy-400">Scope:</span>
                  <p className="text-white font-medium">{editedSkills.leadership.scope}</p>
                </div>
                <div>
                  <span className="text-navy-400">Context:</span>
                  <p className="text-white font-medium">{editedSkills.leadership.context}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Experience Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {editedSkills.years_experience && (
          <StatBox label="Years Experience" value={editedSkills.years_experience} icon="📅" />
        )}
        {editedSkills.asset_responsibility && (
          <StatBox label="Asset Responsibility" value={editedSkills.asset_responsibility} icon="💰" />
        )}
        {editedSkills.security_clearance && (
          <StatBox label="Security Clearance" value={editedSkills.security_clearance} icon="🔒" />
        )}
        {editedSkills.certifications?.length > 0 && (
          <StatBox label="Certifications" value={editedSkills.certifications.length} icon="📜" />
        )}
      </div>

      {/* Skills Tags */}
      <div className="mb-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-flag-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Identified Skills ({allSkills.length})
        </h3>
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
            <p className="text-navy-400 italic">No skills identified. Add some below.</p>
          )}
        </div>
      </div>

      {/* Add Skill */}
      <form onSubmit={addSkill} className="mb-6">
        <label className="block text-sm font-medium text-navy-200 mb-2">
          Add Additional Skills
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="input-field flex-1"
            placeholder="e.g., Project Management, Forklift Certified"
          />
          <button
            type="submit"
            className="btn-secondary px-5"
            disabled={!newSkill.trim()}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            Add
            </span>
          </button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Confirmation */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          </div>
          <div>
            <p className="text-green-400 font-semibold">Does this look accurate?</p>
            <p className="text-green-400/80 text-sm mt-1">
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
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          Back
          </span>
        </button>
        <button
          onClick={handleConfirm}
          disabled={allSkills.length === 0 || loading}
          className="btn-primary"
        >
          {loading ? (
            <span className="flex items-center gap-3">
              <LoadingSpinner size="small" />
              Finding Careers...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Find Matching Careers
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }) {
  return (
    <div className="bg-navy-800/30 rounded-xl p-4 text-center border border-navy-700/30">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-sm text-navy-400">{label}</div>
      <div className="font-bold text-white truncate">{value}</div>
    </div>
  );
}

function SkillTag({ skill, type, onRemove }) {
  const typeStyles = {
    technical: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30',
    soft: 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30',
    transferable: 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm border transition-colors ${typeStyles[type] || 'bg-navy-700/50 text-navy-300 border-navy-600/50'}`}>
      {skill}
      <button
        onClick={onRemove}
        className="ml-2 hover:opacity-70 transition-opacity"
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
