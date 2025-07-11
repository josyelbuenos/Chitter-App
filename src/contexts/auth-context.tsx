'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { ref, onValue, Unsubscribe } from 'firebase/database';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { createNewUserProfile } from '@/lib/user';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  totalUnreadCount: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  useEffect(() => {
    let profileUnsubscribe: Unsubscribe | undefined;

    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
      
      setUser(firebaseUser);

      if (firebaseUser) {
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        profileUnsubscribe = onValue(
          userRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              const profileData = { uid: firebaseUser.uid, ...snapshot.val() };
              setUserProfile(profileData);
              
              const counts = profileData.unreadCounts || {};
              const total = Object.values(counts).reduce((sum: number, count) => {
                const numericCount = Number(count);
                return sum + (isNaN(numericCount) ? 0 : numericCount);
              }, 0);
              setTotalUnreadCount(total);

              setLoading(false);
            } else {
              // Profile doesn't exist, create it.
              try {
                  const username = firebaseUser.email?.split('@')[0];
                  if (username) {
                    await createNewUserProfile(firebaseUser.uid, username);
                  } else {
                    setUserProfile(null);
                    setLoading(false);
                  }
              } catch (error) {
                  console.error("Failed to create user profile on-the-fly:", error);
                  setUserProfile(null);
                  setLoading(false);
              }
            }
          },
          (error) => {
            console.error("Firebase onValue error:", error);
            setUserProfile(null);
            setLoading(false);
          }
        );
      } else {
        setUserProfile(null);
        setTotalUnreadCount(0);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, totalUnreadCount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
