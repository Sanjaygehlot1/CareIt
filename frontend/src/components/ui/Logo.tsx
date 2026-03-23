import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = () => {
  return (
    <div className="mt-1 mb-2 flex items-center gap-3">
      <img src="/logo.svg" alt="CareIt Logo" className="w-10 h-auto drop-shadow-md" />
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
