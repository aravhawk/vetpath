import React from 'react';

function Welcome({ onGetStarted }) {
  return (
    <div className="text-center py-12">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">
          Welcome to VetPath
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Translating your military service into civilian career success.
          We help veterans find high-paying jobs in American manufacturing,
          technology, and skilled trades.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <FeatureCard
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title="Skills Translation"
          description="AI-powered analysis converts your military experience into civilian terminology employers understand."
        />
        <FeatureCard
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          title="Career Matching"
          description="Find civilian careers that match your military skills, prioritizing American manufacturing and tech jobs."
        />
        <FeatureCard
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title="Resume Builder"
          description="Generate a professional civilian resume tailored to your target job in seconds."
        />
      </div>

      {/* Call to Action */}
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-navy-900 mb-4">
          Ready to Start Your Journey?
        </h2>
        <p className="text-gray-600 mb-6">
          Join thousands of veterans who have successfully transitioned
          to rewarding civilian careers.
        </p>
        <button
          onClick={onGetStarted}
          className="btn-primary text-lg px-8 py-4 w-full sm:w-auto"
        >
          Get Started
        </button>
      </div>

      {/* Stats */}
      <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
        <Stat number="200K+" label="Veterans transition annually" />
        <Stat number="$95K" label="Avg. matched career salary" />
        <Stat number="100%" label="American AI technology" />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="card text-center hover:shadow-lg transition-shadow">
      <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4 text-flag-blue">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-navy-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function Stat({ number, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-flag-blue">{number}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

export default Welcome;
