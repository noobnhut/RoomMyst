import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';

const SECRET_KEY = process.env.VITE_ENCRYPTION_KEY || 'default-dev-secret-key-change-me';

export const encryptData = (text: string): string => {
  if (!text) return '';
  return AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptData = (cipherText: string): string => {
  if (!cipherText) return '';
  try {
    const bytes = AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(encUtf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    return '';
  }
};