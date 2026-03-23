import React, { useEffect, useState } from 'react';
import { Mail, Trash2, AlertTriangle, MessageSquarePlus, Github, Calendar, HeartPulse, X, CheckCircle, AlertCircle, Key, Copy, RefreshCw, ExternalLink } from 'lucide-react';
import { getAuth } from '../context/authContext';
import { useSearchParams } from 'react-router-dom';
import { BACKEND_BASE_URL } from '../utils/secrets';
import Modal from '../components/settings/Modal';
import { generateApiKey, getApiKey } from '../controllers/apiKey';
import { AxiosInstance } from '../axios/axiosInstance';

const SettingsPage: React.FC = () => {
  const { user } = getAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showNotification, setShowNotification] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(true);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await AxiosInstance.delete('/auth/account');
      window.location.href = '/';
    } catch (err) {
      console.error('Failed to delete account', err);
      showToast('Could not delete account. Please try again.', 'error');
      setIsDeleting(false);
    }
  };

  const [digestEnabled, setDigestEnabled] = useState<boolean>(
    (user as any)?.dailyDigestEnabled ?? true
  );

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const status = searchParams.get('status');
  const error = searchParams.get('error');
  const message = searchParams.get('message');
  const googleEmail = searchParams.get('google_email');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => { setToast(null); }, 3000);
  };

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const data = await getApiKey();
        if (data.data.apiKey) setApiKey(data.data.apiKey);
      } catch (err) {
        console.error('Failed to fetch API key', err);
      } finally {
        setApiKeyLoading(false);
      }
    };
    fetchApiKey();
  }, []);


  const handleCloseNotification = () => {
    setShowNotification(false);
    setTimeout(() => { setSearchParams({}); }, 300);
  };

  useEffect(() => {
    if (status || error) {
      setShowNotification(true);
      if (status === 'calendar-connected') {
        const timer = setTimeout(() => { handleCloseNotification(); }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [status, error]);

  if (!user || apiKeyLoading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-secondary)' }} className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-8 pb-24">


          <div>
            <div className="skeleton h-7 w-40 mb-4 rounded-lg" />
            <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              className="p-6 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center gap-5">

              <div className="skeleton w-20 h-20 rounded-full flex-shrink-0" />

              <div className="flex-1 flex flex-col gap-2.5 w-full">
                <div className="skeleton h-5 w-36" />
                <div className="skeleton h-4 w-52" />
                <div className="skeleton h-4 w-40" />
                <div className="skeleton h-3 w-28" />
              </div>

              <div className="skeleton h-9 w-24 rounded-lg flex-shrink-0" />
            </div>
          </div>


          <div>
            <div className="skeleton h-7 w-32 mb-4 rounded-lg" />
            <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              className="p-6 rounded-xl border space-y-5">
              {[
                { iconW: 28, labelW: 80, descW: 200 },
                { iconW: 28, labelW: 120, descW: 220 },
                { iconW: 28, labelW: 160, descW: 190 },
              ].map((row, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="skeleton flex-shrink-0 rounded" style={{ width: row.iconW, height: row.iconW }} />
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <div className="skeleton h-4 rounded" style={{ width: row.labelW }} />
                        <div className="skeleton h-3 rounded" style={{ width: row.descW, maxWidth: '100%' }} />
                      </div>
                    </div>
                    <div className="skeleton h-9 w-24 rounded-lg flex-shrink-0" />
                  </div>
                  {i < 2 && <hr style={{ borderColor: 'var(--border-primary)' }} />}
                </React.Fragment>
              ))}
            </div>
          </div>


          <div>
            <div className="skeleton h-7 w-48 mb-4 rounded-lg" />
            <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              className="p-6 rounded-xl border space-y-5">

              <div className="flex items-center gap-4">
                <div className="skeleton w-10 h-10 rounded-lg flex-shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="skeleton h-4 w-44" />
                  <div className="skeleton h-3 w-64 max-w-full" />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="skeleton h-11 flex-1 rounded-lg min-w-0" />
                <div className="skeleton h-11 w-11 rounded-lg flex-shrink-0" />
                <div className="skeleton h-11 w-36 rounded-lg flex-shrink-0" />
              </div>
              <hr style={{ borderColor: 'var(--border-primary)' }} />

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="skeleton w-10 h-10 rounded-lg flex-shrink-0" />
                  <div className="flex flex-col gap-1.5">
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-3 w-56 max-w-full" />
                  </div>
                </div>
                <div className="skeleton h-9 w-28 rounded-lg flex-shrink-0" />
              </div>
            </div>
          </div>


          <div>
            <div className="skeleton h-7 w-56 mb-4 rounded-lg" />
            <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              className="p-6 rounded-xl border space-y-5">

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="skeleton w-10 h-10 rounded-lg flex-shrink-0" />
                  <div className="flex flex-col gap-1.5">
                    <div className="skeleton h-4 w-36" />
                    <div className="skeleton h-3 w-60 max-w-full" />
                  </div>
                </div>
                <div className="skeleton w-11 h-6 rounded-full flex-shrink-0" />
              </div>

              <div className="flex items-start gap-4">
                <div className="skeleton w-10 h-10 rounded-lg flex-shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="skeleton h-4 w-28" />
                  <div className="skeleton h-3 w-36" />
                  <div className="skeleton h-3 w-52 max-w-full" />
                  <div className="skeleton h-1.5 w-40 rounded-full" />
                </div>
              </div>
            </div>
          </div>


          <div>
            <div className="skeleton h-7 w-36 mb-4 rounded-lg" />
            <div style={{ backgroundColor: 'var(--card-bg)' }}
              className="p-6 rounded-xl border-2 border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <div className="skeleton h-4 w-40" />
                <div className="skeleton h-3 w-72 max-w-full" />
              </div>
              <div className="skeleton h-9 w-36 rounded-lg flex-shrink-0" />
            </div>
          </div>

        </div>
      </div>
    );
  }

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

  const toggleDailyDigest = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;

    setDigestEnabled(newValue);
    try {

      await AxiosInstance.patch('/auth/preferences', { dailyDigestEnabled: newValue });
      showToast(newValue ? 'Daily digest enabled ✓' : 'Daily digest disabled');
    } catch {

      setDigestEnabled(!newValue);
      showToast('Failed to update preference', 'error');
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
          <div className="rounded-2xl shadow-2xl border-2 animate-slide-in-top overflow-hidden" 
               style={{ backgroundColor: 'var(--card-bg)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <div className="bg-red-500/10 p-4 border-b flex items-center gap-3" style={{ borderColor: 'rgba(239, 68, 68, 0.1)' }}>
              <div className="bg-red-500 p-2 rounded-lg text-white">
                <Github size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-red-600">GitHub Connection Conflict</h3>
                <p className="text-[11px] font-medium opacity-70 uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Action Required</p>
              </div>
              <button onClick={handleCloseNotification} className="p-2 hover:bg-black/5 rounded-full transition-colors" style={{ color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm font-medium mb-6 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {message || 'This GitHub profile is already linked to another CareIt account. To connect it here, you first need to switch accounts on GitHub.'}
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-500/20">1</div>
                    <div className="w-px h-full bg-border-primary my-1"></div>
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Sign out of GitHub</p>
                    <p className="text-xs opacity-70 mb-2" style={{ color: 'var(--text-secondary)' }}>Go to your GitHub profile and select "Sign out".</p>
                    <a href="https://github.com/logout" target="_blank" rel="noopener noreferrer" 
                       className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:underline">
                      Logout Now <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center text-xs font-bold border border-purple-500/20">2</div>
                  </div>
                  <div>
                    <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Reconnect Account</p>
                    <p className="text-xs opacity-70" style={{ color: 'var(--text-secondary)' }}>Sign in with the correct GitHub account to finish the sync.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => window.location.href = `${BACKEND_BASE_URL}/auth/github/connect`}
                  className="w-full py-3.5 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
                  style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                >
                  <Github size={18} />
                  Try Connecting Again
                </button>
              </div>
            </div>
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Profile Settings</h1>
          <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }} className="p-6 rounded-xl shadow-card border flex items-center space-x-6">
            {user?.profileUrl ? (
              <img className="h-20 w-20 rounded-full object-cover border-2 shadow-sm" style={{ borderColor: 'var(--accent-primary)' }} src={user.profileUrl} alt="User Avatar" />
            ) : (
              <div className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
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
                <button onClick={handleConnectCalendar} style={{ backgroundColor: 'var(--accent-primary)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }} className="border px-4 py-2 hover:opacity-90 rounded-lg text-sm font-semibold hover:bg-hover-bg cursor-pointer transition-colors">
                  Connect
                </button>
              )}
            </div>
            <hr style={{ borderColor: 'var(--border-primary)' }} />
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
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Notifications &amp; Wellbeing</h1>
          <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }} className="p-6 rounded-xl shadow-card border space-y-5">


            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
                  <MessageSquarePlus size={22} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Daily Digest Email</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Get a 2-line AI summary of your day at 9 PM — stays in your memory.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={digestEnabled}
                  onChange={toggleDailyDigest}
                />
                <div
                  className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{ backgroundColor: digestEnabled ? 'var(--accent-primary)' : 'var(--border-secondary)' }}
                />
              </label>
            </div>

            <hr style={{ borderColor: 'var(--border-primary)' }} />


            {(() => {
              const level: string = (user as any)?.burnoutLevel ?? 'NONE';
              const score: number = (user as any)?.burnoutScore ?? 0;
              const burnoutCfg: Record<string, { label: string; desc: string; color: string; bg: string }> = {
                NONE: { label: '✅ Looking great', desc: 'Your coding activity is consistent with your baseline.', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
                MILD: { label: '😴 Mild dip detected', desc: 'Your pace is slightly below baseline. A gentle nudge email has been sent.', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
                MODERATE: { label: '⚠️ Moderate decline', desc: 'Noticeable drop in activity. We\'ve emailed you with suggestions.', color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
                SEVERE: { label: '🔴 Burnout risk', desc: 'Activity is significantly below your baseline. Please take care of yourself.', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
              };
              const cfg = burnoutCfg[level] ?? burnoutCfg['NONE'];
              return (
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                      <HeartPulse size={22} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Burnout Status</h3>
                      <p className="text-sm mt-0.5" style={{ color: cfg.color, fontWeight: 600 }}>{cfg.label}</p>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{cfg.desc}</p>
                    
                      {score > 0 && (
                        <div className="mt-2 w-48 max-w-full">
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Burnout index</span>
                            <span className="text-[10px] font-semibold" style={{ color: cfg.color }}>{score}/100</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: cfg.color }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1.5 rounded-full font-semibold flex-shrink-0" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                    Updated weekly
                  </span>
                </div>
              );
            })()}

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
                href={'https://github.com/apps/careit-tracker'}
                target="_blank"
                rel="noopener noreferrer"
                style={
                  user.githubAppConnected
                    ? { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }
                    : { backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }
                }
                className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${user.githubAppConnected ? 'hover:bg-red-50 dark:hover:bg-red-900/20' : 'hover:bg-hover-bg'
                  }`}
              >
                {user.githubAppConnected ? "Uninstall App" : "Install App"}
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
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} /> Delete My Account
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmConnect}
        title="Connect Google Calendar"
      >
        You will be asked to select a Google account for calendar access. Make sure to select an account that is not already registered to avoid conflicts.
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        loading={isDeleting}
        confirmText="Delete Account"
        confirmColor="#ef4444"
      >
        Are you absolutely sure you want to permanently delete your account? This action cannot be undone and you will lose all tracking history, streaks, and analytics forever.
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