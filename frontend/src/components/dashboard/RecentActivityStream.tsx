// src/components/dashboard/RecentActivityStream.tsx
import { ArrowRight, Calendar, GitCommitHorizontal } from 'lucide-react';
import React from 'react';

const activities = [
  { icon: <GitCommitHorizontal size={20} />, text: 'Pushed 3 commits to digital-twin', time: '15m ago' },
  { icon: <Calendar size={20} />, text: 'Event started: Design Review', time: '1h ago' },
  { icon: <GitCommitHorizontal size={20} />, text: 'Merged PR #42 in api-gateway', time: '3h ago' },
  { icon: <Calendar size={20} />, text: 'Event ended: Team Standup', time: '5h ago' },
];

const RecentActivityStream: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
         <ArrowRight className="mr-3 text-orange-500" size={24} />
         Recent Activity
      </h2>
      <div className="space-y-5">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="text-orange-500 mt-0.5">{activity.icon}</div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">{activity.text}</p>
              <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityStream;