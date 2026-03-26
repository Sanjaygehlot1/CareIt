import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import LegalModal from './LegalModal';
import { getAuth } from '../../context/authContext';
import { AxiosInstance } from '../../axios/axiosInstance';

let hasShownTermsModal = false;

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { user } = getAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'privacy' | 'terms'>('terms');

  useEffect(() => {
    if (user && user.hasAcceptedTerms === false && !hasShownTermsModal) {
      setIsModalOpen(true);
      hasShownTermsModal = true;
    }
  }, [user]);

  const handleAgree = async () => {
    if (user && user.hasAcceptedTerms === false) {
      try {
        await AxiosInstance.patch('/auth/preferences', { hasAcceptedTerms: true });
      } catch (e) {
      }
    }
  };

  const openModal = (tab: 'privacy' | 'terms') => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  return (
    <footer 
      className="w-full pb-10 px-4 sm:px-8" 
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
    >
             
        <hr className="mb-10 opacity-30" style={{ borderColor: 'var(--border-primary)' }} />
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-4 font-medium">
            <span>© {currentYear} <span style={{ color: 'var(--text-primary)' }}>CareIt Technologies Inc.</span> All rights reserved.</span>
            <div className="flex items-center gap-3">
              <button onClick={() => openModal('privacy')} className="hover:underline transition-all">Privacy Policy</button>
              <button onClick={() => openModal('terms')} className="hover:underline transition-all">Terms of Service</button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 opacity-80">
            Made with <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" /> for the dev community.
          </div>
        </div>
        
        <LegalModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onAgree={handleAgree}
          defaultTab={modalTab} 
        />
    
    </footer>
  );
};

export default Footer;
