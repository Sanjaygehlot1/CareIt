import {
  Calendar, Target, BarChart2, Clock, 
  Code2, BrainCircuit, TrendingUp, Bell, StickyNote,
} from 'lucide-react';


import { BACKEND_BASE_URL } from '../utils/secrets';

export const GOOGLE_AUTH_URL = `${BACKEND_BASE_URL}/auth/google/login`;

export const CAROUSEL_FEATURES = [
  { id: 'calendar', icon: Calendar, label: 'Smart Calendar Sync', image: 'https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774098765/Gemini_Generated_Image_7gacm97gacm97gac_culwnz.png', description: 'Automatically pull Google Calendar events, flights, and hotel bookings from Gmail.' },
  { id: 'goals', icon: Target, label: 'AI Goal Coaching', image: 'https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774098766/Gemini_Generated_Image_mvaq92mvaq92mvaq_difgpa.png', description: 'Get real-time progress tracked. AI recalibrates when you miss or exceed goals.' },
  { id: 'analytics', icon: BarChart2, label: 'Activity Analytics', image: 'https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774098715/Gemini_Generated_Image_27l2y127l2y127l2_prurqb.png', description: 'Charts for coding patterns, GitHub commits, streaks, and focus sessions.' },
  { id: 'scratchpad', icon: StickyNote, label: 'Scratchpad', image: 'https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774103004/Untitled_Project_pmaaie.jpg', description: 'A quick-access notepad for jotting ideas, bugs, and todos without leaving CareIt.' },
  { id: 'burnout', icon: BrainCircuit, label: 'Burnout Detection', image: 'https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774099932/Gemini_Generated_Image_tsdytatsdytatsdy_iur9i4.png', description: 'AI monitors your hours and warns you before burnout sets in to course-correct.' },
  { id: 'digest', icon: Bell, label: 'Daily Digest', image: 'https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774098716/Gemini_Generated_Image_q7yih9q7yih9q7yi_t7llzq.png', description: 'A 2-line evening notification summarising your day. Short and impactful.' },
  { id: 'focus', icon: Clock, label: 'Focus Timer', image: 'https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774098767/Gemini_Generated_Image_jkxbw2jkxbw2jkxb_bvmkyc.png', description: 'Block distractions and enter deep work mode. Sessions count toward goals.' },
  { id: 'streak', icon: TrendingUp, label: 'Streak System', image: 'https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774099962/Gemini_Generated_Image_t2ne4jt2ne4jt2ne_dgigr0.png', description: 'Build consistent coding habits with daily streaks powered by real activity data.' },
  { id: 'vscode', icon: Code2, label: 'VS Code Extension', image: 'https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774099035/Gemini_Generated_Image_g4f9tzg4f9tzg4f9_qgeegt.png', description: 'Coding time is tracked silently in the background, synced to your dashboard.' },
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