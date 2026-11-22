import { getFirebaseStorage, isMockFallback } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export function validateImageFile(file: File | { name: string; type: string; size?: number } | null | undefined): boolean {
  if (!file || !ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`INVALID_MEDIA_TYPE: File type "${file?.type}" is not supported. Upload JPG, PNG, or WebP.`);
  }
  if (file.size && file.size > MAX_FILE_SIZE) {
    throw new Error('FILE_TOO_LARGE: File exceeds maximum allowed size of 8MB.');
  }
  return true;
}

export async function uploadMedia(file: File, path: string): Promise<string> {
  validateImageFile(file);

  const storage = getFirebaseStorage();
  if (storage && !isMockFallback) {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (err) {
      console.warn('Firebase storage upload failed; creating local preview URL:', err);
    }
  }

  // Fallback: create object URL or base64 data URL
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
      try {
        const objectUrl = window.URL.createObjectURL(file);
        resolve(objectUrl);
        return;
      } catch (_) {}
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}
