// src/components/Header.tsx
import React from 'react';
import { PlusCircle, Clock, LogOut } from 'lucide-react';
import { getAuth } from '../context/authContext';

const Header: React.FC = () => {
  const {user, logOut} = getAuth();

  return (
    <header className="bg-gray-50/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Good Evening, {user?.name.split(" ")[0]}!
            </h1>
            <p className="text-sm text-gray-500">
              Here's your productivity snapshot for Thursday, October 9th.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
              <PlusCircle size={16} className="mr-2" /> Add Task
            </button>
            <button className="flex items-center bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
              <Clock size={16} className="mr-2" /> Start Focus
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <LogOut size={20} className="text-gray-500" onClick={logOut} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;