'use client';

import { clsx } from 'clsx';
import { ReactNode } from 'react';

interface ProgressCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: 'indigo' | 'green' | 'yellow' | 'red' | 'purple' | 'pink';
  progress?: number;
  className?: string;
}

const colorStyles = {
  indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100 text-indigo-600', text: 'text-indigo-700', bar: 'bg-indigo-500' },
  green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', text: 'text-green-700', bar: 'bg-green-500' },
  yellow: { bg: 'bg-yellow-50', icon: 'bg-yellow-100 text-yellow-600', text: 'text-yellow-700', bar: 'bg-yellow-500' },
  red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', text: 'text-red-700', bar: 'bg-red-500' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-700', bar: 'bg-purple-500' },
  pink: { bg: 'bg-pink-50', icon: 'bg-pink-100 text-pink-600', text: 'text-pink-700', bar: 'bg-pink-500' },
};

export default function ProgressCard({
  title,
  value,
  subtitle,
  icon,
  color = 'indigo',
  progress,
  className,
}: ProgressCardProps) {
  const c = colorStyles[color];

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className={clsx('text-2xl font-bold mt-0.5', c.text)}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {icon && (
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', c.icon)}>
            {icon}
          </div>
        )}
      </div>
      {progress !== undefined && (
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all duration-700', c.bar)}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
    </div>
  );
}
