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

const Dashboard: React.FC = () => {
  const { user } = getAuth();
  const burnoutLevel = (user as any)?.burnoutLevel ?? 'NONE';
  const burnoutScore = (user as any)?.burnoutScore ?? 0;

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)' }} className="min-h-screen pb-24 relative">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">

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

export default Dashboard;
