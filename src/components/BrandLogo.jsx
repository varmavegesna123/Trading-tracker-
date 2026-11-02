import React from 'react';

export function BrandLogo({ className = "w-5 h-5 text-white" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top Bar of 'T' */}
      <path 
        d="M3.5 5.5C3.5 4.67157 4.17157 4 5 4H19C19.8284 4 20.5 4.67157 20.5 5.5C20.5 6.32843 19.8284 7 19 7H5C4.17157 7 3.5 6.32843 3.5 5.5Z" 
        fill="currentColor" 
      />
      {/* Vertical Stem of 'T' */}
      <path 
        d="M10 7H14V18.5C14 19.3284 13.3284 20 12.5 20H11.5C10.6716 20 10 19.3284 10 18.5V7Z" 
        fill="currentColor" 
      />
      {/* Upward Trend Accent */}
      <circle cx="18" cy="11.5" r="1.5" fill="currentColor" opacity="0.9" />
      <path d="M15 14.5L18 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

export default BrandLogo;
