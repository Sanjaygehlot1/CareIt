import {
  Calendar, Target, BarChart2, Clock, 
  Code2, BrainCircuit, TrendingUp, Bell, StickyNote,
} from 'lucide-react';


import { BACKEND_BASE_URL } from '../utils/secrets';

export const GOOGLE_AUTH_URL = `${BACKEND_BASE_URL}/auth/google/login`;

export const CAROUSEL_FEATURES = [
  { id: 'calendar', icon: Calendar, label: 'Smart Calendar Sync', image: './gallery/todays_agenda.png', description: 'Automatically pull Google Calendar events, flights, and hotel bookings from Gmail.' },
  { id: 'goals', icon: Target, label: 'AI Goal Coaching', image: './gallery/weekly_goals.png', description: 'Get real-time progress tracked. AI recalibrates when you miss or exceed goals.' },
  { id: 'analytics', icon: BarChart2, label: 'Activity Analytics', image: './gallery/analytics.png', description: 'Charts for coding patterns, GitHub commits, streaks, and focus sessions.' },
  { id: 'scratchpad', icon: StickyNote, label: 'Scratchpad', image: './gallery/scratchpad.png', description: 'A quick-access notepad for jotting ideas, bugs, and todos without leaving CareIt.' },
  { id: 'burnout', icon: BrainCircuit, label: 'Burnout Detection', image: './gallery/burnout.png', description: 'AI monitors your hours and warns you before burnout sets in to course-correct.' },
  { id: 'digest', icon: Bell, label: 'Daily Digest', image: './gallery/daily_digest.png', description: 'A 2-line evening notification summarising your day. Short and impactful.' },
  { id: 'focus', icon: Clock, label: 'Focus Timer', image: './gallery/focus_timer.png', description: 'Block distractions and enter deep work mode. Sessions count toward goals.' },
  { id: 'streak', icon: TrendingUp, label: 'Streak System', image: './gallery/streak.png', description: 'Build consistent coding habits with daily streaks powered by real activity data.' },
  { id: 'vscode', icon: Code2, label: 'VS Code Extension', image: './gallery/vs_code.png', description: 'Coding time is tracked silently in the background, synced to your dashboard.' },
];


export const PRICING_PLANS = [
  {
    name: 'FREE', price: '0', yearlyPrice: '0', period: 'per month',
    features: ['Dashboard + streak tracking', 'Up to 3 active goals', 'Calendar sync (read-only)', 'VS Code extension', 'Daily digest email'],
    description: 'Perfect for solo developers getting started',
    buttonText: 'Get Started Free', href: GOOGLE_AUTH_URL, isPopular: false,
    disabled: false
  },
  {
    name: 'PRO', price: '299', yearlyPrice: '239', period: 'per month',
    features: ['Everything in Free', 'Unlimited goals + AI coaching', 'Burnout detection alerts', 'GitHub App integration', 'Streak coach emails', 'Priority support'],
    description: 'For serious developers who want AI-powered growth',
    buttonText: 'Coming Soon', href: GOOGLE_AUTH_URL, isPopular: true,
    disabled: true 
  },
  {
    name: 'TEAM', price: '1099', yearlyPrice: '879', period: 'per month',
    features: ['Everything in Pro', 'Up to 10 team members', 'Team analytics dashboard', 'Custom goal templates', 'SSO Authentication', 'Dedicated Slack support'],
    description: 'For engineering teams who ship together',
    buttonText: 'Coming Soon', href: GOOGLE_AUTH_URL, isPopular: false,
    disabled: true 
  },
];