import { initializeApp } from 'firebase/app'
import { cfgIdOf, imageRefs, okulFromPath, replaceRefs } from './okul.js'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, collection, onSnapshot, setDoc, updateDoc, getDoc, getDocFromServer, deleteDoc } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth'

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
// Hangi okul: adres yolundan (digitalpano-84947.web.app/okul2). Kök = ana okul (config/pano).
const BASE = import.meta.env.BASE_URL || '/'
export const OKUL = okulFromPath(location.pathname, BASE)
export const CFG_ID = cfgIdOf(OKUL)
export const schoolUrl = (yol) => location.origin + BASE + (yol || '')
const ref = doc(db, 'config', CFG_ID)

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
export const setUserStatus = (uid, durum, extra) => updateDoc(uref(uid), { durum, karar: Date.now(), ...(extra || {}) })
export const setUserSchools = (uid, okullar) => updateDoc(uref(uid), { okullar })

// Okul listesi (okullar/{ayar belgesi kimliği}): { ad, yol, zaman }. Herkes okur, yalnızca yönetici yazar.
export const listenSchools = (cb) => onSnapshot(collection(db, 'okullar'),
  (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
  (e) => { console.warn('Firestore okullar:', e.message); cb([]) })
// Yeni okul: kaynak okulun ayarları kopyalanır (görseller de kopyalanır; biri silinince öbürü etkilenmesin), ad değişir, logo gelmez.
export async function createSchool(yol, ad, srcId) {
  const id = cfgIdOf(yol)
  if ((await getDocFromServer(doc(db, 'config', id))).exists()) throw new Error('Bu adreste zaten bir okul var.')
  let src = null
  if (srcId) { const s = await getDocFromServer(doc(db, 'config', srcId)); src = s.exists() ? s.data() : null }
  // Ana okul listede yoksa adıyla birlikte bir kez kaydedilir (diğer okullardan bakınca da adı görünsün)
  if (!(await getDocFromServer(doc(db, 'okullar', 'pano'))).exists()) {
    const m = srcId === 'pano' ? src : (await getDocFromServer(doc(db, 'config', 'pano'))).data()
    await setDoc(doc(db, 'okullar', 'pano'), { ad: (m && m.name) || 'Ana okul', yol: '', zaman: 0 })
  }
  let cfg = src ? JSON.parse(JSON.stringify(src)) : { mods: [], sd: [], al: { on: false } }
  delete cfg.logoId; delete cfg.logo  // logo okula özeldir; yeni okul logosuz başlar
  const map = {}
  let n = 0
  for (const old of imageRefs(cfg)) {
    const v = await loadImage(old)
    if (!v) continue
    const nid = 'c' + Date.now().toString(36) + (n++).toString(36)
    await saveImage(nid, v)
    map[old] = nid
  }
  cfg = replaceRefs(cfg, map)
  cfg.name = ad
  cfg.rev = Date.now()
  if (cfg.al) cfg.al = { ...cfg.al, on: false }  // acil duyuru yeni okula taşınmasın
  await setDoc(doc(db, 'config', id), cfg)
  await setDoc(doc(db, 'okullar', id), { ad, yol, zaman: Date.now() })
  return id
}
export const removeSchool = async (id) => { await deleteDoc(doc(db, 'okullar', id)); await deleteDoc(doc(db, 'config', id)) }
export const removeUser = (uid) => deleteDoc(uref(uid))
export const logout = () => signOut(auth)
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
