import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LevelBadge, { LevelProgress } from '@/components/ui/LevelBadge';
import { SKILL_LEVEL_LABELS } from '@/types';

describe('LevelBadge コンポーネント', () => {
  it('レベル番号を表示する', () => {
    render(<LevelBadge level={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('showLabel=true のときにラベルテキストを表示する', () => {
    render(<LevelBadge level={2} showLabel={true} />);
    expect(screen.getByText(SKILL_LEVEL_LABELS[2])).toBeInTheDocument();
  });

  it('showLabel=false のときにラベルテキストを表示しない', () => {
    render(<LevelBadge level={2} showLabel={false} />);
    expect(screen.queryByText(SKILL_LEVEL_LABELS[2])).not.toBeInTheDocument();
  });

  it('全レベル（0〜5）で正しく表示できる', () => {
    for (let level = 0; level <= 5; level++) {
      const { unmount } = render(
        <LevelBadge level={level as 0 | 1 | 2 | 3 | 4 | 5} />
      );
      expect(screen.getByText(String(level))).toBeInTheDocument();
      unmount();
    }
  });
});

describe('LevelProgress コンポーネント', () => {
  it('currentLevel と targetLevel を表示する', () => {
    render(<LevelProgress currentLevel={2} targetLevel={5} />);
    expect(screen.getByText('目標: Level 5')).toBeInTheDocument();
  });

  it('デフォルトの targetLevel は 5', () => {
    render(<LevelProgress currentLevel={1} />);
    expect(screen.getByText('目標: Level 5')).toBeInTheDocument();
  });

  it('プログレスバーが currentLevel/targetLevel の割合になっている', () => {
    const { container } = render(
      <LevelProgress currentLevel={2} targetLevel={4} />
    );
    // 2/4 = 50%
    const bar = container.querySelector('[style*="width: 50%"]');
    expect(bar).not.toBeNull();
  });
});
