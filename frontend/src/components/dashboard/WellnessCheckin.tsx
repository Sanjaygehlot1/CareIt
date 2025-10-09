import React, { useState } from 'react';
import { HeartPulse, BedDouble, Droplets, BrainCircuit } from 'lucide-react';

const WellnessCheckin: React.FC = () => {
  const [waterCount, setWaterCount] = useState(3); 
  const totalWaterGlasses = 8;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
        <HeartPulse className="mr-3 text-orange-500" size={24} />
        Daily Wellness
      </h2>
      <div className="space-y-5">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BedDouble size={20} className="text-gray-500" />
            <span className="font-medium text-gray-700">Sleep</span>
          </div>
          <div className="bg-orange-100 text-orange-700 font-bold text-sm px-3 py-1 rounded-full">
            7h 30m
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-2">
            <Droplets size={20} className="text-gray-500" />
            <span className="font-medium text-gray-700">Hydration</span>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalWaterGlasses }).map((_, index) => (
              <button 
                key={index} 
                onClick={() => setWaterCount(index + 1)}
                className={`transition-colors ${index < waterCount ? 'text-blue-500' : 'text-gray-300'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.163c-3.642 0-6.598 2.535-6.598 5.662 0 1.954.98 3.738 2.53 4.805l-1.634 7.23a.5.5 0 0 0 .493.54h10.418a.5.5 0 0 0 .493-.54l-1.634-7.23c1.55-1.067 2.53-2.851 2.53-4.805 0-3.127-2.956-5.662-6.598-5.662z"/></svg>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrainCircuit size={20} className="text-gray-500" />
            <span className="font-medium text-gray-700">Mindful Moment</span>
          </div>
          <label htmlFor="mindful-check" className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" id="mindful-check" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>

      </div>
    </div>
  );
};

export default WellnessCheckin;