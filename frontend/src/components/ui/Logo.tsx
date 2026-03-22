import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 48 }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md"
      >
        <defs>
          <linearGradient id="careit-orange-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="careit-glass-gradient" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Premium Rounded Square Container */}
        <rect width="100" height="100" rx="28" fill="url(#careit-orange-gradient)" />
        
        {/* Inner SVG elements: the "< 3" Care/It metaphor */}
        {/* Left 'code bracket' < */}
        <path 
          d="M 40 32 L 20 50 L 40 68" 
          stroke="white" 
          strokeWidth="11" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Right 'three' 3, completing the <3 heart and the code syntax look */}
        <path 
          d="M 52 32 C 72 32, 78 38, 78 43 C 78 48, 72 50, 60 50 C 72 50, 78 52, 78 57 C 78 62, 72 68, 52 68" 
          fill="none" 
          stroke="white" 
          strokeWidth="11" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
      <div className="flex flex-col">
        <span className="text-xl font-black tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
          CareIt
        </span>
        <span className="text-[10px] font-bold tracking-widest uppercase opacity-60" style={{ color: 'var(--text-secondary)' }}>
          Developer Wellbeing
        </span>
      </div>
    </div>
  );
};
