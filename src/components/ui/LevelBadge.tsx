'use client';

import { SkillLevel, SKILL_LEVEL_LABELS } from '@/types';
import { clsx } from 'clsx';

interface LevelBadgeProps {
  level: SkillLevel;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
}

const levelStyles: Record<SkillLevel, { gradient: string; border: string; text: string }> = {
  0: { gradient: 'from-green-400 to-emerald-600', border: 'border-green-200', text: 'text-green-700' },
  1: { gradient: 'from-blue-400 to-blue-600', border: 'border-blue-200', text: 'text-blue-700' },
  2: { gradient: 'from-yellow-400 to-amber-600', border: 'border-yellow-200', text: 'text-yellow-700' },
  3: { gradient: 'from-orange-400 to-red-500', border: 'border-orange-200', text: 'text-orange-700' },
  4: { gradient: 'from-purple-400 to-purple-700', border: 'border-purple-200', text: 'text-purple-700' },
  5: { gradient: 'from-pink-400 to-rose-600', border: 'border-pink-200', text: 'text-pink-700' },
};

const sizeStyles = {
  sm: { badge: 'w-8 h-8 text-sm', label: 'text-xs ml-1.5', wrapper: 'gap-1' },
  md: { badge: 'w-12 h-12 text-lg', label: 'text-sm ml-2', wrapper: 'gap-2' },
  lg: { badge: 'w-16 h-16 text-2xl', label: 'text-base ml-3', wrapper: 'gap-3' },
  xl: { badge: 'w-24 h-24 text-4xl', label: 'text-lg ml-4', wrapper: 'gap-4' },
};

export default function LevelBadge({
  level,
  size = 'md',
  showLabel = true,
  animate = false,
  className,
}: LevelBadgeProps) {
  const style = levelStyles[level];
  const s = sizeStyles[size];

  return (
    <div className={clsx('inline-flex items-center', s.wrapper, className)}>
      <div
        className={clsx(
          'rounded-full flex items-center justify-center font-bold text-white shadow-lg',
          `bg-gradient-to-br ${style.gradient}`,
          s.badge,
          animate && 'animate-bounce-in'
        )}
      >
        {level}
      </div>
      {showLabel && (
        <div className={clsx('font-semibold', style.text, s.label)}>
          <div className="text-xs text-gray-500 font-normal">Level {level}</div>
          <div>{SKILL_LEVEL_LABELS[level]}</div>
        </div>
      )}
    </div>
  );
}

// 水平プログレスバー付きレベル表示
export function LevelProgress({
  currentLevel,
  targetLevel = 5,
}: {
  currentLevel: SkillLevel;
  targetLevel?: SkillLevel;
}) {
  const percentage = (currentLevel / targetLevel) * 100;
  const style = levelStyles[currentLevel];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <LevelBadge level={currentLevel} size="sm" />
        <span className="text-sm text-gray-500">目標: Level {targetLevel}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full bg-gradient-to-r transition-all duration-700',
            style.gradient
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        {Array.from({ length: targetLevel + 1 }, (_, i) => (
          <div
            key={i}
            className={clsx(
              'w-1.5 h-1.5 rounded-full',
              i <= currentLevel ? `bg-gradient-to-br ${levelStyles[i as SkillLevel].gradient}` : 'bg-gray-300'
            )}
          />
        ))}
      </div>
    </div>
  );
}
