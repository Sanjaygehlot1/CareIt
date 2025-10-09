// src/components/dashboard/IntegrationStatus.tsx
import { Link, Check, AlertTriangle } from 'lucide-react';
import React from 'react';

const IntegrationStatus: React.FC = () => {
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
          <div className="flex items-center text-sm text-green-600">
            <Check size={16} className="mr-1" /> Connected
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center mr-3 font-bold text-white">G</div>
            <span className="font-medium text-gray-800">GitHub</span>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <Check size={16} className="mr-1" /> Connected
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 font-bold text-blue-600">S</div>
            <span className="font-medium text-gray-400">Slack</span>
          </div>
          <div className="flex items-center text-sm text-yellow-600">
             <AlertTriangle size={16} className="mr-1" /> Not Connected
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationStatus;