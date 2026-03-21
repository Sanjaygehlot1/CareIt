import React from 'react';
import { Heart, Github, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="w-full pb-10 px-25 " 
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
    >
             
        <hr className="mb-10 opacity-30" style={{ borderColor: 'var(--border-primary)' }} />
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
          <div className="flex items-center gap-1.5 font-medium">
            © {currentYear} <span style={{ color: 'var(--text-primary)' }}>CareIt Technologies Inc.</span> All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 opacity-80">
            Made with <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" /> for the dev community.
          </div>
        </div>
    
    </footer>
  );
};

export default Footer;
