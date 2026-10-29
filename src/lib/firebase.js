import { initializeApp } from 'firebase/app'
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'

// Web yapılandırması gizli değildir (güvenlik Firestore kurallarındadır).
// API anahtarını Google Cloud > Credentials'tan kendi alan adınıza kısıtlayın.
const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB9mFJzlFR-Bm87jn9WbzHlVu-_kzdN1c4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'digitalpano-84947.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'digitalpano-84947',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:598372381865:web:d124ed651a6ba0955a65b8',
}

const app = initializeApp(cfg)
const db = getFirestore(app)
const auth = getAuth(app)
const ref = doc(db, 'config', 'pano')

// Canlı dinleme: panelden yayınlanınca pano anında güncellenir.
export const listenConfig = (cb) => onSnapshot(ref, (s) => s.exists() && cb(s.data()), (e) => console.warn('Firestore:', e.message))
export const saveConfig = (data) => setDoc(ref, JSON.parse(JSON.stringify(data)))
export const login = (email, pw) => signInWithEmailAndPassword(auth, email, pw)
export const logout = () => signOut(auth)
export const onUser = (cb) => onAuthStateChanged(auth, cb)
