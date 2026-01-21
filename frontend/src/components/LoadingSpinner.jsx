import React from 'react';

function LoadingSpinner({ size = 'medium', text = null }) {
  const sizeConfig = {
    small: { spinner: 'w-5 h-5', border: 'border-2', orbit: 'w-8 h-8' },
    medium: { spinner: 'w-10 h-10', border: 'border-3', orbit: 'w-16 h-16' },
    large: { spinner: 'w-16 h-16', border: 'border-4', orbit: 'w-24 h-24' },
  };

  const config = sizeConfig[size];

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer glow */}
        <div className={`absolute inset-0 ${size === 'large' ? 'blur-xl' : 'blur-md'} bg-flag-red/20 rounded-full animate-pulse`} />
        
        {/* Orbiting dots */}
        <div className={`absolute ${config.orbit} animate-spin-slow`} style={{ animationDuration: '3s' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-flag-red rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-flag-blue rounded-full opacity-60" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full opacity-40" />
        </div>

        {/* Main spinner */}
        <div className={`relative ${config.spinner}`}>
          {/* Track */}
          <div className={`absolute inset-0 ${config.border} border-navy-700/50 rounded-full`} />
          
          {/* Spinning gradient */}
          <div 
            className={`absolute inset-0 ${config.border} border-transparent border-t-flag-red border-r-flag-red/50 rounded-full animate-spin`}
            style={{ animationDuration: '0.8s' }}
          />
          
          {/* Inner glow */}
          <div className="absolute inset-2 bg-gradient-to-br from-flag-red/10 to-transparent rounded-full" />
        </div>

        {/* Center star (only for large) */}
        {size === 'large' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-6 h-6 text-flag-red/50 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        )}
      </div>

      {text && (
        <p className="text-navy-300 text-sm animate-pulse">{text}</p>
      )}
    </div>
  );
}

export default LoadingSpinner;
