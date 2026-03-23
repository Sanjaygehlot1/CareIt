import { getThemeContext } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft, Code2, HeartPulse, Clock, Github, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '../components/ui/Logo';

export default function DocsPage() {
  const { theme } = getThemeContext();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] right-[5%] w-[450px] h-[450px] rounded-full mix-blend-multiply filter blur-[120px] opacity-20" style={{ backgroundColor: '#10b981' }}></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[100px] opacity-20" style={{ backgroundColor: '#f97316' }}></div>
      </div>

      <header className="relative z-10 border-b backdrop-blur-md" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 80%, transparent)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:text-orange-500 transition-colors group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Home</span>
          </Link>
          <Logo/>
        </div>
      </header>
      
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-20 pb-32">
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          
          <motion.div variants={itemVariants} className="text-center mb-16 space-y-4">
            <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-sm mb-6" style={{ color: '#f97316' }}>
               <FileText size={32} />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">System Integrations</h1>
            <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Learn how to connect CareIt into your daily engineering workflow to maximize productivity and prevent burnout.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div variants={itemVariants} className="p-8 rounded-3xl border shadow-sm group hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform" style={{  color: '#f97316' }}>
                <Code2 size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">VS Code Extension</h3>
              <p className="leading-relaxed text-lg" style={{ color: 'var(--text-secondary)' }}>
                Download the CareIt extension from the VS Code Marketplace. Paste your unique API key from the Settings dashboard to instantly begin silent background tracking. Active time is automatically credited to your daily streak.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="p-8 rounded-3xl border shadow-sm group hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform" style={{  color: '#3b82f6' }}>
                <Github size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">GitHub App Webhook</h3>
              <p className="leading-relaxed text-lg" style={{ color: 'var(--text-secondary)' }}>
                Install the CareIt GitHub App to your repositories. Push events, PR merges, and active collaboration will automatically sync to your CareIt timeline and trigger streak extensions perfectly.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="p-8 rounded-3xl border shadow-sm group hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform" style={{  color: '#10b981' }}>
                <Clock size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Focus Timer</h3>
              <p className="leading-relaxed text-lg" style={{ color: 'var(--text-secondary)' }}>
                Use the built-in Deep Work timer anywhere in the app. The timer prevents context switching and automatically logs completed focus sessions toward your daily goals.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="p-8 rounded-3xl border shadow-sm group hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform" style={{  color: '#ec4899' }}>
                <HeartPulse size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Health & Burnout</h3>
              <p className="leading-relaxed text-lg" style={{ color: 'var(--text-secondary)' }}>
                The AI continually indexes your activity pace compared to your historical baseline. If you're dropping consistently behind your usual cadence, you'll receive a burnout warning metric.
              </p>
            </motion.div>
          </div>

        </motion.div>
      </main>
    </div>
  );
}
