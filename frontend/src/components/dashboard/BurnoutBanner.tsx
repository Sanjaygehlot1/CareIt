import React, { useState } from 'react';
import { TrendingDown, AlertTriangle, X } from 'lucide-react';
import InfoTooltip from '../ui/InfoTooltip';

type BurnoutLevel = 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE';

interface BurnoutBannerProps {
    level: BurnoutLevel;
    score: number;
}

const CONFIG = {
    NONE: null,
    MILD: {
        emoji: '😴',
        title: 'Your coding pace has dipped a little',
        tip: 'Try a quick 25-min Pomodoro to rebuild momentum.',
        gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(249,115,22,0.08))',
        border: 'rgba(245,158,11,0.35)',
        icon: <TrendingDown size={18} style={{ color: '#f59e0b' }} />,
        barColor: '#f59e0b',
    },
    MODERATE: {
        emoji: '⚠️',
        title: 'Noticeable decline in your coding activity',
        tip: 'Block 30 minutes on your calendar tomorrow — protect that time.',
        gradient: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(239,68,68,0.08))',
        border: 'rgba(249,115,22,0.35)',
        icon: <AlertTriangle size={18} style={{ color: '#f97316' }} />,
        barColor: '#f97316',
    },
    SEVERE: {
        emoji: '🔴',
        title: 'Burnout detected — take care of yourself first',
        tip: 'Rest is part of the process. Come back when you\'re ready.',
        gradient: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.08))',
        border: 'rgba(239,68,68,0.35)',
        icon: <AlertTriangle size={18} style={{ color: '#ef4444' }} />,
        barColor: '#ef4444',
    },
};

const BurnoutBanner: React.FC<BurnoutBannerProps> = ({ level, score }) => {
    const [dismissed, setDismissed] = useState(false);
    const cfg = CONFIG[level];

    if (!cfg || dismissed) return null;

    const pct = Math.min(score, 100);

    return (
        <div
            className="rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden"
            style={{ background: cfg.gradient, border: `1px solid ${cfg.border}` }}
        >
            
            <button
                onClick={() => setDismissed(true)}
                className="absolute top-3 right-3 p-1 rounded-lg hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-tertiary)' }}
                aria-label="Dismiss"
            >
                <X size={14} />
            </button>

           
            <div className="flex items-center gap-2.5 pr-6">
                <span className="text-xl">{cfg.emoji}</span>
                <div>
                    <p className="font-semibold text-sm flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                        {cfg.title}
                        <InfoTooltip
                          title="Burnout Detection"
                          items={[
                            { color: '#f59e0b', label: 'Mild', desc: 'slight dip in coding activity detected' },
                            { color: '#f97316', label: 'Moderate', desc: 'noticeable decline over recent days' },
                            { color: '#ef4444', label: 'Severe', desc: 'significant drop, consider taking a longer break' },
                            { color: '#6b7280', label: 'AI Analysis', desc: 'analyzes your coding patterns daily to calculate burnout score' },
                          ]}
                        />
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {cfg.tip}
                    </p>
                </div>
            </div>

           
            <div>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                        Burnout index
                    </span>
                    <span className="text-[11px] font-bold" style={{ color: cfg.barColor }}>
                        {pct}/100
                    </span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: cfg.barColor }}
                    />
                </div>
            </div>
        </div>
    );
};

export default BurnoutBanner;
