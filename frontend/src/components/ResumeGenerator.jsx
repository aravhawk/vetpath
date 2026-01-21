import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateResume } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

function ResumeGenerator({ profile, skills, career, resume, onResumeGenerated, onStartOver, onBack }) {
  const [loading, setLoading] = useState(!resume);
  const [error, setError] = useState(null);
  const [currentResume, setCurrentResume] = useState(resume);
  const [targetCompany, setTargetCompany] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!resume && profile && skills && career) {
      fetchResume();
    }
  }, [profile, skills, career, resume]);

  const fetchResume = async (company = null) => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateResume(
        profile,
        skills,
        career.occupation_title,
        company
      );
      setCurrentResume(result.resume_text);
      onResumeGenerated(result.resume_text);
    } catch (err) {
      setError(err.message || 'Failed to generate resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    fetchResume(targetCompany || null);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentResume], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${career.occupation_title.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="card max-w-2xl mx-auto text-center py-16 animate-fade-in">
        <LoadingSpinner size="large" />
        <p className="mt-6 text-white font-medium">Generating your professional resume...</p>
        <p className="text-navy-400 text-sm mt-2">Our AI is crafting the perfect resume for your target career</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card max-w-2xl mx-auto animate-fade-in">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
        <div className="flex justify-between">
          <button onClick={onBack} className="btn-secondary">Back</button>
          <button onClick={() => fetchResume()} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-green-400">Resume Generated</span>
        </div>
        <h2 className="section-heading">Your Professional Resume</h2>
        <p className="text-navy-300">
          Tailored for: <span className="text-white font-semibold">{career.occupation_title}</span>
        </p>
      </div>

      {/* Customization Options */}
      <div className="card">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-flag-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Customize Resume
        </h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-navy-300 mb-2">
              Target Company <span className="text-navy-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              className="input-field"
              placeholder="e.g., Boeing, Amazon, General Motors"
            />
          </div>
          <button
            onClick={handleRegenerate}
            className="btn-secondary"
            disabled={loading}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate
            </span>
          </button>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-flag-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Resume Preview
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-sm bg-navy-800/50 border border-navy-700/50 rounded-xl hover:bg-navy-700/50 transition-colors flex items-center gap-2 text-navy-200"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-sm bg-navy-800/50 border border-navy-700/50 rounded-xl hover:bg-navy-700/50 transition-colors flex items-center gap-2 text-navy-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 max-h-[600px] overflow-y-auto prose prose-sm max-w-none text-gray-800">
          <ReactMarkdown>{currentResume}</ReactMarkdown>
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
            <h4 className="font-semibold text-white mb-2">Next Steps</h4>
            <ol className="text-sm text-navy-300 space-y-1.5 list-decimal list-inside">
              <li>Review and personalize with your contact information</li>
              <li>Adjust bullet points to match the specific job posting</li>
              <li>Convert to PDF before submitting (use Google Docs or Word)</li>
              <li>Tailor for each application - use keywords from the job description</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="card bg-gradient-to-br from-green-500/10 to-flag-blue/10 border-green-500/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          </div>
          <div>
            <h4 className="font-bold text-white">Congratulations! Mission Accomplished.</h4>
            <p className="text-navy-300 text-sm mt-2">
              You've completed the VetPath journey. Your military experience has been
              translated into a powerful civilian resume. We wish you the best in your
              career transition - thank you for your service! 🇺🇸
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="btn-secondary">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          Back to Gap Analysis
          </span>
        </button>
        <button onClick={onStartOver} className="btn-primary">
          <span className="flex items-center gap-2">
          Start New Search
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}

export default ResumeGenerator;
