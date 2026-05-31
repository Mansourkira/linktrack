const PBKDF2_PREFIX = "pbkdf2:";
const PBKDF2_ITERATIONS = 120_000;

function isBcryptHash(hash: string): boolean {
  return hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$");
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hashWithPbkdf2(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new Uint8Array(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  return `${PBKDF2_PREFIX}${PBKDF2_ITERATIONS}:${bytesToBase64(salt)}:${bytesToBase64(new Uint8Array(derived))}`;
}

async function verifyPbkdf2(password: string, stored: string): Promise<boolean> {
  const [, iterationsPart, saltPart, hashPart] = stored.split(":");
  if (!iterationsPart || !saltPart || !hashPart) {
    return false;
  }

  const iterations = Number(iterationsPart);
  const salt = base64ToBytes(saltPart);
  const expected = base64ToBytes(hashPart);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new Uint8Array(salt),
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    expected.length * 8
  );

  const actual = new Uint8Array(derived);
  if (actual.length !== expected.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < actual.length; i++) {
    diff |= actual[i] ^ expected[i];
  }
  return diff === 0;
}

async function verifyBcrypt(password: string, hash: string): Promise<boolean> {
  const { compare } = await import("bcryptjs");
  return compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return hashWithPbkdf2(password);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  if (hash.startsWith(PBKDF2_PREFIX)) {
    return verifyPbkdf2(password, hash);
  }
  if (isBcryptHash(hash)) {
    return verifyBcrypt(password, hash);
  }
  return false;
}

export function validatePassword(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (!password || password.length < 1) {
    return { isValid: false, message: "Password is required" };
  }

  if (password.length < 4) {
    return { isValid: false, message: "Password must be at least 4 characters long" };
  }

  if (password.length > 128) {
    return { isValid: false, message: "Password must be less than 128 characters" };
  }

  return { isValid: true };
}
