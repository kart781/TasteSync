// Phone sign-in. Firebase in development and store builds; a fake OTP in Expo Go
// when EXPO_PUBLIC_DEV_AUTH=true (the API must also run with DEV_AUTH=true).
import * as SecureStore from 'expo-secure-store';

export type PhoneAuth = {
  sendCode(phone: string): Promise<(code: string) => Promise<void>>;
  getToken(): Promise<string | null>;
  signOut(): Promise<void>;
};

const DEV_CODE = '123456';
const DEV_KEY = 'devPhone';

const devAuth: PhoneAuth = {
  async sendCode(phone) {
    return async (code) => {
      if (code !== DEV_CODE) throw new Error(`Wrong code. In dev sign-in the code is ${DEV_CODE}.`);
      await SecureStore.setItemAsync(DEV_KEY, phone);
    };
  },
  async getToken() {
    const phone = await SecureStore.getItemAsync(DEV_KEY);
    return phone ? `dev:dev-${phone.replace(/\D/g, '')}:${phone}` : null;
  },
  signOut: () => SecureStore.deleteItemAsync(DEV_KEY),
};

function firebaseAuth(): PhoneAuth {
  // Required lazily: the native module does not exist in Expo Go.
  const fb = require('@react-native-firebase/auth') as typeof import('@react-native-firebase/auth');
  const auth = fb.getAuth();
  // Firebase restores the signed-in user asynchronously at startup; wait for the first answer.
  const restored = new Promise<void>((resolve) => {
    const unsubscribe = fb.onAuthStateChanged(auth, () => {
      unsubscribe();
      resolve();
    });
  });
  return {
    async sendCode(phone) {
      const confirmation = await fb.signInWithPhoneNumber(auth, phone);
      return async (code) => {
        await confirmation.confirm(code);
      };
    },
    async getToken() {
      await restored;
      return auth.currentUser ? fb.getIdToken(auth.currentUser) : null;
    },
    signOut: () => fb.signOut(auth),
  };
}

export const phoneAuth: PhoneAuth = process.env.EXPO_PUBLIC_DEV_AUTH === 'true' ? devAuth : firebaseAuth();
