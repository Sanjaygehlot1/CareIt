import React, { useState, useRef, useEffect } from 'react';
import { MessageSquarePlus, X, Send, Heart, Bug, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { AxiosInstance } from '../../axios/axiosInstance';


const FeedbackButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<'bug' | 'feature' | 'other'>('other');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await AxiosInstance.post('/auth/feedback', { category, message: message.trim() });
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        setIsOpen(false);
        setMessage('');
      }, 3000);
    } catch (err) {
      console.error("Feedback failed:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
     
      <button
        onClick={() => setIsOpen(true)}
        style={{ backgroundColor: 'var(--accent-primary)' }}
        className="fixed bottom-6 right-6 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:opacity-90 transition-all transform hover:scale-110 z-40 active:scale-95 group"
        aria-label="Give Feedback"
      >
        <MessageSquarePlus size={24} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute right-full mr-3 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">
            Send Feedback
        </span>
      </button>

     
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-4 sm:p-10 pointer-events-none">
          <div 
            ref={modalRef}
            className="w-full max-w-md pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300 rounded-3xl overflow-hidden shadow-2xl border flex flex-col"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            {isSent ? (
              <div className="p-10 flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 animate-bounce">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Feedback Received!</h3>
                <p className="text-sm opacity-70" style={{ color: 'var(--text-secondary)' }}>
                    Your thoughts help us build the best version of CareIt. Thank you for being part of the journey!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
              
                <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-primary)' }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Share Feedback</h3>
                      <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest" style={{ color: 'var(--text-secondary)' }}>Help us improve</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    <X size={20} />
                  </button>
                </div>

           
                <div className="p-6 space-y-6">
                 
                  <div className="flex gap-2">
                    {[
                      { id: 'bug', icon: <Bug size={14} />, label: 'Bug' },
                      { id: 'feature', icon: <Sparkles size={14} />, label: 'Idea' },
                      { id: 'other', icon: <Heart size={14} />, label: 'Other' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCategory(item.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          category === item.id 
                            ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' 
                            : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5 opacity-60'
                        }`}
                        style={{ color: category === item.id ? 'var(--accent-primary)' : 'var(--text-primary)' }}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>

              
                  <div className="relative">
                    <textarea
                      required
                      placeholder="What's on your mind? Be as specific as you'd like..."
                      className="w-full h-40 p-4 rounded-2xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                      style={{ borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <div className="absolute bottom-3 right-4 text-[10px] font-bold opacity-30" style={{ color: 'var(--text-secondary)' }}>
                      {message.length} Characters
                    </div>
                  </div>
                </div>

            
                <div className="p-6 bg-black/5 dark:bg-white/5 flex gap-3">
                  <button
                    type="submit"
                    disabled={isSending || !message.trim()}
                    style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                    className="flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSending ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackButton;
