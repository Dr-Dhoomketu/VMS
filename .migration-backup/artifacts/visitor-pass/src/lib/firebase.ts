import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyB-kQ2THduN9AShlztVfnr0EfFsRNMmSdo',
  authDomain: 'vms-shaurya.firebaseapp.com',
  projectId: 'vms-shaurya',
  storageBucket: 'vms-shaurya.firebasestorage.app',
  messagingSenderId: '23412958304',
  appId: '1:23412958304:web:03ec4573cf2a44b62f8f05',
  measurementId: 'G-HCNFDDB5QF',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
