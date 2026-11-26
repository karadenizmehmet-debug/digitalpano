import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, collection, onSnapshot, setDoc, updateDoc, getDoc, getDocFromServer, deleteDoc } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword, signOut, onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile } from 'firebase/auth'

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
// Haber başlıkları (config/haber): scripts/haber.mjs yazar, pano canlı dinler.
export const listenNews = (cb) => onSnapshot(doc(db, 'config', 'haber'),
  (s) => { const d = s.exists() ? s.data() : null; cb(d && Array.isArray(d.items) ? d.items.filter((x) => typeof x === 'string' && x) : []) },
  (e) => console.warn('Firestore haber:', e.message))
// Sunucudan tek seferlik doğrulanmış okuma (önbellek değil). Panel yalnızca bundan sonra düzenlemeye açılır.
export const fetchServerConfig = async () => { const s = await getDocFromServer(ref); return s.exists() ? s.data() : null }
export const saveConfig = (data) => setDoc(ref, JSON.parse(JSON.stringify(data)))
export const login = (email, pw) => signInWithEmailAndPassword(auth, email, pw)
// Google ile giriş: önce açılır pencere; tarayıcı engellerse sayfa yönlendirmesine geçer.
export const loginGoogle = async () => {
  const p = new GoogleAuthProvider()
  p.setCustomParameters({ prompt: 'select_account' })
  try { return await signInWithPopup(auth, p) }
  catch (e) { if (/popup-blocked|operation-not-supported/.test(e.code || '')) return signInWithRedirect(auth, p); throw e }
}
getRedirectResult(auth).catch(() => {})

// Yönetici: firestore.rules içindeki admin() listesiyle AYNI olmalı.
export const ADMINS = ['j9o0PbL1OHQfxgX4wDrdf1G1qXj2']
export const isAdmin = (u) => !!u && ADMINS.includes(u.uid)
export const hasPassword = (u) => !!u && (u.providerData || []).some((x) => x.providerId === 'password')

// Yetki kayıtları (kullanicilar/{uid}): durum = bekliyor | onayli | red. Durumu yalnızca yönetici değiştirir.
const uref = (uid) => doc(db, 'kullanicilar', uid)
// cb(kayıt|null, fromCache). Hata olursa { durum: 'hata' } döner.
export const listenMe = (uid, cb) => onSnapshot(uref(uid), { includeMetadataChanges: true },
  (s) => cb(s.exists() ? s.data() : null, s.metadata.fromCache),
  (e) => cb({ durum: 'hata', msg: e.code || e.message }, false))
export const requestAccess = (u) => setDoc(uref(u.uid), { durum: 'bekliyor', ad: u.displayName || '', eposta: u.email || '', foto: u.photoURL || '', zaman: Date.now() })
export const listenUsers = (cb, onErr) => onSnapshot(collection(db, 'kullanicilar'),
  (s) => cb(s.docs.map((d) => ({ uid: d.id, ...d.data() }))),
  (e) => { console.warn('Firestore kullanicilar:', e.message); if (onErr) onErr(e.code || e.message) })
export const setUserStatus = (uid, durum) => updateDoc(uref(uid), { durum, karar: Date.now() })
export const removeUser = (uid) => deleteDoc(uref(uid))
export const logout = () => signOut(auth)
export const changePassword = async (oldPw, newPw) => {
  const u = auth.currentUser
  await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, oldPw))
  await updatePassword(u, newPw)
}
export const setDisplayName = (name) => updateProfile(auth.currentUser, { displayName: name })
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
