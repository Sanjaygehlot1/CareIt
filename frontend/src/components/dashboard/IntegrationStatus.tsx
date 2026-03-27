
import { Link, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import React from 'react';
import { getAuth } from '../../context/authContext';

const IntegrationStatus: React.FC = () => {
  const { user } = getAuth();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
        <Link className="mr-3 text-orange-500" size={24} />
        Integrations
      </h2>
      <div className="space-y-4">

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 font-bold text-red-600">G</div>
            <span className="font-medium text-gray-800">Google Calendar</span>
          </div>
          {user?.calendar ? (
            <div className="flex items-center text-sm text-green-600">
              <Check size={16} className="mr-1" /> Connected
            </div>
          ) : user?.calendarError ? (
            <div className="flex items-center text-sm text-red-600 font-medium animate-pulse">
              <AlertTriangle size={16} className="mr-1" /> Reconnect Needed
            </div>
          ) : (
            <div className="flex items-center text-sm text-yellow-600">
              <AlertTriangle size={16} className="mr-1" /> Not Connected
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center mr-3 font-bold text-white">G</div>
            <span className="font-medium text-gray-800">GitHub</span>
          </div>
          {user?.githubUsername ? (
            <div className="flex items-center text-sm text-green-600">
              <Check size={16} className="mr-1" /> Connected
            </div>
          ) : user?.githubError ? (
            <div className="flex items-center text-sm text-red-600 font-medium animate-pulse">
              <AlertTriangle size={16} className="mr-1" /> Reconnect Needed
            </div>
          ) : (
            <div className="flex items-center text-sm text-yellow-600">
              <AlertTriangle size={16} className="mr-1" /> Not Connected
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 font-bold text-blue-600">S</div>
            <span className="font-medium text-gray-400">Slack</span>
          </div>
          <div className="flex items-center text-sm text-gray-400 italic">
             Coming Soon
          </div>
        </div>
      </div>
      
      {(user?.calendarError || user?.githubError || !user?.calendar || !user?.githubUsername) && (
        <div className={`mt-5 p-3 rounded-lg text-xs ${(user?.calendarError || user?.githubError) ? 'bg-red-50 border border-red-100 text-red-800' : 'bg-orange-50 border border-orange-100 text-orange-800'}`}>
          <p className="flex items-center gap-1.5 font-medium">
             {(user?.calendarError || user?.githubError) ? <AlertTriangle size={12} /> : <RefreshCw size={12} />}
             {(user?.calendarError || user?.githubError) ? 'Integration connection failed' : 'Some integrations need attention'}
          </p>
          <p className="mt-1 opacity-80">
            {(user?.calendarError || user?.githubError) 
              ? 'Your Google or GitHub token has expired or was revoked. Please reconnect in settings.' 
              : 'Check your settings to connect your accounts.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default IntegrationStatus;
