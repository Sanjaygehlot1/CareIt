import React, { useState } from 'react';
import { HeartPulse, BedDouble, Droplets, BrainCircuit } from 'lucide-react';

const WellnessCheckin: React.FC = () => {
  const [waterCount, setWaterCount] = useState(3); 
  const totalWaterGlasses = 8;

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }} className="p-6 rounded-xl shadow-card border">
      <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
        <HeartPulse className="mr-3" style={{ color: 'var(--accent-primary)' }} size={24} />
        Daily Wellness
      </h2>
      <div className="space-y-5">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BedDouble size={20} style={{ color: 'var(--text-secondary)' }} />
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Sleep</span>
          </div>
          <div className="font-bold text-sm px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)' }}>
            7h 30m
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-2">
            <Droplets size={20} style={{ color: 'var(--text-secondary)' }} />
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Hydration</span>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalWaterGlasses }).map((_, index) => (
              <button 
                key={index} 
                onClick={() => setWaterCount(index + 1)}
                className="transition-colors"
                style={{ color: index < waterCount ? '#3b82f6' : 'var(--text-tertiary)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.163c-3.642 0-6.598 2.535-6.598 5.662 0 1.954.98 3.738 2.53 4.805l-1.634 7.23a.5.5 0 0 0 .493.54h10.418a.5.5 0 0 0 .493-.54l-1.634-7.23c1.55-1.067 2.53-2.851 2.53-4.805 0-3.127-2.956-5.662-6.598-5.662z"/></svg>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrainCircuit size={20} style={{ color: 'var(--text-secondary)' }} />
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Mindful Moment</span>
          </div>
          <label htmlFor="mindful-check" className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" id="mindful-check" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500" style={{ backgroundColor: 'var(--border-secondary)' }}></div>
          </label>
        </div>

      </div>
    </div>
  );
};

export default WellnessCheckin;