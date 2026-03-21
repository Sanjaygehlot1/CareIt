import React, { useState, useRef, useEffect } from 'react';
import { LogOut, SunMedium, MoonStarIcon, Settings, ChevronDown } from 'lucide-react';
import { getAuth } from '../context/authContext';
import { getThemeContext } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css'
import Timer from './FocusTimer/Timer';

const Header: React.FC = () => {
    const { user, logOut } = getAuth();
    const { theme, toggleTheme } = getThemeContext();
    const [imgError, setImgError] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good Morning';
        if (hour >= 12 && hour < 17) return 'Good Afternoon';
        if (hour >= 17 && hour < 21) return 'Good Evening';
        return 'Good Night';
    };


    useEffect(() => {
        setImgError(false);
    }, [user?.profileUrl]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }} className="relative z-50 backdrop-blur-md">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            {getGreeting()}, {user?.name.split(" ")[0]}!
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Here's your productivity snapshot for <span style={{ color: 'var(--text-primary)' }} className='font-bold'>{new Date().toDateString()}</span>
                        </p>
                    </div>

                    <div className="flex items-center space-x-6">
                        <Timer />


                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 group focus:outline-none"
                            >
                                <div className="relative">
                                    {(user?.profileUrl && !imgError) ? (
                                        <img
                                            className="h-9 w-9 rounded-full object-cover border-2 shadow-sm transition-transform group-hover:scale-105"
                                            style={{ borderColor: 'var(--accent-primary)' }}
                                            src={user.profileUrl}
                                            alt={user?.name}
                                            onError={() => setImgError(true)}
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div
                                            className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-transform group-hover:scale-105"
                                            style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
                                        >
                                            {user?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 p-0.5 shadow-sm">
                                        <ChevronDown size={10} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-secondary)' }} />
                                    </div>
                                </div>
                            </button>


                            {isDropdownOpen && (
                                <div
                                    className="absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                                >
                                    <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                                        <p style={{color: 'var(--text-primary'}} className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">Signed in as</p>
                                        <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                                        <p className="text-[10px] opacity-60 truncate" style={{ color: 'var(--text-secondary)' }}>{user?.email || (user?.githubUsername + '@github')}</p>
                                    </div>

                                    <div className="p-2">
                                        <Link
                                            to="/settings"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            <Settings size={18} className="opacity-70" />
                                            Settings
                                        </Link>

                                        <button
                                            onClick={() => {
                                                toggleTheme();
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {theme === 'light' ? (
                                                <>
                                                    <MoonStarIcon size={18} className="opacity-70" />
                                                    Appearance: Light
                                                </>
                                            ) : (
                                                <>
                                                    <SunMedium size={18} className="opacity-70" />
                                                    Appearance: Dark
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="p-2 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                navigate('/');
                                                logOut();
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 transition-colors hover:bg-red-500/10"
                                        >
                                            <LogOut size={18} />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;