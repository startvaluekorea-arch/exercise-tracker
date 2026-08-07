'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  updateUserLocation: (latitude: number, longitude: number, locationName?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
  updateProfile: async () => false,
  updateUserLocation: async () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 프로필 정보 가져오기 또는 생성
  const fetchOrCreateProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Fetch profile error:', error);
      }

      if (data) {
        setProfile(data as UserProfile);
      } else {
        // 프로필이 없는 경우 기본 프로필 생성
        const newProfile: Partial<UserProfile> = {
          id: currentUser.id,
          username: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || '러너',
          avatar_url: currentUser.user_metadata?.avatar_url || '',
          bio: '오늘도 즐거운 운동!',
          is_public: true,
          weight_unit: 'kg',
        };

        const { data: created, error: createErr } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (!createErr && created) {
          setProfile(created as UserProfile);
        } else {
          // 로컬 데이터로 우선 세팅
          setProfile(newProfile as UserProfile);
        }
      }
    } catch (err) {
      console.error('Profile fetch exception:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 초기 세션 조회
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      if (!isMounted) return;
      setSession(initSession);
      setUser(initSession?.user ?? null);
      if (initSession?.user) {
        fetchOrCreateProfile(initSession.user);
      }
      setIsLoading(false);
    });

    // Auth 변화 감지
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchOrCreateProfile(currentSession.user);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Update profile error:', error);
        return false;
      }
      if (data) {
        setProfile(data as UserProfile);
        return true;
      }
    } catch (err) {
      console.error('Update profile exception:', err);
    }
    return false;
  };

  const updateUserLocation = async (latitude: number, longitude: number, locationName?: string): Promise<boolean> => {
    return await updateProfile({
      latitude,
      longitude,
      location_name: locationName || '현재 위치',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signOut,
        updateProfile,
        updateUserLocation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
