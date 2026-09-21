"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// The "notice board" itself — starts empty, gets filled by the Provider below.
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Firebase Auth user object (or null)
  const [role, setRole] = useState(null);        // "resident" | "guard" | "admin" | null
  const [profile, setProfile] = useState(null);  // full Firestore user document
  const [loading, setLoading] = useState(true);  // true until we know the final answer

  useEffect(() => {
    // onAuthStateChanged fires immediately with the current login state,
    // and again automatically whenever the user logs in or out.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          // Look up this user's role document: users/{their UID}
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setRole(data.role || null);
            setProfile(data);
          } else {
            // Logged into Firebase Auth, but no matching Firestore profile.
            // Treat as "no role" rather than crashing — handled explicitly
            // by pages/components that check role.
            setRole(null);
            setProfile(null);
          }
        } catch (err) {
          console.error("Failed to fetch user role:", err);
          setRole(null);
          setProfile(null);
        }
      } else {
        // Logged out
        setUser(null);
        setRole(null);
        setProfile(null);
      }

      setLoading(false);
    });

    // Cleanup: stop listening when this component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Small helper hook so pages write: const { user, role, loading } = useAuth();
// instead of importing useContext + AuthContext everywhere.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return context;
}
