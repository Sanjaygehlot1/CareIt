import React, { useEffect } from 'react';
import { BrainCircuit, Zap } from 'lucide-react';
import { getFocusPoints } from '../../controllers/reports';

const FocusScore: React.FC = () => {
  const todayScore = 285;
  const weeklyScores = [120, 250, 310, 180, 290, 90, 285];

  const getQualityLabel = (score: number) => {
    if (score > 300) return { label: 'Deep Focus', color: 'text-green-500', bgColor : 'bg-blue-500' };
    if (score > 150) return { label: 'Productive Flow', color: 'text-blue-500' };
    return { label: 'Scattered', color: 'text-orange-500' };
  };

  const quality = getQualityLabel(todayScore);
  const maxScore = Math.max(...weeklyScores, 1);

  useEffect(()=>{
    getFocusPoints();
  },[])

  return (
    <div
    style={{backgroundColor : 'var(--card-bg)', color: 'var(--text-primary)'}}
     className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 style={{color: 'var(--text-primary)'}} className="text-xl font-semibold text-gray-700 flex items-center">
            <BrainCircuit className="mr-3 text-orange-500" size={24} />
            Focus Score
          </h2>
          <p style={{color: 'var(--text-primary)'}} className="text-sm text-gray-500">Today's focus quality</p>
        </div>
        <div style={{backgroundColor: quality.bgColor}} className={`text-sm font-bold px-3 py-1 rounded-full ${quality.color.replace('text-', 'bg-').replace('500', '100')} ${quality.color}`}>
          {quality.label}
        </div>
      </div>
      
      <div style={{color: 'var(--text-primary)'}} className="flex items-end gap-12 mt-6">
        <div style={{color: 'var(--text-primary)'}} className="text-center">
          <p style={{color: 'var(--text-primary)'}}  className="text-6xl font-bold text-gray-800">{todayScore}</p>
          <p style={{color: 'var(--text-primary)'}} className="text-sm font-medium text-gray-500">points</p>
        </div>
        
        <div className="flex-1 flex items-end justify-between h-24">
          {weeklyScores.map((score, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-3/4 bg-orange-200 hover:bg-orange-400 rounded-t-md transition-all"
                style={{ height: `${(score / maxScore) * 100}%` }}
              ></div>
              <span style={{color: 'var(--text-primary)'}} className="text-xs font-medium text-gray-400 mt-2">
                {'SMTWTFS'[new Date().getDay() - (6 - index)]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FocusScore;