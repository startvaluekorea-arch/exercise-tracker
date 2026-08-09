import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: '모두의 운동 | 매일 일일 운동 & 체중 일지 커뮤니티',
  description: '모두의 운동 - 매일의 일일 운동 실적 기록, 체중 추이, 공개/비공개 설정 및 이웃 응원 피드 모바일 웹',
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
