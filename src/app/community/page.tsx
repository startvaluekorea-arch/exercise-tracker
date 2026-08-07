'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CommunityFeedLog } from '@/lib/types';
import { getCommunityFeed } from '@/lib/db';
import CommunityFeedCard from '@/components/CommunityFeedCard';
import AuthModal from '@/components/AuthModal';
import { Users, MapPin, Navigation, RefreshCw, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

export default function CommunityPage() {
  const { user, profile, updateUserLocation } = useAuth();
  const [feedLogs, setFeedLogs] = useState<CommunityFeedLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const fetchFeed = useCallback(async () => {
    setIsLoading(true);
    try {
      const logs = await getCommunityFeed(
        user?.id,
        profile?.latitude,
        profile?.longitude
      );
      setFeedLogs(logs);
    } catch (err) {
      console.error('Fetch community feed error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, profile?.latitude, profile?.longitude]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // 브라우저 위치 정보 동의 및 갱신
  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      alert('브라우저가 위치 서비스를 지원하지 않습니다.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        if (user) {
          await updateUserLocation(latitude, longitude, '현재 내 위치');
        }
        setIsLocating(false);
        fetchFeed();
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('위치 정보를 가져올 수 없습니다. 브라우저 위치 권한을 확인해주세요.');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
            <Users className="w-4 h-4" />
            <span>이웃 피드 & 커뮤니티</span>
          </div>
          <h1 className="text-lg font-black text-slate-100 mt-0.5">
            떨어져 있는 이웃들의 운동 일지
          </h1>
        </div>

        <button
          onClick={fetchFeed}
          disabled={isLoading}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700"
          title="새로고침"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 위치 등록/갱신 배너 */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">
              {profile?.latitude ? '현재 내 위치 등록됨' : '내 위치 등록 시 정확한 거리가 표시됩니다'}
            </span>
            <span className="text-[10px] text-slate-400 block">
              개인정보 보호를 위해 대략적인 직선 거리만 표출됩니다
            </span>
          </div>
        </div>

        <button
          onClick={handleUpdateLocation}
          disabled={isLocating}
          className="flex items-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all shrink-0"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5" />
              <span>위치 갱신</span>
            </>
          )}
        </button>
      </div>

      {/* RLS 안심 안내 뱃지 */}
      <div className="flex items-center gap-2 p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Supabase RLS 보안으로 [공개] 설정된 일지만 안전하게 피드에 공유됩니다.</span>
      </div>

      {/* 이웃 피드 리스트 */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-xs">근처 이웃들의 일지를 찾아오는 중입니다...</span>
        </div>
      ) : feedLogs.length > 0 ? (
        <div className="space-y-4">
          {feedLogs.map((log) => (
            <CommunityFeedCard
              key={log.id}
              log={log}
              onAuthRequired={() => setShowAuthModal(true)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-2">
          <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">아직 공개된 이웃 일지가 없습니다</h3>
          <p className="text-xs text-slate-500">
            오늘 작성한 내 일지의 [🌐 이웃 피드 공개] 버튼을 눌러 첫 피드의 주인공이 되어보세요!
          </p>
        </div>
      )}

      {/* 로그인 모달 */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
