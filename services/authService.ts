import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { firebaseConfig } from "../firebaseConfig";
import { UserProfile, HistoryItem, AnalysisResult } from "../types";

// Initialize Firebase
// Note: This might fail if the user hasn't put in valid config. We wrap in try/catch to prevent app crash.
let auth: any;
let db: any;

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase not initialized. Auth features disabled.", e);
}

export const loginWithGoogle = async (): Promise<UserProfile> => {
  if (!auth) throw new Error("Firebase Auth not configured.");
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL
  };
};

export const logoutUser = async () => {
  if (!auth) return;
  await signOut(auth);
};

export const subscribeToAuthChanges = (callback: (user: UserProfile | null) => void) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      callback({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      });
    } else {
      callback(null);
    }
  });
};

export const saveToHistory = async (userId: string, url: string, analysis: AnalysisResult) => {
  if (!db) return;
  try {
    await addDoc(collection(db, "history"), {
      userId,
      url,
      timestamp: Timestamp.now(),
      title: analysis.contentIdeas[0]?.title || "YouTube Analysis",
      summary: analysis.summary.substring(0, 100) + "...",
      sentiment: analysis.sentiment
    });
  } catch (e) {
    console.error("Error saving history:", e);
  }
};

export const getHistory = async (userId: string): Promise<HistoryItem[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "history"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as HistoryItem));
  } catch (e) {
    console.error("Error fetching history:", e);
    return [];
  }
};