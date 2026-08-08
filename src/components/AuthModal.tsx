'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Mail, Lock, User, Loader2, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        // 회원가입
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: username || email.split('@')[0],
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          setSuccessMsg('회원가입이 완료되었습니다! 로그인 상태로 시작합니다.');
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } else {
        // 로그인
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          setSuccessMsg('성공적으로 로그인되었습니다.');
          setTimeout(() => {
            onClose();
          }, 800);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || '인증 과정에서 오류가 발생했습니다.';
      if (
        msg.includes('Database error saving new user') ||
        msg.includes('already registered') ||
        msg.includes('unique constraint') ||
        msg.includes('User already registered')
      ) {
        msg = '이미 가입된 이메일 주소입니다. 하단의 [로그인] 탭을 클릭하여 로그인해 주세요.';
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 데모 계정 간편 로그인 (테스트용)
  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const demoEmail = 'runner.demo@example.com';
      const demoPassword = 'DemoPassword123!';

      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (error) {
        // 데모 계정 생성 시도
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
          options: {
            data: {
              full_name: '열정러너 데모',
            },
          },
        });
        if (signUpErr) throw signUpErr;
      }
      setSuccessMsg('데모 계정으로 간편 접속되었습니다.');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || '데모 접속 실패');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 헤더 */}
        <div className="p-6 pb-2 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 mb-3 border border-emerald-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            {isSignUp ? '운동 시작하기 (회원가입)' : '운동 피드 로그인'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isSignUp
              ? '나만의 개별 운동 데이터를 안전하게 관리하세요.'
              : '로그인하여 내 운동 기록 및 이웃 피드를 확인해보세요.'}
          </p>
        </div>

        {/* 메시지 */}
        {errorMsg && (
          <div className="mx-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mx-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium text-center">
            {successMsg}
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">닉네임</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="예: 턱걸이왕"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">이메일 주소</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">비밀번호</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : isSignUp ? (
              '회원가입 완료'
            ) : (
              '로그인하기'
            )}
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-2 text-slate-500 text-xs">또는</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* 간편 데모 로그인 */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 rounded-xl border border-slate-700 transition-colors text-xs flex items-center justify-center gap-2"
          >
            ⚡ 체험용 데모 계정으로 즉시 시도
          </button>
        </form>

        {/* 푸터 모드 전환 */}
        <div className="p-4 bg-slate-950/50 border-t border-slate-800/80 text-center text-xs text-slate-400">
          {isSignUp ? (
            <>
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg('');
                }}
                className="text-emerald-400 font-semibold hover:underline"
              >
                로그인
              </button>
            </>
          ) : (
            <>
              아직 계정이 없으신가요?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg('');
                }}
                className="text-emerald-400 font-semibold hover:underline"
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
