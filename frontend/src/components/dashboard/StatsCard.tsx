// src/components/dashboard/StatCard.tsx
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change, changeType }) => {
  const isIncrease = changeType === 'increase';
  const changeColor = isIncrease ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col justify-between">
      <div className="flex items-center space-x-3 mb-2">
        <div className="text-orange-500">{icon}</div>
        <h3 className="text-md font-medium text-gray-500">{title}</h3>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        <p className={`text-sm font-medium ${changeColor}`}>
          {change} vs last week
        </p>
      </div>
    </div>
  );
};

export default StatCard;