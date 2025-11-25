import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import googleLogo from '../assets/google.svg';
import { BACKEND_BASE_URL } from '../utils/secrets';

function SignIn() {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="mb-8 flex items-center gap-3 animate-fade-in-up">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          <Zap size={28} color="white" className="fill-current" />
        </div>
        <span className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Care<span style={{ color: 'var(--accent-primary)' }}>It</span>
        </span>
      </div>

      <div 
        className="w-full max-w-md rounded-3xl shadow-2xl p-8 md:p-10 border transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--card-bg)', 
          borderColor: 'var(--card-border)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)' 
        }}
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold mb-3" style={{ color: 'var(--text-primary)' }}>
            Welcome Back
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Sign in to continue to your productivity hub
          </p>
        </div>

        <div className="space-y-4">
          <a
            href={`${BACKEND_BASE_URL}/auth/google/login`}
            className="group relative flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl border-2 font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
            style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-current" />
            
            <img src={googleLogo} alt="Google" className="w-6 h-6" />
            <span className="relative z-10">Continue with Google</span>
            
            <ArrowRight 
              size={20} 
              className="absolute right-6 opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
              style={{ color: 'var(--text-secondary)' }}
            />
          </a>
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          By clicking continue, you agree to our{' '}
          <a href="#" className="font-medium underline hover:text-orange-500 transition-colors">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="font-medium underline hover:text-orange-500 transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

export default SignIn;