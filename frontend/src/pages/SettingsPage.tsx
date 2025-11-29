import React, { useEffect, useState } from 'react';
import { Mail, Trash2, AlertTriangle, MessageSquarePlus, Github, Calendar, HeartPulse, X, CheckCircle, AlertCircle, Key, Copy, RefreshCw, ExternalLink } from 'lucide-react';
import { getAuth } from '../context/authContext';
import { useSearchParams } from 'react-router-dom';
import { BACKEND_BASE_URL } from '../utils/secrets';
import Modal from '../components/settings/Modal';
import { generateApiKey, getApiKey } from '../controllers/apiKey';

const SettingsPage: React.FC = () => {
  const { user } = getAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showNotification, setShowNotification] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [apiKey, setApiKey] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const status = searchParams.get('status');
  const error = searchParams.get('error');
  const message = searchParams.get('message');
  const googleEmail = searchParams.get('google_email');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const data = await getApiKey();
        if (data.data.apiKey) {
          setApiKey(data.data.apiKey)
        };

      } catch (err) {
        console.error('Failed to fetch API key', err);
      }
    };
    fetchApiKey();
  }, []);

  useEffect(() => {
    if (status || error) {
      setShowNotification(true);
      if (status === 'calendar-connected') {
        const timer = setTimeout(() => {
          handleCloseNotification();
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [status, error]);

  const handleCloseNotification = () => {
    setShowNotification(false);
    setTimeout(() => {
      setSearchParams({});
    }, 300);
  };

  const handleConnectCalendar = () => {
    if (user?.provider === 'google') {
      window.location.href = `${BACKEND_BASE_URL}/auth/google/connect-calendar`;
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmConnect = () => {
    window.location.href = `${BACKEND_BASE_URL}/auth/google/connect-calendar`;
    setIsModalOpen(false);
  };

  const handleRetryWithDifferentAccountGoogle = () => {
    window.location.href = `${BACKEND_BASE_URL}/auth/google/connect-calendar`;
  };

  const handleSwitchToGoogleAccount = async () => {
    const confirmed = window.confirm(
      `You will be logged out and redirected to sign in with your Google account (${googleEmail}). Continue?`
    );
    if (confirmed) {
      try {
        await fetch(`${BACKEND_BASE_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });
        window.location.href = `${BACKEND_BASE_URL}/auth/google/login`;
      } catch (err) {
        console.error('Logout failed:', err);
        alert('Failed to log out. Please try again.');
      }
    }
  };

  const handleGenerateKey = async () => {
    if (window.confirm("Generating a new key will invalidate the old one. Any connected extensions will need to be updated. Continue?")) {
      try {

        const data = await generateApiKey();
        if (data.data.apiKey) {
          setApiKey(data.data.apiKey);
          showToast(data.message);
        }
      } catch (e) {
        console.error("Failed to generate key", e);
        showToast("Failed to generate key.", 'error');
      }
    }
  };

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      showToast("API Key copied to clipboard!");
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)' }} className="min-h-screen p-4 sm:p-6 lg:p-8 relative">
      <div className="max-w-3xl mx-auto space-y-8">

        {toast && (
          <div className="fixed bottom-2 right-6 z-50 animate-slide-up">
            <div className={`flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg text-white ${toast.type === 'error' ? 'bg-red-600' : 'bg-black'
              }`}>
              {toast.type === 'success' ? (
                <CheckCircle size={20} className="text-green-400" />
              ) : (
                <AlertCircle size={20} className="text-white" />
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        )}

        {showNotification && status === 'calendar-connected' && (
          <div className="border-l-4 border-green-500 p-4 rounded-lg shadow-sm animate-slide-in-top" style={{ backgroundColor: 'var(--card-bg)' }}>
            <div className="flex items-start">
              <CheckCircle className="text-green-500 mt-0.5" size={20} />
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-green-800">Calendar Connected!</h3>
                <p className="text-sm text-green-700 mt-1">Your Google Calendar is now synced.</p>
              </div>
              <button onClick={handleCloseNotification} className="text-green-500 hover:text-green-700"><X size={18} /></button>
            </div>
          </div>
        )}

        {showNotification && error === 'google_conflict' && (
          <div className="border-l-4 border-red-500 p-5 rounded-lg shadow-lg animate-slide-in-top" style={{ backgroundColor: 'var(--card-bg)' }}>
            <div className="flex items-start">
              <AlertCircle className="text-red-500 mt-1" size={24} />
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-red-800">Google Account Already Registered</h3>
                  <button onClick={handleCloseNotification} className="text-red-500 hover:text-red-700"><X size={20} /></button>
                </div>
                <p className="text-sm text-red-700 mb-4">The Google account <strong>{googleEmail}</strong> is already associated with another user.</p>
                <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>What you can do:</p>
                  <button onClick={handleRetryWithDifferentAccountGoogle} className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors">
                    <p className="font-semibold text-gray-900 text-sm">Use a Different Google Account</p>
                  </button>
                  <button onClick={handleSwitchToGoogleAccount} className="w-full text-left px-4 py-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors">
                    <p className="font-semibold text-gray-900 text-sm">Switch to Google Account ({googleEmail})</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showNotification && error === 'github_conflict' && (
          <div className="border-l-4 border-red-500 p-5 rounded-lg shadow-lg animate-slide-in-top" style={{ backgroundColor: 'var(--card-bg)' }}>
            <div className="flex items-start">
              <AlertCircle className="text-red-500 mt-1" size={24} />
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-red-800">GitHub Account in Use</h3>
                  <button onClick={handleCloseNotification} className="text-red-500 hover:text-red-700"><X size={20} /></button>
                </div>

                <p className="text-sm text-red-700 mb-4">
                  {message || 'This GitHub account is already connected to another user in our system.'}
                </p>

                <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>To connect a different account:</p>

                  <div className="text-sm space-y-4" style={{ color: 'var(--text-secondary)' }}>
                    <ol className="list-decimal list-inside space-y-2 pl-2">
                      <li>
                        Open a new browser tab and go to{' '}
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                          github.com
                        </a>.
                      </li>
                      <li>
                        Click your profile picture (top-right), then select <strong>"Sign out"</strong>.
                      </li>
                      <li>
                        Return to this page and click the button below.
                      </li>
                    </ol>
                  </div>

                  <button
                    onClick={handleRetryWithDifferentAccountGoogle}
                    className="w-full mt-2 px-4 py-3 bg-gray-800 text-white font-semibold hover:bg-black rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Github size={16} />
                    Try Connecting Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Profile Settings</h1>
          <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }} className="p-6 rounded-xl shadow-card border flex items-center space-x-6">
            <img className="h-20 w-20 rounded-full" src={user?.profileUrl} alt="User Avatar" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</h2>
              <p className={user.email ? "flex items-center gap-2 mt-1" : "flex items-center gap-2 mt-1"} style={{ color: user.email ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                <Mail size={16} /> {user?.email || "google login required"}
              </p>
              <p className={user.githubUsername ? "flex items-center gap-2 mt-1" : "flex items-center gap-2 mt-1"} style={{ color: user.githubUsername ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                <Github size={16} /> {user?.githubUsername || "github login required"}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Logged in via: <span className="font-semibold capitalize">{user?.provider}</span>
              </p>
            </div>
            <button style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }} className="border px-4 py-2 rounded-lg text-sm font-semibold hover:bg-hover-bg transition-colors">
              Edit Profile
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Integrations</h1>
          <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }} className="p-6 rounded-xl shadow-card border space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Github size={28} style={{ color: 'var(--text-primary)' }} />
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>GitHub</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sync your commit and repository activity.</p>
                </div>
              </div>
              {user?.githubUsername ? (
                <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold" disabled>Connected</button>
              ) : (
                <button onClick={() => window.location.href = `${BACKEND_BASE_URL}/auth/github/connect`} style={{ backgroundColor: 'var(--accent-primary)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }} className="border px-4 py-2 hover:opacity-90 rounded-lg text-sm font-semibold hover:bg-hover-bg cursor-pointer transition-colors">
                  Connect
                </button>
              )}
            </div>
            <hr style={{ borderColor: 'var(--border-primary)' }} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar size={28} className="text-blue-600" />
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Google Calendar</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sync your events and meeting schedules.</p>
                </div>
              </div>
              {user?.calendar ? (
                <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold" disabled>Connected</button>
              ) : (
                <button onClick={handleConnectCalendar} style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }} className="border px-4 py-2 rounded-lg text-sm font-semibold hover:bg-hover-bg transition-colors">
                  Connect
                </button>
              )}
            </div>
            <hr style={{ borderColor: 'var(--border-primary)' }} />
            {/* Health Data Integration */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <HeartPulse size={28} className="text-red-500" />
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Health Data (Google Fit)</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sync your daily steps, sleep, and activity.</p>
                </div>
              </div>
              <button style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }} className="px-4 py-2 rounded-lg text-sm font-semibold cursor-not-allowed" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Developer Settings</h1>
          <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }} className="p-6 rounded-xl shadow-card border space-y-5">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-primary)' }}>
                  <Key size={24} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>VS Code Extension Key</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Use this key to track your coding activity in VS Code.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 p-3 rounded-lg font-mono text-sm truncate border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                {apiKey || "No API Key generated yet"}
              </div>

              <button
                onClick={copyToClipboard}
                disabled={!apiKey}
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                className="p-3 border rounded-lg hover:bg-hover-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copy Key"
              >
                <Copy size={20} />
              </button>

              <button
                onClick={handleGenerateKey}
                style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-colors"
              >
                <RefreshCw size={16} />
                {apiKey ? "Regenerate" : "Generate Key"}
              </button>
            </div>

            <hr className="my-6 border-t" style={{ borderColor: 'var(--border-primary)' }} />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                  <Github size={24} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Install GitHub App</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Install the app on your repositories to enable webhook tracking.
                  </p>
                </div>
              </div>

              <a
                href={'https://github.com/settings/apps/careit-tracker/installations'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-semibold hover:bg-hover-bg transition-colors"
              >
                Install App
                <ExternalLink size={14} />
              </a>
            </div>

          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
            <AlertTriangle size={24} /> Danger Zone
          </h1>
          <div style={{ backgroundColor: 'var(--card-bg)' }} className="p-6 rounded-xl shadow-card border-2 border-red-500 flex items-center justify-between">
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Delete Your Account</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Permanently delete your account and all data. This action cannot be undone.</p>
            </div>
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors flex items-center gap-2">
              <Trash2 size={16} /> Delete My Account
            </button>
          </div>
        </div>
      </div>

      <button style={{ backgroundColor: 'var(--accent-primary)' }} className="fixed bottom-6 right-6 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-all transform hover:scale-110" aria-label="Give Feedback">
        <MessageSquarePlus size={24} />
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmConnect}
        title="Connect Google Calendar"
      >
        You will be asked to select a Google account for calendar access. Make sure to select an account that is not already registered to avoid conflicts.
      </Modal>

      <style>{`
        @keyframes slide-in-top {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-top { animation: slide-in-top 0.3s ease-out; }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default SettingsPage;