import { useState} from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, Target, BarChart2, Clock, Zap,
  ArrowRight, Sun, Moon,
  Code2, BrainCircuit, TrendingUp, Bell, StickyNote,
  Menu, X,
} from 'lucide-react';
import { getThemeContext } from '../context/ThemeContext';
import { Pricing } from '../components/ui/pricing';
import { ContainerScroll } from '../components/ui/container-scroll-animation';
import { FeatureCarousel } from '../components/ui/feature-carousel';
import { BACKEND_BASE_URL } from '../utils/secrets';

const GOOGLE_AUTH_URL = `${BACKEND_BASE_URL}/auth/google/login`;

const GoogleIcon = ({ className }: { className?: string }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		className={className}
	>
		<g>
			<path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669   C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62   c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401   c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
		</g>
	</svg>
);


const CAROUSEL_FEATURES = [
  { id: 'calendar', icon: Calendar,     label: 'Smart Calendar Sync',  image: 'https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774098765/Gemini_Generated_Image_7gacm97gacm97gac_culwnz.png', description: 'Automatically pull Google Calendar events, flights, and hotel bookings from Gmail.' },
  { id: 'goals',    icon: Target,       label: 'AI Goal Coaching',     image: 'https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774098766/Gemini_Generated_Image_mvaq92mvaq92mvaq_difgpa.png', description: 'Get real-time progress tracked. AI recalibrates when you miss or exceed goals.' },
  { id: 'analytics',icon: BarChart2,    label: 'Activity Analytics',   image: 'https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774098715/Gemini_Generated_Image_27l2y127l2y127l2_prurqb.png', description: 'Charts for coding patterns, GitHub commits, streaks, and focus sessions.' },
  { id: 'scratchpad',icon: StickyNote,   label: 'Scratchpad',           image: 'https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774103004/Untitled_Project_pmaaie.jpg', description: 'A quick-access notepad for jotting ideas, bugs, and todos without leaving CareIt.' },
  { id: 'burnout',  icon: BrainCircuit, label: 'Burnout Detection',    image: 'https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774099932/Gemini_Generated_Image_tsdytatsdytatsdy_iur9i4.png', description: 'AI monitors your hours and warns you before burnout sets in to course-correct.' },
  { id: 'digest',   icon: Bell,         label: 'Daily Digest',         image: 'https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774098716/Gemini_Generated_Image_q7yih9q7yih9q7yi_t7llzq.png', description: 'A 2-line evening notification summarising your day. Short and impactful.' },
  { id: 'focus',    icon: Clock,        label: 'Focus Timer',          image: 'https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774098767/Gemini_Generated_Image_jkxbw2jkxbw2jkxb_bvmkyc.png', description: 'Block distractions and enter deep work mode. Sessions count toward goals.' },
  { id: 'streak',   icon: TrendingUp,   label: 'Streak System',        image: 'https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774099962/Gemini_Generated_Image_t2ne4jt2ne4jt2ne_dgigr0.png', description: 'Build consistent coding habits with daily streaks powered by real activity data.' },
  { id: 'vscode',   icon: Code2,        label: 'VS Code Extension',    image: 'https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774099035/Gemini_Generated_Image_g4f9tzg4f9tzg4f9_qgeegt.png', description: 'Coding time is tracked silently in the background, synced to your dashboard.' },
];

const PRICING_PLANS = [
  {
    name: 'FREE', price: '0', yearlyPrice: '0', period: 'per month',
    features: ['Dashboard + streak tracking', 'Up to 3 active goals', 'Calendar sync (read-only)', 'VS Code extension', 'Daily digest email'],
    description: 'Perfect for solo developers getting started',
    buttonText: 'Get Started Free', href: GOOGLE_AUTH_URL, isPopular: false,
  },
  {
    name: 'PRO', price: '9', yearlyPrice: '7', period: 'per month',
    features: ['Everything in Free', 'Unlimited goals + AI coaching', 'Burnout detection alerts', 'GitHub App integration', 'Streak coach emails', 'Priority support'],
    description: 'For serious developers who want AI-powered growth',
    buttonText: 'Start Pro Trial', href: GOOGLE_AUTH_URL, isPopular: true,
  },
  {
    name: 'TEAM', price: '29', yearlyPrice: '23', period: 'per month',
    features: ['Everything in Pro', 'Up to 10 team members', 'Team analytics dashboard', 'Custom goal templates', 'SSO Authentication', 'Dedicated Slack support'],
    description: 'For engineering teams who ship together',
    buttonText: 'Contact Us', href: GOOGLE_AUTH_URL, isPopular: false,
  },
];

const STATS = [
  { label: 'Developers using CareIt', value: '2,400+' },
  { label: 'Goals completed', value: '18,000+' },
  { label: 'Avg streak increase', value: '3.2×' },
];


const NAV_ITEMS = [
  { name: 'Features',   href: '#features'   },
  { name: 'Dashboard',  href: '#dashboard'  },
  { name: 'Pricing',    href: '#pricing'    },
  { name: 'About',      href: '#about'      },
];

function CareItLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
      >
        <Zap size={17} color="white" />
      </div>
      <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
        Care<span style={{ color: '#f97316' }}>It</span>
      </span>
    </div>
  );
}


