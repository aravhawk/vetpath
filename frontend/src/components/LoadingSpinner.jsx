import React from 'react';

function LoadingSpinner({ size = 'medium' }) {
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex justify-center">
      <div
        className={`${sizeClasses[size]} border-4 border-navy-200 border-t-flag-blue rounded-full animate-spin`}
      />
    </div>
  );
}

export default LoadingSpinner;
