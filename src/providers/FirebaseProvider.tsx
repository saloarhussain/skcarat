import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false });

export const useAuth = () => useContext(AuthContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed. Current user:", currentUser?.email);
      try {
        setUser(currentUser);
        
        if (currentUser) {
          console.log("Checking Firestore for user doc:", currentUser.uid);
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          const isDefaultAdmin = currentUser.email === 'business.saloarhussain@gmail.com' || currentUser.email === 'minecom2024@gmail.com';
          console.log("Is default admin?", isDefaultAdmin);
          
          if (!userDoc.exists()) {
            console.log("User doc does not exist. Creating...");
            const userData: any = {
              uid: currentUser.uid,
              email: currentUser.email,
              role: isDefaultAdmin ? 'admin' : 'user',
              createdAt: serverTimestamp()
            };

            if (currentUser.displayName) userData.displayName = currentUser.displayName;
            if (currentUser.photoURL) userData.photoURL = currentUser.photoURL;

            console.log("Attempting setDoc with data:", userData);
            await setDoc(userDocRef, userData);
            console.log("User doc created successfully");
            setIsAdmin(isDefaultAdmin);
          } else {
            const data = userDoc.data();
            console.log("User doc exists. Role:", data?.role);
            setIsAdmin(data?.role === 'admin' || isDefaultAdmin);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (error: any) {
        console.error("Detailed Auth state change error:", error);
        if (error.code === 'permission-denied') {
          toast.error("Database access denied. Please ensure you created the Firestore database in 'Test Mode' or deployed the rules.");
        } else {
          toast.error("Error connecting to database: " + error.message);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
