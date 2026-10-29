import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, onSnapshot, setDoc, getDoc, getDocFromServer, deleteDoc } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'

// Web yapılandırması gizli değildir (güvenlik Firestore kurallarındadır).
// API anahtarını Google Cloud > Credentials'tan kendi alan adınıza kısıtlayın.
const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB9mFJzlFR-Bm87jn9WbzHlVu-_kzdN1c4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'digitalpano-84947.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'digitalpano-84947',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:598372381865:web:d124ed651a6ba0955a65b8',
}

const app = initializeApp(cfg)
// Ayarlar cihazda saklanır: internet kesilse ya da ekran yeniden başlasa son ayarlarla açılır
let db
// Çok sekmeli önbellek: panel ve pano aynı tarayıcıda birlikte açık olabilir. Ağ engelliyse uzun yoklamaya otomatik geçer.
try { db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }), experimentalAutoDetectLongPolling: true }) }
catch { db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true }) }
const auth = getAuth(app)
const ref = doc(db, 'config', 'pano')

// Canlı dinleme: panelden yayınlanınca pano anında güncellenir.
// cb(data|null, { fromCache }) — fromCache=false: ayarlar sunucudan doğrulandı (panelin yazması ancak bundan sonra güvenli)
export const listenConfig = (cb) => onSnapshot(ref, { includeMetadataChanges: true },
  (s) => cb(s.exists() ? s.data() : null, { fromCache: s.metadata.fromCache }),
  (e) => console.warn('Firestore:', e.message))
// Sunucudan tek seferlik doğrulanmış okuma (önbellek değil). Panel yalnızca bundan sonra düzenlemeye açılır.
export const fetchServerConfig = async () => { const s = await getDocFromServer(ref); return s.exists() ? s.data() : null }
export const saveConfig = (data) => setDoc(ref, JSON.parse(JSON.stringify(data)))
export const login = (email, pw) => signInWithEmailAndPassword(auth, email, pw)
export const logout = () => signOut(auth)
export const changePassword = async (oldPw, newPw) => {
  const u = auth.currentUser
  await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, oldPw))
  await updatePassword(u, newPw)
}
export const onUser = (cb) => onAuthStateChanged(auth, cb)

// Görseller ayrı belgelerde tutulur (images/{id}); ayar belgesi 1 MB sınırına takılmasın diye.
const imgCache = new Map()
export async function loadImage(id) {
  if (imgCache.has(id)) return imgCache.get(id)
  const s = await getDoc(doc(db, 'images', id))
  const v = s.exists() ? s.data().src : ''
  imgCache.set(id, v)
  return v
}
export const saveImage = (id, src) => { imgCache.set(id, src); return setDoc(doc(db, 'images', id), { src }) }
export const removeImage = (id) => { imgCache.delete(id); return deleteDoc(doc(db, 'images', id)) }
