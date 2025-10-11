import React, { useEffect, useState } from 'react';
import { Mail, Trash2, AlertTriangle, MessageSquarePlus, Github, Calendar, HeartPulse, X, CheckCircle, AlertCircle } from 'lucide-react';
import { getAuth } from '../context/authContext';
import { useSearchParams } from 'react-router-dom';
import { BACKEND_BASE_URL } from '../utils/secrets'; 
import Modal from '../components/settings/Modal';

const SettingsPage: React.FC = () => {
  const { user } = getAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showNotification, setShowNotification] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const status = searchParams.get('status');
  const error = searchParams.get('error');
  const message = searchParams.get('message');
  const googleEmail = searchParams.get('google_email');

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

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 relative">
      <div className="max-w-3xl mx-auto space-y-8">

        {showNotification && status === 'calendar-connected' && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm animate-slide-in-top">
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
          <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg shadow-lg animate-slide-in-top">
            <div className="flex items-start">
              <AlertCircle className="text-red-500 mt-1" size={24} />
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-red-800">Google Account Already Registered</h3>
                  <button onClick={handleCloseNotification} className="text-red-500 hover:text-red-700"><X size={20} /></button>
                </div>
                <p className="text-sm text-red-700 mb-4">The Google account <strong>{googleEmail}</strong> is already associated with another user.</p>
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-800 mb-2">What you can do:</p>
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
  <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg shadow-lg animate-slide-in-top">
    <div className="flex items-start">
      <AlertCircle className="text-red-500 mt-1" size={24} />
      <div className="ml-4 flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-red-800">
            GitHub Account in Use
          </h3>
          <button onClick={handleCloseNotification} className="text-red-500 hover:text-red-700"><X size={20} /></button>
        </div>

        <p className="text-sm text-red-700 mb-4">
          {message || 'This GitHub account is already connected to another user in our system.'}
        </p>

        <div className="bg-white rounded-lg p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-800 mb-2">To connect a different account:</p>
          
          <div className="text-sm text-gray-700 space-y-4">
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

        {/* --- PROFILE SETTINGS --- */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile Settings</h1>
          <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-6">
            <img className="h-20 w-20 rounded-full" src={user?.profileUrl} alt="User Avatar" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
              <p className={user.email ? "text-orange-500 flex items-center gap-2 mt-1" : "text-gray-500 flex items-center gap-2 mt-1"}><Mail size={16} /> {user?.email || "google login required"}</p>
              <p className={user.githubUsername ? "text-orange-500 flex items-center gap-2 mt-1" : "text-gray-500 flex items-center gap-2 mt-1"}><Github size={16} /> {user?.githubUsername || "github login required"}</p>
              <p className="text-xs text-gray-400 mt-1">Logged in via: <span className="font-semibold capitalize">{user?.provider}</span></p>
            </div>
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">Edit Profile</button>
          </div>
        </div>

        {/* --- INTEGRATIONS --- */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Integrations</h1>
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-5">
            {/* GitHub Integration */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Github size={28} className="text-gray-800" />
                <div>
                  <h3 className="font-semibold text-gray-900">GitHub</h3>
                  <p className="text-sm text-gray-500">Sync your commit and repository activity.</p>
                </div>
              </div>
              {user?.provider === 'github' ? (
                <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold" disabled>Connected</button>
              ) : (
                <button onClick={() => window.location.href = `${BACKEND_BASE_URL}/auth/github/connect`} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">Connect</button>
              )}
            </div>
            <hr />
            {/* Google Calendar Integration */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar size={28} className="text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Google Calendar</h3>
                  <p className="text-sm text-gray-500">Sync your events and meeting schedules.</p>
                </div>
              </div>
              {user?.calendar ? (
                <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold" disabled>Connected</button>
              ) : (
                <button onClick={handleConnectCalendar} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">Connect</button>
              )}
            </div>
            <hr />
            {/* Health Data Integration */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <HeartPulse size={28} className="text-red-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Health Data (Google Fit)</h3>
                  <p className="text-sm text-gray-500">Sync your daily steps, sleep, and activity.</p>
                </div>
              </div>
              <button className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm font-semibold cursor-not-allowed" disabled>Coming Soon</button>
            </div>
          </div>
        </div>

        {/* --- DANGER ZONE --- */}
        <div>
          <h1 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2"><AlertTriangle size={24} /> Danger Zone</h1>
          <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-red-500 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Delete Your Account</h3>
              <p className="text-sm text-gray-500">Permanently delete your account and all data. This action cannot be undone.</p>
            </div>
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"><Trash2 size={16} /> Delete My Account</button>
          </div>
        </div>
      </div>

      {/* --- FEEDBACK BUTTON & MODAL --- */}
      <button className="fixed bottom-6 right-6 bg-orange-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition-all transform hover:scale-110" aria-label="Give Feedback">
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
      `}</style>
    </div>
  );
};

export default SettingsPage;