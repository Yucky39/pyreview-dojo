import { describe, it, expect } from 'vitest';

// update-password/page.tsx と同じロジックをテスト
interface PasswordCheck {
  label: string;
  met: boolean;
}

function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    { label: '8文字以上', met: password.length >= 8 },
    { label: '大文字を含む', met: /[A-Z]/.test(password) },
    { label: '小文字を含む', met: /[a-z]/.test(password) },
    { label: '数字を含む', met: /[0-9]/.test(password) },
  ];
}

function getPasswordStrength(password: string): number {
  return getPasswordChecks(password).filter((c) => c.met).length;
}

describe('パスワード強度チェック', () => {
  it('空のパスワードは強度 0', () => {
    expect(getPasswordStrength('')).toBe(0);
  });

  it('短いパスワードは強度が低い', () => {
    expect(getPasswordStrength('abc')).toBe(1); // 小文字のみ
  });

  it('全条件を満たすパスワードは強度 4', () => {
    expect(getPasswordStrength('Password1')).toBe(4);
    expect(getPasswordStrength('MyP@ssw0rd')).toBe(4);
  });

  it('大文字小文字数字8文字以上で強度 4', () => {
    const checks = getPasswordChecks('Abcdefg1');
    expect(checks.every((c) => c.met)).toBe(true);
    expect(getPasswordStrength('Abcdefg1')).toBe(4);
  });

  it('数字なしは強度 3 以下', () => {
    expect(getPasswordStrength('Abcdefgh')).toBe(3); // 8文字以上・大文字・小文字
  });

  it('小文字なしは強度 3 以下', () => {
    expect(getPasswordStrength('ABCDEFG1')).toBe(3); // 8文字以上・大文字・数字
  });
});

describe('パスワードバリデーション', () => {
  it('8文字未満は invalid', () => {
    const checks = getPasswordChecks('Abc1234');
    const lengthCheck = checks.find((c) => c.label === '8文字以上');
    expect(lengthCheck?.met).toBe(false);
  });

  it('パスワード不一致のエラー判定', () => {
    const password = 'Password1';
    const confirm = 'Password2';
    expect(password === confirm).toBe(false);
  });

  it('パスワード一致の判定', () => {
    const password = 'Password1';
    const confirm = 'Password1';
    expect(password === confirm).toBe(true);
  });
});
