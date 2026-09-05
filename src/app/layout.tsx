import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter, Noto_Sans_Bengali } from 'next/font/google';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const bengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  variable: '--font-bengali',
});

export const metadata: Metadata = {
  title: {
    template: '%s | DSArc',
    default: 'DSArc | বাংলায় ডেটা স্ট্রাকচার ও অ্যালগরিদম',
  },
  description:
    'ইন্টারঅ্যাক্টিভ ভিজ্যুয়ালাইজারসহ বাংলায় ডেটা স্ট্রাকচার ও অ্যালগরিদম শেখার প্ল্যাটফর্ম।',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="bn" className={cn(inter.variable, bengali.variable)}>
      <body className="flex flex-col min-h-screen">
        <RootProvider theme={{ enabled: false }}>{children}</RootProvider>
      </body>
    </html>
  );
}
