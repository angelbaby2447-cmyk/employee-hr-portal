import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, Auth, UserCredential } from 'firebase/auth';

const STORAGE_KEY = 'hr_firebase_config';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

// Get saved or environment configuration
export function getStoredFirebaseConfig(): FirebaseConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.authDomain && parsed.projectId) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors
  }

  // Check Vite environment variables
  if (
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  ) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
    };
  }

  return null;
}

export function saveFirebaseConfig(config: FirebaseConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearFirebaseConfig() {
  localStorage.removeItem(STORAGE_KEY);
}

// Initialize Firebase App
let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function getFirebaseServices(): { app: FirebaseApp; auth: Auth } | null {
  const config = getStoredFirebaseConfig();
  if (!config) return null;

  try {
    if (!firebaseApp) {
      if (getApps().length > 0) {
        firebaseApp = getApp();
      } else {
        firebaseApp = initializeApp(config);
      }
    }
    if (!firebaseAuth) {
      firebaseAuth = getAuth(firebaseApp);
    }
    return { app: firebaseApp, auth: firebaseAuth };
  } catch (err) {
    console.warn('Firebase initialization warning:', err);
    return null;
  }
}

export async function executeGoogleSignIn(): Promise<{
  idToken: string;
  email: string;
  displayName: string;
  photoUrl: string;
  uid: string;
}> {
  const services = getFirebaseServices();
  if (!services) {
    throw new Error('CONFIG_REQUIRED');
  }

  const credential: UserCredential = await signInWithPopup(services.auth, googleProvider);
  const user = credential.user;
  const idToken = await user.getIdToken();

  return {
    idToken,
    email: user.email || '',
    displayName: user.displayName || '',
    photoUrl: user.photoURL || '',
    uid: user.uid
  };
}
