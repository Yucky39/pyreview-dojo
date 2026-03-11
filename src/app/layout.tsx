import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/next';
import AuthProvider from '@/components/auth/AuthProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PyReview Dojo - Pythonコードレビュースキルを磨く学習プラットフォーム',
  description:
    'あなたのスキルレベルに合わせたカスタム学習プランで、Pythonコードレビューのプロを目指そう',
  keywords: ['Python', 'コードレビュー', '学習', 'プログラミング', 'スキルアップ'],
  openGraph: {
    title: 'PyReview Dojo',
    description: 'Pythonコードレビュースキルを磨く学習プラットフォーム',
    locale: 'ja_JP',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
        {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e1b4b',
              color: '#e0e7ff',
              borderRadius: '12px',
              border: '1px solid rgba(99,102,241,0.3)',
            },
            success: {
              iconTheme: { primary: '#6366f1', secondary: '#fff' },
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
