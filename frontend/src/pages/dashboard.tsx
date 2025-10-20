import React from 'react';
import '../index.css'

import DailyFocusBar from '../components/dashboard/DailyFocusBar';
import WellnessCheckin from '../components/dashboard/WellnessCheckin';
import WeeklyActivityChart from '../components/dashboard/WeeklyActivityChart';
import WeeklyGoals from '../components/dashboard/WeeklyGoals';
import TodaysAgenda from '../components/dashboard/TodaysAgenda';
import EventCalendar from '../components/dashboard/EventCalendar';

const Dashboard: React.FC = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)' }} className="flex flex-col h-screen relative">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pb-24">

          <div className="mb-6">
            <DailyFocusBar />
          </div>

          <div className="mt-6">
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <WeeklyActivityChart />
              <WeeklyGoals />
            </div>

            <div className="space-y-6">
              <EventCalendar />
              <TodaysAgenda />
              <WellnessCheckin />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;