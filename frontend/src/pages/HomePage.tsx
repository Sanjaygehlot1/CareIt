import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Sun, Moon, Menu, X, LucideArrowUpRightFromSquare } from 'lucide-react';
import { getThemeContext } from '../context/ThemeContext';
import { Pricing } from '../components/ui/pricing';
import { ContainerScroll } from '../components/ui/container-scroll-animation';
import { FeatureCarousel } from '../components/ui/feature-carousel';
import { CAROUSEL_FEATURES, GOOGLE_AUTH_URL, PRICING_PLANS } from '../utils/data';
import { Logo } from '../components/ui/Logo';
import Footer from '../components/common/Footer';

const STATS = [
  { label: 'Developers using CareIt', value: '2+' },
  { label: 'Goals completed', value: '18+' },
  { label: 'Avg streak increase', value: '2.1×' },
];


const NAV_ITEMS = [
  { name: 'Features', href: '/#features' },
  { name: 'Pricing', href: '/#pricing' },
  { name: 'Docs', href: '/docs' },
  { name: 'About', href: '/about' },
];




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
                <Logo />
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
                className="relative inline-flex items-center h-8 w-[52px] rounded-full transition-colors duration-300 focus:outline-none"
                style={{ backgroundColor: theme === 'dark' ? '#4b5563' : '#d1d5db' }}
                aria-label="Toggle theme"
              >
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                >
                  {theme === 'dark' ? (
                    <Moon size={14} className="text-slate-800" />
                  ) : (
                    <Sun size={14} className="text-orange-500" />
                  )}
                </span>
              </button>


              <a
                href={GOOGLE_AUTH_URL}
                className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-md h-9"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                <img src="/google.svg" alt="Google" className="size-4" />
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
                  <img src="/google.svg" alt="Google" className="size-4" />

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
                    <img src="/google.svg" alt="Google" className="size-4" />

                    Continue with Google
                    <LucideArrowUpRightFromSquare size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </a>
                  
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



      <Footer/>

    </div>
  );
}