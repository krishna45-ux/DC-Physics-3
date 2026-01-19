import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-10 w-auto" }) => {
  return (
    <svg
        viewBox="0 0 200 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="DC Physics Logo"
    >
        <defs>
            <linearGradient id="gradD" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4338ca" /> {/* Indigo-700 */}
                <stop offset="100%" stopColor="#7c3aed" /> {/* Violet-600 */}
            </linearGradient>
            <linearGradient id="gradC" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" /> {/* Amber-400 */}
                <stop offset="100%" stopColor="#d97706" /> {/* Amber-600 */}
            </linearGradient>
        </defs>

        {/* Letter D */}
        <path d="M40 25 L80 25 C110 25 125 45 125 75 C125 105 110 125 80 125 L40 125 L40 25 Z" fill="url(#gradD)" />

        {/* Letter C */}
        <path d="M180 45 C170 30 150 25 130 25 C100 25 85 45 85 75 C85 105 100 125 130 125 C150 125 170 120 180 105"
              stroke="url(#gradC)"
              strokeWidth="25"
              strokeLinecap="round"
              fill="none"
        />

        {/* Wave */}
        <path d="M30 75 Q 65 45 100 75 T 170 75"
              stroke="#fcd34d"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.3))"
        />
    </svg>
  );
};