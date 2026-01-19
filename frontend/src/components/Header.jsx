import React from 'react';

function Header({ onLogoClick }) {
  return (
    <header className="bg-flag-blue text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onLogoClick}
            className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-8 h-8"
              >
                <path
                  d="M25 35 L50 20 L75 35 L75 70 L50 85 L25 70 Z"
                  fill="#3C3B6E"
                  stroke="#B22234"
                  strokeWidth="4"
                />
                <path d="M50 30 L50 75" stroke="#B22234" strokeWidth="4" />
                <path d="M35 45 L65 45" stroke="#B22234" strokeWidth="4" />
                <circle cx="50" cy="45" r="6" fill="#B22234" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">VetPath</h1>
              <p className="text-xs text-blue-200 -mt-1">Your Bridge to Civilian Success</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#about"
              className="text-blue-100 hover:text-white transition-colors text-sm"
            >
              About
            </a>
            <a
              href="#resources"
              className="text-blue-100 hover:text-white transition-colors text-sm"
            >
              Resources
            </a>
            <a
              href="#contact"
              className="text-blue-100 hover:text-white transition-colors text-sm"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
