import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: '운동 & 몸무게 기록 일지',
  description: '일일 단위 운동 및 몸무게를 기록하고 주간(일요일 시작)/월간/분기/반기/연간 통계를 조회하는 모바일 대시보드',
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
        <main className="mobile-container pb-16">
          {children}
          <BottomNav />
        </main>
      </body>
    </html>
  );
}
