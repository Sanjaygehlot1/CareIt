import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms';
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, defaultTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(defaultTab);


  useEffect(() => {
    if (isOpen) setActiveTab(defaultTab);
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-2xl max-h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-primary)' }}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('terms')}
              className={`text-lg sm:text-xl font-bold ${activeTab === 'terms' ? 'opacity-100' : 'opacity-40 hover:opacity-70'} transition-opacity`}
              style={{ color: 'var(--text-primary)' }}
            >
              Terms of Service
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`text-lg sm:text-xl font-bold ${activeTab === 'privacy' ? 'opacity-100' : 'opacity-40 hover:opacity-70'} transition-opacity`}
              style={{ color: 'var(--text-primary)' }}
            >
              Privacy Policy
            </button>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {activeTab === 'terms' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>1. Acceptance of Terms</h3>
              <p>By accessing and using CareIt, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.</p>
              
              <h3 className="text-lg font-bold mt-6" style={{ color: 'var(--text-primary)' }}>2. User Responsibilities</h3>
              <p>You must provide accurate information when creating an account. You are responsible for all activities that occur under your account.</p>
              
              <h3 className="text-lg font-bold mt-6" style={{ color: 'var(--text-primary)' }}>3. API & External Services</h3>
              <p>CareIt connects to third-party services like GitHub. We do not control these services and our terms do not substitute theirs. CareIt assumes no liability for downtime or API changes affecting integrations.</p>
              
              <h3 className="text-lg font-bold mt-6" style={{ color: 'var(--text-primary)' }}>4. Termination</h3>
              <p>We reserve the right to suspend or terminate accounts that breach these terms or abuse system resources.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>1. Data Collection</h3>
              <p>We collect information such as your email, coding durations, and GitHub commit metadata (only if you connect GitHub) to accurately track your Developer health and streaks.</p>
              
              <h3 className="text-lg font-bold mt-6" style={{ color: 'var(--text-primary)' }}>2. Use of Data</h3>
              <p>Your data is exclusively used to generate personalized analytics, break reminders, and AI-driven coaching goals. We do NOT sell your data to third parties.</p>
              
              <h3 className="text-lg font-bold mt-6" style={{ color: 'var(--text-primary)' }}>3. Data Security</h3>
              <p>We employ industry standard security to protect your database entries. Your OAuth tokens are stored securely and never exposed.</p>
              
              <h3 className="text-lg font-bold mt-6" style={{ color: 'var(--text-primary)' }}>4. Account Deletion</h3>
              <p>You have the right to delete your account at any time through the "Settings" page. Doing so will permanently wipe all your tracking history and associated tokens from our database.</p>
            </div>
          )}
        </div>
        
        <div className="p-4 sm:p-6 border-t flex justify-end" style={{ borderColor: 'var(--border-primary)' }}>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
