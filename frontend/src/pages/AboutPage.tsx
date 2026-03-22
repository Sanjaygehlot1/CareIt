import { getThemeContext } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft, Code, Flame, Sparkles, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
export default function AboutPage() {
  const { theme } = getThemeContext();
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };
  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Background Magic Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[100px] opacity-30" style={{ backgroundColor: '#f97316' }}></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full mix-blend-multiply filter blur-[100px] opacity-20" style={{ backgroundColor: '#3b82f6' }}></div>
      </div>
      <header className="relative z-10 border-b backdrop-blur-md" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 80%, transparent)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:text-orange-500 transition-colors group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2.5 hover:scale-105 transition-transform cursor-pointer">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
              <Zap size={17} color="white" />
            </div>
            <span className="text-lg font-bold">Care<span style={{ color: '#f97316' }}>It</span></span>
          </div>
        </div>
      </header>
      
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-24 pb-32">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-16">
          
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
              The <span style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mission</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Bridging the gap between high-performance engineering and sustainable developer well-being.
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6 pt-8">
            <div className="p-8 rounded-3xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
               <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm" style={{color: '#ef4444' }}>
                 <Flame size={24} />
               </div>
               <h3 className="text-xl font-bold mb-3">Anti-Burnout</h3>
               <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Developers treat their bodies like machines. CareIt uses AI to course-correct before a severe burnout crash.</p>
            </div>
            <div className="p-8 rounded-3xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
               <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm" style={{  color: '#3b82f6' }}>
                 <Code size={24} />
               </div>
               <h3 className="text-xl font-bold mb-3">Deep Work</h3>
               <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Silent integrations with VS Code intercept distractions and measure genuine unbroken flow-states.</p>
            </div>
            <div className="p-8 rounded-3xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
               <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm" style={{  color: '#10b981' }}>
                 <Activity size={24} />
               </div>
               <h3 className="text-xl font-bold mb-3">Holistic Data</h3>
               <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Overlays health metrics, calendar congestion, and coding streaks together into beautiful insights.</p>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="mt-20 p-10 md:p-14 rounded-[3rem] text-center border overflow-hidden relative shadow-md" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ background: 'radial-gradient(circle at top right, #f97316, transparent 60%)' }}></div>
            <Sparkles size={40} className="mx-auto mb-6" style={{ color: '#f97316' }} />
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>You write code. We take care of you.</h2>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We are building the ultimate AI-powered companion that natively understands your workflow. By syncing directly with your codebase, scheduling, and personal goals, CareIt delivers actionable coaching to keep you at your peak.
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}