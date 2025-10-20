import React, { useContext } from 'react';
import { PlusCircle, Clock, LogOut, Moon, Sun, SunMedium, MoonStarIcon, SunSnowIcon } from 'lucide-react';
import { getAuth } from '../context/authContext';
import { getEvents } from '../controllers/calendar';
import { SunIcon } from 'lucide-react';
import { MoonIcon } from 'lucide-react';
import { getThemeContext } from '../context/ThemeContext';
import '../index.css'
import Timer from './FocusTimer/Timer';

const Header: React.FC = () => {
  const { user, logOut } = getAuth();
  const { theme, toggleTheme } = getThemeContext();

  return (
    <header style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }} className="backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Good Evening, {user?.name.split(" ")[0]}!
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Here's your productivity snapshot for <span style={{color : 'var(--text-primary)'}} className='font-bold'>{ new Date().toDateString()}</span>
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button style={{ backgroundColor: 'var(--accent-primary)' }} className="flex items-center text-white px-3 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all">
              <PlusCircle size={16} className="mr-2" /> Add Task
            </button>
            <Timer/>
            <button 
              onClick={toggleTheme}
              style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-primary)'}}
              className="p-2 rounded-lg hover:opacity-80 transition-all"
            >
              {theme === 'light' ? <MoonStarIcon size={20} /> : <SunMedium size={20} />}
            </button>
            <button 
              onClick={logOut}
              style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-primary)' }}
              className="p-2 rounded-lg hover:opacity-80 transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;