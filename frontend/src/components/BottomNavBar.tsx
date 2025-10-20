import React from 'react';
import { LayoutGrid, Target, BarChart2, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', icon: <LayoutGrid size={24} />, label: 'Dashboard' },
  { to: '/goals', icon: <Target size={24} />, label: 'Goals' },
  { to: '/reports', icon: <BarChart2 size={24} />, label: 'Reports' },
  { to: '/settings', icon: <Settings size={24} />, label: 'Settings' },
];

const BottomNavBar: React.FC = () => {
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2">
      <div 
        className="
          flex items-center justify-center
          bg-white/20 backdrop-blur-lg 
          rounded-full shadow-lg
          transition-all duration-300 ease-in-out
          hover:shadow-2xl hover:-translate-y-1
          px-4 py-2
        "
      >
        <ul className="flex items-center justify-center gap-x-2 sm:gap-x-4">
          {navItems.map((item, index) => (
            <li key={index} className="relative">
              <Link 
                to={item.to} 
                className="
                  group
                  flex items-center justify-center
                  w-14 h-14 
                  rounded-full
                  transition-colors duration-300
                  hover:bg-white/20
                "
              >
                <div 
                style={{color : 'var(--text-primary)'}}
                  className="
                    absolute
                    text-gray-700
                    transition-transform duration-300 ease-in-out
                    group-hover:-translate-y-2 
                  "
                >
                  {item.icon}
                </div>

                <span 
                style={{color : 'var(--text-primary)'}}
                  className="
                    absolute -bottom-0
                    text-xs font-semibold text-gray-800
                    opacity-0 
                    transition-all duration-300 ease-in-out
                    group-hover:opacity-100 group-hover:translate-y-0
                  "
                >
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default BottomNavBar;