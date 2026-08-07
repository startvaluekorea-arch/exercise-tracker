'use client';

import { useState } from 'react';
import { CommunityFeedLog, CheerComment } from '@/lib/types';
import { formatDistanceText } from '@/lib/geoUtils';
import { toggleCheerLike, getCheerComments, addCheerComment } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Heart, MessageSquare, Send, Sparkles, UserCheck, Flame, ThumbsUp, Dumbbell } from 'lucide-react';

interface CommunityFeedCardProps {
  log: CommunityFeedLog;
  onAuthRequired: () => void;
}

export default function CommunityFeedCard({ log, onAuthRequired }: CommunityFeedCardProps) {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState<number>(log.likes_count || 0);
  const [hasLiked, setHasLiked] = useState<boolean>(log.user_has_liked || false);
  const [activeReaction, setActiveReaction] = useState<string>(log.user_like_reaction || '💪');

  const [showComments, setShowComments] = useState<boolean>(false);
  const [comments, setComments] = useState<CheerComment[]>([]);
  const [commentsCount, setCommentsCount] = useState<number>(log.comments_count || 0);
  const [newComment, setNewComment] = useState<string>('');
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);

  // 응원(좋아요) 토글
  const handleLikeClick = async (reaction: string = '💪') => {
    if (!user) {
      onAuthRequired();
      return;
    }
    setActiveReaction(reaction);
    const prevLiked = hasLiked;
    setHasLiked(!prevLiked);
    setLikesCount((prev) => (prevLiked ? Math.max(0, prev - 1) : prev + 1));

    if (log.id) {
      const res = await toggleCheerLike(log.id, user.id, reaction);
      setHasLiked(res.liked);
      setLikesCount(res.count);
    }
  };

  // 댓글 토글 및 조회
  const handleToggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);

    if (nextState && log.id && comments.length === 0) {
      setIsLoadingComments(true);
      const data = await getCheerComments(log.id);
      setComments(data);
      setIsLoadingComments(false);
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) {
      onAuthRequired();
      return;
    }

    setIsSubmittingComment(true);
    if (log.id) {
      const created = await addCheerComment(log.id, user.id, newComment.trim());
      if (created) {
        setComments((prev) => [...prev, created]);
        setCommentsCount((prev) => prev + 1);
        setNewComment('');
      }
    }
    setIsSubmittingComment(false);
  };

  const distanceLabel = formatDistanceText(log.distance_km);
  const username = log.user_profile?.username || '이웃 운동러';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5 transition-all hover:border-slate-700">
      {/* 1. 상단 프로필 & 거리 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-0.5 shadow-md flex items-center justify-center font-black text-slate-950 text-sm">
            {username.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-100 text-sm">{username}</h4>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                {log.log_date}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>{distanceLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 오늘 수행한 운동 요약 */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span className="flex items-center gap-1">
            <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
            수행 실적
          </span>
          {log.weight && <span className="text-cyan-400">체중: {log.weight}kg</span>}
        </div>

        <div className="space-y-1.5">
          {log.records && log.records.length > 0 ? (
            log.records.map((r, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium">{r.category_name}</span>
                <span className="text-emerald-400 font-bold">
                  {r.unit_type === 'SET_REPS' && `${r.total_reps}회`}
                  {r.unit_type === 'DISTANCE_TIME' && `${r.distance_km}km`}
                  {r.unit_type === 'DURATION' && `${r.duration_seconds}초`}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">기록된 운동 항목이 있습니다.</p>
          )}
        </div>

        {log.memo && (
          <p className="text-xs text-slate-300 italic pt-1 border-t border-slate-800/80">
            "{log.memo}"
          </p>
        )}
      </div>

      {/* 3. 소셜 인터랙션 버튼 바 (응원하기 & 댓글 버튼) */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1">
          {/* 주요 응원 스탬프 버튼 */}
          <button
            onClick={() => handleLikeClick('💪')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              hasLiked
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <span className="text-sm">{hasLiked ? activeReaction : '💪'}</span>
            <span>응원하기</span>
            <strong className="ml-0.5 text-slate-200">{likesCount}</strong>
          </button>

          {/* 리액션 이모지 빠른 선택 */}
          <div className="flex items-center gap-0.5">
            {['💪', '🔥', '👏', '❤️'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleLikeClick(emoji)}
                className="hover:scale-125 transition-transform p-1 text-xs"
                title={`'${emoji}' 응원 전달`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleToggleComments}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-xl text-xs font-bold transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
          <span>응원댓글</span>
          <strong className="text-slate-200">{commentsCount}</strong>
        </button>
      </div>

      {/* 4. 응원 댓글 토글 영역 */}
      {showComments && (
        <div className="pt-3 border-t border-slate-800 space-y-3 animate-fade-in">
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {isLoadingComments ? (
              <p className="text-xs text-slate-500 text-center py-2">댓글을 불러오는 중...</p>
            ) : comments.length > 0 ? (
              comments.map((c) => (
                <div key={c.id} className="bg-slate-950/80 rounded-lg p-2.5 text-xs space-y-0.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold text-slate-200">{c.user_name}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300">{c.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-2">
                첫 응원 댓글을 남겨 이웃에게 활력을 전해보세요! 💬
              </p>
            )}
          </div>

          {/* 댓글 작성 입력 폼 */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder={user ? '따뜻한 응원의 한마디를 남겨보세요...' : '로그인 후 작성 가능합니다'}
              disabled={!user || isSubmittingComment}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!user || !newComment.trim() || isSubmittingComment}
              className="bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
