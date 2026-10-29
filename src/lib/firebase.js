import { initializeApp } from 'firebase/app'
import { getFirestore, doc, onSnapshot } from 'firebase/firestore'

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseReady = Boolean(cfg.apiKey && cfg.projectId)
const db = firebaseReady ? getFirestore(initializeApp(cfg)) : null

// Canlı dinleme (onSnapshot): panelden kaydedilince pano anında güncellenir.
// Ayarlar tek belgede tutulur: config/pano
export function listenConfig(cb) {
  if (!db) return () => {}
  return onSnapshot(doc(db, 'config', 'pano'), (s) => s.exists() && cb(s.data()))
}
