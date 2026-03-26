import React from 'react';
import '../index.css'

import DailyFocusBar from '../components/dashboard/DailyFocusBar';
import ActivityTrendChart from '../components/dashboard/WeeklyActivityChart';
import GoalsMiniCard from '../components/dashboard/GoalsMiniCard';
import TodaysAgenda from '../components/dashboard/TodaysAgenda';
import EventCalendar from '../components/dashboard/EventCalendar';
import BurnoutBanner from '../components/dashboard/BurnoutBanner';
import StickyNoteWidget from '../components/dashboard/StickyNoteWidget';
import { getAuth } from '../context/authContext';

import { DashboardProvider, useDashboard } from '../context/dashboardContext';

const DashboardContent: React.FC = () => {
  const { user: authUser } = getAuth();
  const { data, loading } = useDashboard();
  
  const user = data?.profile || authUser;
  const burnoutLevel = data?.profile?.burnoutLevel ?? 'NONE';
  const burnoutScore = data?.profile?.burnoutScore ?? 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)' }} className="min-h-screen pb-24 relative">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">

          <div className="mb-8">
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {getGreeting()}, {user?.name?.split(" ")[0] || 'Developer'}!
              </h1>
              <p className="text-md mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Here's your productivity snapshot for <span style={{ color: 'var(--text-primary)' }} className='font-bold'>{new Date().toDateString()}</span>
              </p>
          </div>

          <div className="mb-6">
            <DailyFocusBar />
          </div>

          {burnoutLevel !== 'NONE' && (
            <div className="mb-6">
              <BurnoutBanner level={burnoutLevel} score={burnoutScore} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ActivityTrendChart />
              <GoalsMiniCard />
            </div>

            <div className="space-y-6">
              <StickyNoteWidget />
              <EventCalendar />
              <TodaysAgenda />
            </div>
          </div>
        </div>
    </div>
  );
};

const Dashboard: React.FC = () => (
    <DashboardProvider>
        <DashboardContent />
    </DashboardProvider>
);

export default Dashboard;
