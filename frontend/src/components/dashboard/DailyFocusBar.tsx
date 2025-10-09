import React from 'react';
import { GitCommit, Calendar, CheckSquare, Zap, Edit2 } from 'lucide-react';

const DailyFocusBar: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 bg-orange-400 rounded-full"></div>
          <div>
            <p className="text-sm text-gray-500">Today's Priority:</p>
            <h3 className="text-lg font-semibold text-gray-800 hover:text-orange-600 cursor-pointer group flex items-center gap-2">
              Ship the new real-time notifications feature
              <Edit2 size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-px md:h-12 bg-gray-200"></div>

      <div className="flex items-center gap-x-6 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <GitCommit size={20} />
          <span className="font-bold">32</span> Commits
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={20} />
          <span className="font-bold">8.5h</span> Meetings
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <CheckSquare size={20} />
          <span className="font-bold">14</span> Tasks
        </div>
      </div>

      <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-orange-600 transition-colors w-full md:w-auto justify-center">
        <Zap size={18} />
        Start Focus
      </button>

    </div>
  );
};

export default DailyFocusBar;