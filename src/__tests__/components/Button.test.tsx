import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/ui/Button';

describe('Button コンポーネント', () => {
  it('子要素を正しく表示する', () => {
    render(<Button>テストボタン</Button>);
    expect(screen.getByText('テストボタン')).toBeInTheDocument();
  });

  it('クリックイベントが発火する', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>クリック</Button>);
    fireEvent.click(screen.getByText('クリック'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('loading=true のときは disabled になりスピナーが表示される', () => {
    render(<Button loading>送信中</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).not.toBeNull();
  });

  it('disabled=true のときはクリックできない', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>無効ボタン</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('fullWidth=true のときは w-full クラスが付く', () => {
    render(<Button fullWidth>全幅ボタン</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('variant="danger" のときは赤系のクラスが付く', () => {
    render(<Button variant="danger">削除</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });

  it('size="lg" のときは lg サイズのクラスが付く', () => {
    render(<Button size="lg">大きいボタン</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-8');
  });

  it('size="sm" のときは sm サイズのクラスが付く', () => {
    render(<Button size="sm">小さいボタン</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3');
  });
});
