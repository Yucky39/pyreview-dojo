import crypto from 'crypto';

// サーバーサイド暗号化ユーティリティ (AES-256-GCM)
// 環境変数 ENCRYPTION_KEY (64文字のhex = 32バイト) が必要

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY 環境変数が設定されていません');
  }
  // 64文字のhex文字列 → 32バイトのBuffer
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY は64文字のhex文字列である必要があります（32バイト）');
  }
  return Buffer.from(key, 'hex');
}

/**
 * 平文を暗号化する
 * 戻り値: "iv:encrypted:tag" (すべてhexエンコード)
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
}

/**
 * 暗号文を復号する
 * 入力: "iv:encrypted:tag" 形式
 */
export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const parts = ciphertext.split(':');

  if (parts.length !== 3) {
    throw new Error('不正な暗号文形式です');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const tag = Buffer.from(parts[2], 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * 暗号化済みかどうかを判定する（iv:encrypted:tag 形式かチェック）
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(':');
  if (parts.length !== 3) return false;
  // iv (24文字hex) : encrypted : tag (32文字hex)
  return parts[0].length === IV_LENGTH * 2 && parts[2].length === TAG_LENGTH * 2;
}
