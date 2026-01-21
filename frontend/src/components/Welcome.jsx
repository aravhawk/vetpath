import React, { useEffect, useState } from 'react';

function Welcome({ onGetStarted }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative text-center py-8 md:py-12 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-flag-red/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-flag-blue/10 rounded-full blur-3xl animate-float animate-delay-300" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-flag-red/5 to-flag-blue/5 rounded-full blur-3xl animate-pulse-glow" />
        
        {/* Decorative stars */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className={`relative mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-flag-red/10 border border-flag-red/20 rounded-full mb-6 animate-bounce-in">
          <svg className="w-4 h-4 text-flag-red animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-medium text-flag-red">Supporting American Veterans</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
          <span className="block text-white animate-slide-up" style={{ animationDelay: '0.1s' }}>Your Service.</span>
          <span className="block text-gradient animate-slide-up" style={{ animationDelay: '0.2s' }}>Your Skills.</span>
          <span className="block text-flag-red animate-slide-up animate-pulse-glow inline-block" style={{ animationDelay: '0.3s' }}>Your Future.</span>
        </h1>
        
        <p className="text-xl text-navy-300 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.5s' }}>
          VetPath uses <span className="text-white font-semibold relative">
            American-made AI
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-flag-red/50 animate-pulse" />
          </span> to translate 
          your military experience into high-paying civilian careers in manufacturing, 
          technology, and skilled trades.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="relative grid md:grid-cols-3 gap-6 mb-16">
        <FeatureCard
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          title="AI Skills Translation"
          description="Advanced AI analyzes your military experience and converts it to civilian terminology that employers understand."
          delay={0}
        />
        <FeatureCard
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          title="Career Matching"
          description="Find careers that match your skills, prioritizing American manufacturing, tech, and high-growth industries."
          delay={150}
        />
        <FeatureCard
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title="Resume Generation"
          description="Generate a professional civilian resume tailored to your target career in seconds."
          delay={300}
        />
      </div>

      {/* Call to Action */}
      <div className="relative card max-w-lg mx-auto overflow-hidden hover-lift animate-scale-in" style={{ animationDelay: '0.6s' }}>
        {/* Animated border gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-flag-red/20 via-transparent to-flag-blue/20 animate-gradient rounded-2xl" />
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ animationDuration: '3s' }} />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-flag-red/10 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-flag-blue/15 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="relative">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to Start Your Mission?
        </h2>
          <p className="text-navy-300 mb-6">
            Join thousands of veterans who have successfully transitioned to rewarding civilian careers.
        </p>
        <button
          onClick={onGetStarted}
            className="btn-primary text-lg px-10 py-4 w-full sm:w-auto group ripple animate-pulse-glow"
        >
            <span className="flex items-center justify-center gap-2">
          Get Started
              <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
        </button>
        </div>
      </div>

      {/* Stats */}
      <div className="relative mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
        <AnimatedStat number="17.5M" label="U.S. Veterans" source="DOL 2024" delay={0} />
        <AnimatedStat number="3.0%" label="Vet Unemployment" source="DOL 2024" delay={100} />
        <AnimatedStat number="100%" label="U.S.-Based AI" highlight delay={200} />
        <AnimatedStat number="$55K+" label="Median First-Year Salary" source="Census Bureau" delay={300} />
      </div>

      {/* Trust Indicators */}
      <div className="relative mt-16 pt-8 border-t border-navy-800/50">
        <p className="text-navy-400 text-sm mb-4 animate-fade-in" style={{ animationDelay: '1s' }}>Built to support the American workforce</p>
        <div className="flex flex-wrap justify-center items-center gap-8 text-navy-500">
          <TrustBadge 
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
            text="Secure & Private"
            delay={0}
          />
          <TrustBadge 
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            }
            text="Veteran-Focused"
            delay={100}
          />
          <TrustBadge 
            icon={<span className="text-base">🇺🇸</span>}
            text="American Technology"
            delay={200}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay = 0 }) {
  return (
    <div 
      className="card text-left hover:border-flag-red/30 hover:-translate-y-2 transition-all duration-500 group animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-flag-red/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-flag-blue/20 to-flag-red/10 rounded-xl flex items-center justify-center mb-4 text-flag-red group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
        {icon}
          </div>
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-flag-red transition-colors duration-300">{title}</h3>
          <p className="text-navy-300 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function AnimatedStat({ number, label, highlight = false, source = null, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay + 600);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className={`text-3xl md:text-4xl font-bold ${highlight ? 'text-flag-red' : 'text-white'} transition-all duration-300 hover:scale-110`}>
        {number}
      </div>
      <div className="text-sm text-navy-400 mt-1">{label}</div>
      {source && (
        <div className="text-xs text-navy-600 mt-0.5">{source}</div>
      )}
    </div>
  );
}

function TrustBadge({ icon, text, delay = 0 }) {
  return (
    <div 
      className="flex items-center gap-2 animate-fade-in hover:text-navy-300 transition-colors cursor-default"
      style={{ animationDelay: `${1000 + delay}ms` }}
    >
      {icon}
      <span className="text-sm">{text}</span>
    </div>
  );
}

export default Welcome;
