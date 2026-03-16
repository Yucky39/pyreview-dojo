import { describe, it, expect } from 'vitest';

// verify/page.tsx からロジックを切り出してテスト
function isValidCodeFormat(code: string): boolean {
  return /^PRD-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code.toUpperCase());
}

function formatCode(value: string): string {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const parts: string[] = [];
  if (clean.length > 0) parts.push('PRD');
  if (clean.length > 0) parts.push(clean.slice(0, 4));
  if (clean.length > 4) parts.push(clean.slice(4, 8));
  if (clean.length > 8) parts.push(clean.slice(8, 12));
  return parts.join('-');
}

describe('isValidCodeFormat', () => {
  it('正しいフォーマットを valid と判定する', () => {
    expect(isValidCodeFormat('PRD-ABCD-EFGH-IJKL')).toBe(true);
    expect(isValidCodeFormat('PRD-1234-5678-90AB')).toBe(true);
    expect(isValidCodeFormat('PRD-AAAA-BBBB-CCCC')).toBe(true);
  });

  it('小文字でも valid と判定する', () => {
    expect(isValidCodeFormat('prd-abcd-efgh-ijkl')).toBe(true);
  });

  it('不正なフォーマットを invalid と判定する', () => {
    expect(isValidCodeFormat('')).toBe(false);
    expect(isValidCodeFormat('ABCD-EFGH-IJKL')).toBe(false);
    expect(isValidCodeFormat('PRD-ABC-DEFG-HIJK')).toBe(false);
    expect(isValidCodeFormat('PRD-ABCDE-FGHI-JKLM')).toBe(false);
    expect(isValidCodeFormat('PRD-ABCD-EFGH')).toBe(false);
    expect(isValidCodeFormat('XXX-ABCD-EFGH-IJKL')).toBe(false);
  });

  it('特殊文字を含む場合は invalid', () => {
    expect(isValidCodeFormat('PRD-AB!D-EFGH-IJKL')).toBe(false);
    expect(isValidCodeFormat('PRD-ABCD-EF-H-IJKL')).toBe(false);
  });
});

describe('formatCode', () => {
  it('4文字入力で PRD-XXXX 形式になる', () => {
    expect(formatCode('ABCD')).toBe('PRD-ABCD');
  });

  it('8文字入力で PRD-XXXX-XXXX 形式になる', () => {
    expect(formatCode('ABCDEFGH')).toBe('PRD-ABCD-EFGH');
  });

  it('12文字入力で PRD-XXXX-XXXX-XXXX 形式になる', () => {
    expect(formatCode('ABCDEFGHIJKL')).toBe('PRD-ABCD-EFGH-IJKL');
  });

  it('小文字を大文字化して処理する', () => {
    expect(formatCode('abcd')).toBe('PRD-ABCD');
  });

  it('特殊文字を除去して処理する', () => {
    expect(formatCode('AB-CD')).toBe('PRD-ABCD');
    expect(formatCode('ab cd')).toBe('PRD-ABCD');
  });

  it('空文字入力では空文字を返す', () => {
    expect(formatCode('')).toBe('');
  });
});
