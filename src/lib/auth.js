import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const provider = new GoogleAuthProvider();
const useRedirectLogin = !import.meta.env.DEV;
let redirectHandled = false;

// Local dev is flaky with redirect auth on localhost, so use popup there.
// Production keeps the nicer redirect flow without a popup.
export function loginWithGoogle() {
  if (useRedirectLogin) return signInWithRedirect(auth, provider);
  return signInWithPopup(auth, provider);
}

// First login only: create the users/{uid} profile. Never makes login "fail".
async function ensureProfile(user) {
  try {
    const profileRef = doc(db, "users", user.uid);
    const snap = await getDoc(profileRef);
    if (!snap.exists()) {
      await setDoc(profileRef, {
        email: user.email,
        name: user.displayName,
        role: "student", // the rules require exactly this on creation
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error("Could not check/create profile:", err);
  }
}

// Call once when the app starts. If we just came back from Google, finish the login.
export async function finishRedirectLogin() {
  if (!useRedirectLogin || redirectHandled) return null;
  redirectHandled = true;

  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await ensureProfile(result.user);
      return result.user;
    }
    return null;
  } catch (err) {
    console.error("Redirect sign-in failed:", err);
    return null;
  }
}

export function logout() {
  return signOut(auth);
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}