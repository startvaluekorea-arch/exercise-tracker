import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: '운동 & 몸무게 기록, 이웃 피드 일지',
  description: '일일 운동 기록, Supabase Auth 기반 RLS 보안, 공개/비공개 설정 및 거리 기반 이웃 응원 커뮤니티 모바일 웹',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <Providers>
          <main className="mobile-container pb-16">
            {children}
            <BottomNav />
          </main>
        </Providers>
      </body>
    </html>
  );
}
