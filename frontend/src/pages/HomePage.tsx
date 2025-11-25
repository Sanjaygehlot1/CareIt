import React, { useState } from 'react';
import { Calendar, Github, Target, BarChart2, Clock, Zap, ArrowRight, CheckCircle, Sun, Moon } from 'lucide-react';
import { getThemeContext } from '../context/ThemeContext';
import { HoverBorderGradientButton } from '../components/ui/HoverBorderGradientButton';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {

  const { toggleTheme, theme } = getThemeContext();
  const navigate = useNavigate();

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-primary)',
        minHeight: '100vh',
        transition: 'background-color 0.3s ease'
      }}
    >
      <header
        className="border-b"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)'
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <Zap size={24} color="white" />
            </div>
            <span
              className="text-xl font-bold text-orange-500"

            >
              Care<span className='font-bold ' style={{ color: 'var(--text-primary)' }} >It</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:cursor-pointer"
              style={{ backgroundColor: 'var(--hover-bg)' }}
            >
              {theme === 'light' ? (
                <Moon size={20} style={{ color: 'var(--text-secondary)' }} />
              ) : (
                <Sun size={20} style={{ color: 'var(--text-secondary)' }} />
              )}
            </button>
            <button
            onClick={()=> navigate('/sign-in')}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </header>


      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="fade-in-up">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 shimmer"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--accent-primary)'
            }}
          >
            <Zap size={16} />
            Your All-in-One Productivity Hub
          </div>

          <h1
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Focus on What Matters,
            <br />
            <span className="gradient-text">Let Us Handle the Rest</span>
          </h1>

          <p
            className="text-xl mb-10 max-w-2xl mx-auto scale-in stagger-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            Seamlessly integrate your calendar, track your goals, analyze your productivity,
            and stay organized—all in one beautiful dashboard.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap scale-in stagger-2">

            <HoverBorderGradientButton containerClassName="rounded-full">
              <span>Get Started Free</span>
            </HoverBorderGradientButton>

            <button
              className="inline-flex h-12 animate-shimmer items-center justify-center rounded-full border border-orange-500 bg-[linear-gradient(110deg,#1a0a00,35%,#ff7b00,55%,#1a0a00)] bg-[length:200%_100%] px-6 font-medium text-orange-200 transition-all duration-500 ease-in-out *:hover:text-white 
              hover:cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-black"
            >
              Watch Demo
            </button>

          </div>

          <div
            className="mt-8 flex items-center justify-center gap-6 text-sm flex-wrap scale-in stagger-3"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-110">
              <CheckCircle size={16} style={{ color: 'var(--accent-primary)' }} />
              No credit card required
            </div>
            <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-110">
              <CheckCircle size={16} style={{ color: 'var(--accent-primary)' }} />
              Free forever
            </div>
            <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-110">
              <CheckCircle size={16} style={{ color: 'var(--accent-primary)' }} />
              Cancel anytime
            </div>
          </div>
        </div>

        <div className="mt-16 floating scale-in stagger-4">
          <div
            className="rounded-2xl p-8 shadow-2xl border transition-all duration-500 hover:shadow-3xl hover:scale-105"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)'
            }}
          >
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div
                className="h-24 rounded-lg transition-all duration-300 hover:scale-105 shimmer"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              />
              <div
                className="h-24 rounded-lg transition-all duration-300 hover:scale-105 shimmer"
                style={{ backgroundColor: 'var(--bg-tertiary)', animationDelay: '0.5s' }}
              />
              <div
                className="h-24 rounded-lg transition-all duration-300 hover:scale-105 shimmer"
                style={{ backgroundColor: 'var(--bg-tertiary)', animationDelay: '1s' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div
                className="h-32 rounded-lg transition-all duration-300 hover:scale-105 shimmer"
                style={{ backgroundColor: 'var(--bg-tertiary)', animationDelay: '1.5s' }}
              />
              <div
                className="h-32 rounded-lg transition-all duration-300 hover:scale-105 shimmer"
                style={{ backgroundColor: 'var(--bg-tertiary)', animationDelay: '2s' }}
              />
            </div>
          </div>
        </div>
      </section>


      <section
        className="py-20 border-t"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-bold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Everything You Need to Stay Productive
            </h2>
            <p
              className="text-xl"
              style={{ color: 'var(--text-secondary)' }}
            >
              Powerful features designed to help you achieve more
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div
              className="feature-card p-6 rounded-xl border slide-in-left stagger-1"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
              }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 hover:rotate-12 hover:scale-110"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <Calendar size={24} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Smart Calendar Sync
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Automatically sync your Google Calendar events, flights, hotel bookings,
                and more from Gmail—all in one place.
              </p>
            </div>

            <div
              className="feature-card p-6 rounded-xl border scale-in stagger-2"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
              }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 hover:rotate-12 hover:scale-110"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <Target size={24} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Goal Tracking
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Set weekly goals, track your progress, and celebrate your wins.
                Stay focused on what truly matters.
              </p>
            </div>

            <div
              className="feature-card p-6 rounded-xl border slide-in-right stagger-3"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
              }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 hover:rotate-12 hover:scale-110"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <BarChart2 size={24} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Activity Analytics
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Visualize your productivity patterns with beautiful charts.
                Understand your peak performance times.
              </p>
            </div>

            <div
              className="feature-card p-6 rounded-xl border slide-in-left stagger-4"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
              }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 hover:rotate-12 hover:scale-110"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <Github size={24} style={{ color: 'var(--text-primary)' }} />
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                GitHub Integration
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Track your commits, contributions, and coding activity.
                Perfect for developers who want to monitor their work.
              </p>
            </div>

            <div
              className="feature-card p-6 rounded-xl border scale-in stagger-5"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
              }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 hover:rotate-12 hover:scale-110"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <Clock size={24} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Focus Mode
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Block distractions and enter deep work mode.
                Track your focused time and build better habits.
              </p>
            </div>

            <div
              className="feature-card p-6 rounded-xl border slide-in-right stagger-6"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
              }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 hover:rotate-12 hover:scale-110"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <Zap size={24} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Daily Wellness
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Track your sleep, hydration, and mindfulness.
                Stay healthy while crushing your goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2
            className="text-4xl font-bold mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            Ready to Boost Your Productivity?
          </h2>
          <p
            className="text-xl mb-10"
            style={{ color: 'var(--text-secondary)' }}
          >
            Join thousands of productive people using ProductivFlow every day
          </p>
          <button
            className="px-10 py-5 rounded-lg text-lg font-semibold flex items-center gap-3 mx-auto transition-all hover:scale-105 hover:shadow-xl"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white'
            }}
          >
            Start Your Journey
            <ArrowRight size={24} />
          </button>
        </div>
      </section>

      <footer
        className="border-t py-8"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)'
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                <Zap size={18} color="white" />
              </div>
              <span
                className="font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                Care<span className='font-bold text-orange-500 ' >It</span>
              </span>
            </div>
            <p
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              © 2025 ProductivFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}