// クライアントサイド暗号化ユーティリティ (Web Crypto API + AES-GCM)
// localStorage に保存するAPIキーの暗号化に使用

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12;

// ブラウザごとに固定のキーを導出する（ユーザーのoriginベース）
async function getDerivedKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  // origin + 固定ソルトからキーを導出
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(window.location.origin + ':pyreview-dojo-local-key'),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('pyreview-dojo-salt-v1'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

/**
 * クライアントサイドで平文を暗号化する
 * 戻り値: "ENC:iv:encrypted" (hexエンコード)
 */
export async function encryptClient(plaintext: string): Promise<string> {
  if (!plaintext) return '';
  try {
    const key = await getDerivedKey();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoder = new TextEncoder();

    const encrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      encoder.encode(plaintext)
    );

    return `ENC:${arrayBufferToHex(iv.buffer)}:${arrayBufferToHex(encrypted)}`;
  } catch {
    // Web Crypto API が利用できない環境ではフォールバック
    return plaintext;
  }
}

/**
 * クライアントサイドで暗号文を復号する
 */
export async function decryptClient(ciphertext: string): Promise<string> {
  if (!ciphertext) return '';
  if (!ciphertext.startsWith('ENC:')) return ciphertext;

  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) return ciphertext;

    const key = await getDerivedKey();
    const iv = new Uint8Array(hexToArrayBuffer(parts[1]));
    const encrypted = hexToArrayBuffer(parts[2]);

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    // 復号失敗時は元の値を返す（マイグレーション対応）
    return ciphertext;
  }
}

/**
 * 暗号化済みかどうかを判定する
 */
export function isEncryptedClient(value: string): boolean {
  return value.startsWith('ENC:');
}
