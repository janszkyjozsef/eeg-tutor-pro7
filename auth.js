
// auth.js (type=module): Firebase Google Sign-In + Firestore profile sync + UI gating
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
         getRedirectResult, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// Filled from user's Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyC8gYhWkvD1u4VeQBWvHliTcwZjKiuRyJc",
  authDomain: "fir-10075.firebaseapp.com",
  projectId: "fir-10075",
  storageBucket: "fir-10075.firebasestorage.app",
  messagingSenderId: "839545704317",
  appId: "1:839545704317:web:099f74aede73688ba5c614"
};

const cover = document.getElementById('cover');
const appWrap = document.getElementById('app');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const statusEl = document.getElementById('status');
const continueBtn = document.getElementById('continueBtn');
if(continueBtn) continueBtn.addEventListener('click', ()=>{ showApp(); });

let app=null, auth=null, provider=null, db=null, userDocRef=null;

function setStatus(txt){ if(statusEl) statusEl.textContent = txt; }
function showApp(){ if(appWrap) appWrap.style.display='block'; if(cover) cover.style.display='none'; }
function showCover(){ if(appWrap) appWrap.style.display='none'; if(cover) cover.style.display='block'; }

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
  db = getFirestore(app);
  setStatus('Nincs bejelentkezve. / Not signed in.');
} catch (e) {
  console.warn('Firebase init failed:', e);
  setStatus('⚠️ Firebase config hiányzik. Offline mód.'); showApp();
}

async function doLogin(){
  if(!auth){ setStatus('Firebase nincs inicializálva.'); return; }
  try{
    await signInWithPopup(auth, provider);
  }catch(e){
    const msg = String(e?.message||'');
    if(msg.toLowerCase().includes('popup')){
      try{ await signInWithRedirect(auth, provider); }
      catch(err){ console.warn('Redirect login failed:', err); setStatus('Login hiba: '+err.code); }
    }else if(e.code === 'auth/unauthorized-domain'){
      console.warn('Unauthorized domain for Firebase login');
      setStatus('⚠️ Domain nem engedélyezett / Domain not authorized');
      showCover();
    }else{
      console.warn('Login failed:', e);
      setStatus('Login hiba: '+(e.code||e.message));
      showCover();
    }
  }
}
async function doLogout(){ if(!auth) return; await signOut(auth); }

if(loginBtn) loginBtn.addEventListener('click', doLogin);
if(logoutBtn) logoutBtn.addEventListener('click', doLogout);

if(auth){ getRedirectResult(auth).catch(e=>console.warn('Redirect result:', e)); }

if(auth){
  onAuthStateChanged(auth, async (user)=>{
      if(!user){
        showCover();
        setStatus('Nincs bejelentkezve. / Not signed in.');
        window.firebaseUser = null;
        window.onProfileUpdate = null;
        return;
      }
    window.firebaseUser = user;
    setStatus(`Bejelentkezve: ${user.displayName || user.email}  (UID: ${user.uid})`);
    showApp();

    try{
      userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);
      if(snap.exists()){
        const data = snap.data();
        if(window.applyProfile) window.applyProfile(data);
      }else{
        const initial = (window.getProfile? window.getProfile() : {XP:0,BEST:0,STREAK:0,ADVANCED:false});
        await setDoc(userDocRef, {
          ...initial,
          name: user.displayName || '',
          email: user.email || '',
          createdAt: new Date().toISOString()
        });
      }
      window.onProfileUpdate = async function(profile){
        try{
          if(!userDocRef) return;
          await updateDoc(userDocRef, {
            XP: profile.XP|0,
            BEST: profile.BEST|0,
            STREAK: profile.STREAK|0,
            ADVANCED: !!profile.ADVANCED,
            updatedAt: new Date().toISOString()
          });
        }catch(e){
          console.warn('Profile sync failed:', e);
        }
      };
    }catch(e){
      console.warn('Firestore unavailable, using local-only profile:', e);
      window.onProfileUpdate = null;
    }
  });
}
