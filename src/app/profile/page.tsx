'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { User, LogOut, LogIn, Shield, MapPin, Edit, Check, Globe, Lock, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const startEdit = () => {
    setUsername(profile?.username || '');
    setBio(profile?.bio || '');
    setIsPublic(profile?.is_public ?? true);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile({
      username,
      bio,
      is_public: isPublic,
    });
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* 헤더 */}
      <div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
          <User className="w-4 h-4" />
          <span>마이 & 설정</span>
        </div>
        <h1 className="text-lg font-black text-slate-100 mt-0.5">
          개인 계정 & 데이터 보안 관리
        </h1>
      </div>

      {user ? (
        /* 로그인 완료 상태 카드 */
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg flex items-center justify-center font-black text-slate-950 text-lg">
                  {(profile?.username || user.email || 'U').slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-base">
                    {profile?.username || '러너'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={startEdit}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all border border-slate-700"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>편집</span>
                </button>
              )}
            </div>

            {/* 프로필 정보 또는 편집 폼 */}
            {isEditing ? (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">닉네임</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">한줄소개</label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">이웃 피드 프로필 노출</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border ${
                        isPublic ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>공개</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border ${
                        !isPublic ? 'bg-slate-700 text-emerald-400 border-slate-600' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>비공개</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>저장 완료</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 font-medium">소개:</span>
                  <span className="font-semibold">{profile?.bio || '등록된 소개가 없습니다.'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 font-medium">위치:</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile?.location_name || '미등록'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* RLS 데이터 보안 상태 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Supabase RLS 데이터 보안 격리 중</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              사용자분의 개인 운동 기록은 본인 계정 UUID로 엄격하게 보호되며, 공개 설정을 허용한 일지만 이웃 피드에 노출됩니다.
            </p>
          </div>

          {/* 로그아웃 버튼 */}
          <button
            onClick={signOut}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-rose-400 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-colors shadow"
          >
            <LogOut className="w-4 h-4" />
            <span>로그아웃하기</span>
          </button>
        </div>
      ) : (
        /* 로그인 미완료 안내 카드 */
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-100">
              로그인하여 이웃들과 동기부여를 나누세요
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Supabase Auth 로그인을 진행하면 나만의 개인 운동 데이터를 안전하게 보관하고, 떨어진 거리의 이웃에게 응원과 댓글을 보낼 수 있습니다.
            </p>
          </div>

          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>로그인 / 회원가입하기</span>
          </button>
        </div>
      )}

      {/* Auth 모달 */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
