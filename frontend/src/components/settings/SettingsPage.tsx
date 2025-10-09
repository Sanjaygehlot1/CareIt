import React from 'react';
import { Mail, Trash2, AlertTriangle, MessageSquarePlus, Github, Calendar, HeartPulse } from 'lucide-react';
import { getAuth } from '../../context/authContext';



const SettingsPage: React.FC = () => {

    const {user} = getAuth();

  return (
    
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">

        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile Settings</h1>
          <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-6">
            <img className="h-20 w-20 rounded-full" src={user?.profileUrl} alt="User Avatar" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 flex items-center gap-2 mt-1">
                <Mail size={16} /> {user?.email}
              </p>
            </div>
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
              Edit Profile
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Integrations</h1>
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Github size={28} className="text-gray-800" />
                <div>
                  <h3 className="font-semibold text-gray-900">GitHub</h3>
                  <p className="text-sm text-gray-500">Sync your commits and repository activity.</p>
                </div>
              </div>
              <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-200 transition-colors">
                Connected
              </button>
            </div>

            <hr/>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar size={28} className="text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Google Calendar</h3>
                  <p className="text-sm text-gray-500">Sync your events and meeting schedules.</p>
                </div>
              </div>
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                Connect
              </button>
            </div>

            <hr/>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <HeartPulse size={28} className="text-red-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Health Data (Google Fit)</h3>
                  <p className="text-sm text-gray-500">Sync your daily steps, sleep, and activity.</p>
                </div>
              </div>
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                Connect
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
            <AlertTriangle size={24}/> Danger Zone
          </h1>
          <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-red-500 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Delete Your Account</h3>
              <p className="text-sm text-gray-500">Permanently delete your account and all of your data. This action cannot be undone.</p>
            </div>
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors flex items-center gap-2">
              <Trash2 size={16} />
              Delete My Account
            </button>
          </div>
        </div>

      </div>

      <button 
        className="
          fixed bottom-6 right-6
          bg-orange-500 text-white
          w-14 h-14 rounded-full
          flex items-center justify-center
          shadow-lg hover:bg-orange-600 transition-all transform hover:scale-110
        "
        aria-label="Give Feedback"
      >
        <MessageSquarePlus size={24} />
      </button>

    </div>
  );
};

export default SettingsPage;