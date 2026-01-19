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
      <div className="card max-w-2xl mx-auto text-center py-12">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">Generating your professional resume...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a moment as we craft the perfect resume.</p>
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
          <button onClick={() => fetchResume()} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="section-heading">Your Professional Resume</h2>
        <p className="text-gray-600">
          Tailored for: <strong>{career.occupation_title}</strong>
        </p>
      </div>

      {/* Customization Options */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-3">Customize Resume</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              Target Company (Optional)
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
            className="btn-secondary flex items-center"
            disabled={loading}
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate
          </button>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Resume Preview</h3>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 max-h-[600px] overflow-y-auto prose prose-sm max-w-none">
          <ReactMarkdown>{currentResume}</ReactMarkdown>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-navy-50 rounded-lg p-4">
        <h4 className="font-medium text-navy-800 mb-2">Next Steps:</h4>
        <ul className="text-sm text-navy-700 space-y-1">
          <li>1. Review and personalize with your contact information</li>
          <li>2. Adjust bullet points to match the specific job posting</li>
          <li>3. Convert to PDF before submitting (use Google Docs or Word)</li>
          <li>4. Tailor for each application - use keywords from the job description</li>
        </ul>
      </div>

      {/* Success Message */}
      <div className="card bg-green-50 border border-green-200">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-green-800">Congratulations!</h4>
            <p className="text-green-700 text-sm mt-1">
              You've completed the VetPath journey. Your military experience has been
              translated into a powerful civilian resume. We wish you the best in your
              career transition!
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="btn-secondary">
          Back to Gap Analysis
        </button>
        <button onClick={onStartOver} className="btn-primary">
          Start New Search
        </button>
      </div>
    </div>
  );
}

export default ResumeGenerator;
