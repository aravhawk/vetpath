import React, { useState, useEffect } from 'react';

function Header({ onLogoClick }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-navy-950/95 backdrop-blur-xl shadow-lg shadow-black/20' 
        : 'bg-navy-950/80 backdrop-blur-lg'
    } border-b border-navy-800/50`}>
      {/* Animated accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-flag-blue via-flag-red to-flag-blue bg-[length:200%_100%] animate-gradient" />
      
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onLogoClick}
            className="flex items-center space-x-3 group"
          >
            {/* Logo */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-flag-red to-flag-red/80 rounded-xl flex items-center justify-center shadow-lg shadow-flag-red/20 group-hover:shadow-flag-red/40 group-hover:scale-105 transition-all duration-300">
                <svg viewBox="0 0 100 100" className="w-8 h-8 group-hover:rotate-6 transition-transform duration-300">
                  {/* Shield shape */}
                <path
                    d="M50 10 L85 25 L85 55 C85 75 50 95 50 95 C50 95 15 75 15 55 L15 25 Z"
                    fill="none"
                    stroke="white"
                  strokeWidth="4"
                />
                  {/* Star */}
                  <path
                    d="M50 25 L54 40 L70 40 L57 50 L62 65 L50 55 L38 65 L43 50 L30 40 L46 40 Z"
                    fill="white"
                    className="group-hover:fill-gold-400 transition-colors duration-300"
                  />
                  {/* Stripes at bottom */}
                  <path d="M25 60 L75 60" stroke="white" strokeWidth="3" />
                  <path d="M30 70 L70 70" stroke="white" strokeWidth="3" />
              </svg>
              </div>
              {/* Pulse ring on hover */}
              <div className="absolute inset-0 rounded-xl border-2 border-flag-red/50 scale-100 opacity-0 group-hover:scale-125 group-hover:opacity-100 transition-all duration-500" />
            </div>
            
            <div className="overflow-hidden">
              <h1 className="text-2xl font-bold tracking-tight text-white group-hover:translate-x-1 transition-transform duration-300">
                Vet<span className="text-flag-red">Path</span>
              </h1>
              <p className="text-xs text-navy-300 -mt-0.5 font-medium tracking-wide group-hover:text-navy-200 transition-colors">
                YOUR BRIDGE TO CIVILIAN SUCCESS
              </p>
            </div>
          </button>

          <div className="flex items-center gap-6">
            {/* American AI Badge */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-navy-800/50 rounded-full border border-navy-700/50 hover:border-navy-600/50 hover:bg-navy-700/50 transition-all duration-300 group/badge">
              <span className="text-sm group-hover/badge:animate-wiggle">🇺🇸</span>
              <span className="text-xs font-medium text-navy-200 group-hover/badge:text-white transition-colors">
                Built with U.S.-Based AI
              </span>
            </div>

            <nav className="hidden lg:flex items-center space-x-1">
              <NavLink href="#about">About</NavLink>
              <NavLink href="#resources">Resources</NavLink>
              <NavLink href="#contact">Contact</NavLink>
          </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      className="relative px-4 py-2 text-navy-300 hover:text-white transition-colors text-sm font-medium group"
    >
      {children}
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-flag-red group-hover:w-2/3 transition-all duration-300 rounded-full" />
    </a>
  );
}

export default Header;