function HeroHeader({
  theme,
  onToggleTheme,
}: {
  theme: string;
  onToggleTheme: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header>
      <nav
        className="fixed z-20 w-full border-b backdrop-blur-xl"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg-primary) 80%, transparent)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between py-3.5 lg:py-4">


            <div className="flex items-center gap-10">
              <Link to="/" aria-label="home">
                <CareItLogo />
              </Link>
              <ul className="hidden lg:flex gap-8 text-sm">
                {NAV_ITEMS.map(item => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="transition-colors duration-150"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-secondary)' }}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
              </button>

              
              <a
                href={GOOGLE_AUTH_URL}
                className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-md h-9"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                <GoogleIcon className="size-4" />
                Get Started
              </a>


              <button
                className="lg:hidden p-2 rounded-lg"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setOpen(v => !v)}
                aria-label={open ? 'Close menu' : 'Open menu'}
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>


          {open && (
            <div
              className="lg:hidden border-t pb-6 pt-4 space-y-5"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <ul className="space-y-4 text-sm">
                {NAV_ITEMS.map(item => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      style={{ color: 'var(--text-secondary)' }}
                      onClick={() => setOpen(false)}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-3 pt-2">
                <a
                  href={GOOGLE_AUTH_URL}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium border flex items-center justify-center"
                  style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                >
                  Login
                </a>
                <a
                  href={GOOGLE_AUTH_URL}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                >
                  <GoogleIcon className="size-4" />
                  Get Started
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}


function HeroSection({
  theme,
  onToggleTheme,
}: {
  theme: string;
  onToggleTheme: () => void;
}) {
  return (
    <>
      <HeroHeader theme={theme} onToggleTheme={onToggleTheme} />

      <main className="overflow-x-hidden">

        <section style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="pb-24 pt-12 mt-8 ">
            <div className="relative mx-auto flex max-w-6xl flex-col px-6 lg:block">

              <div className="mx-auto max-w-lg text-center lg:ml-0 lg:w-1/2 lg:text-left">

                <div
                  className="mt-8 lg:mt-16 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border mb-5"
                  style={{
                    color: '#f97316',
                    backgroundColor: 'rgba(249,115,22,0.08)',
                    borderColor: 'rgba(249,115,22,0.2)',
                  }}
                >
                  <Zap size={11} />
                  Developer productivity
                </div>

                <h1
                  className="max-w-2xl text-balance text-5xl font-bold md:text-6xl xl:text-7xl leading-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Code Smarter.{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #f97316, #fb923c, #fbbf24)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Grow Faster.
                  </span>
                </h1>

                <p
                  className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Track goals, streaks, and focus time automatically. AI coaching
                  that actually understands your coding patterns.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                  <a
                    href={GOOGLE_AUTH_URL}
                    className="group h-11 px-7 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all hover:scale-105 hover:shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      boxShadow: '0 4px 20px rgba(249,115,22,0.3)',
                    }}
                  >
                    <GoogleIcon className="size-4" />
                    Continue with Google
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <button
                    className="h-11 px-7 rounded-xl text-sm font-semibold border transition-all hover:scale-105"
                    style={{
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--hover-bg)',
                    }}
                  >
                    Request a demo
                  </button>
                </div>


                <div
                  className="mt-12 grid grid-cols-3 gap-px rounded-xl overflow-hidden border"
                  style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--border-primary)' }}
                >
                  {STATS.map(s => (
                    <div
                      key={s.label}
                      className="text-center py-4 px-3"
                      style={{ backgroundColor: 'var(--card-bg)' }}
                    >
                      <div className="text-xl font-bold" style={{ color: '#f97316' }}>{s.value}</div>
                      <div className="text-xs mt-0.5 leading-tight" style={{ color: 'var(--text-tertiary)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}


export default function HomePage() {
  const { toggleTheme, theme } = getThemeContext();

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>

      
      <HeroSection
        theme={theme}
        onToggleTheme={toggleTheme}
      />


      <section id="dashboard" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <ContainerScroll
          titleComponent={
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#f97316' }}>
                Built for developers
              </p>
              <h2 className="text-4xl md:text-6xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                Everything in<br />
                <span style={{
                  background: 'linear-gradient(135deg, #f97316, #fb923c)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  one dashboard
                </span>
              </h2>
            </div>
          }
        >
          <img
            src="https://res.cloudinary.com/dh9bwsdjp/image/upload/v1774103101/Screenshot_2026-03-21_195446_psrtjx.png"
            alt="CareIt Dashboard Preview"
            className="w-full h-full object-cover object-top rounded-xl"
            draggable={false}
          />
        </ContainerScroll>
      </section>


      <section id="features" className="py-28" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#f97316' }}>
              Features
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Everything you need to grow
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Powerful tools that work automatically in the background — so you can focus on shipping.
            </p>
          </motion.div>


          <FeatureCarousel features={CAROUSEL_FEATURES} />
        </div>
      </section>



      <section id="pricing" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--card-border)' }}>
        <Pricing
          plans={PRICING_PLANS}
          title="Simple, Transparent Pricing"
          description={"Start free. Upgrade when you're ready.\nNo hidden fees, cancel anytime."}
        />
      </section>


      <section className="py-24" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div
              className="rounded-3xl p-12 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(234,88,12,0.03))',
                border: '1px solid rgba(249,115,22,0.18)',
                backgroundColor: 'var(--card-bg)',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#f97316' }} />
              </div>
              <div className="relative z-10">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                >
                  <Zap size={28} color="white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Ready to level up?
                </h2>
                <p className="text-xl mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                  Join thousands of developers who use CareIt to ship more, burn out less, and grow consistently.
                </p>
                <a
                  href={GOOGLE_AUTH_URL}
                  className="group px-10 py-4 rounded-2xl text-lg font-semibold text-white flex items-center gap-3 mx-auto transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    boxShadow: '0 8px 32px rgba(249,115,22,0.3)',
                  }}
                >
                  <GoogleIcon className="size-5" />
                  Continue with Google
                  <ArrowRight size={22} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      <footer
        className="border-t py-10"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <CareItLogo />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            © 2026 CareIt. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <a href="#" className="hover:text-orange-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-orange-500 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

    </div>
  );
}