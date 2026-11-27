import { getFirebaseStorage, isMockFallback } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export function validateImageFile(
  file: File | { name: string; type: string; size?: number } | null | undefined
): boolean {
  if (!file || !ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      `INVALID_MEDIA_TYPE: File type "${file?.type}" is not supported. Upload JPG, PNG, or WebP.`
    );
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
      console.warn('Firebase storage upload failed; converting to portable data URL:', err);
    }
  }

  // Fallback uses a base64 DataURL so uploaded images also render cross-origin on the storefront
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Unable to read image file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed reading image file'));
    reader.readAsDataURL(file);
  });
}
