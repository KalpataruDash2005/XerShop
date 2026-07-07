import { initializeApp, getApps } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, PhoneAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDcaG87ZDF-wobfrnYXXGA0sCXZ4WmRB40",
  authDomain: "printhub-7c7f5.firebaseapp.com",
  projectId: "printhub-7c7f5",
  storageBucket: "printhub-7c7f5.firebasestorage.app",
  messagingSenderId: "378004199164",
  appId: "1:378004199164:web:703770cdc91a5eee34e979",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
  });
};

export const sendOtp = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};

export { RecaptchaVerifier, signInWithPhoneNumber };
export type { ConfirmationResult };
