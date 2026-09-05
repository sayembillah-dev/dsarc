import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Code2, LineChart } from 'lucide-react';

const highlights = [
  {
    icon: BookOpen,
    title: 'গোছানো কারিকুলাম',
    description: 'সেকশন ও সাবসেকশনে সাজানো ধারাবাহিক পাঠ, একদম শুরু থেকে অ্যাডভান্সড পর্যন্ত।',
  },
  {
    icon: Code2,
    title: 'চলমান JavaScript কোড',
    description: 'প্রতিটা টপিকে কপি করে সরাসরি রান করা যায় এমন উদাহরণ, লাইন বাই লাইন ব্যাখ্যাসহ।',
  },
  {
    icon: LineChart,
    title: 'ইন্টারঅ্যাক্টিভ ভিজ্যুয়ালাইজার',
    description: 'অ্যানিমেটেড ভিজ্যুয়াল দেখে অ্যালগরিদম কীভাবে কাজ করে তা উপলব্ধি করো।',
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-16 sm:pt-32">
        <p className="text-sm font-medium text-fd-muted-foreground border rounded-full px-4 py-1">
          বাংলায় ডেটা স্ট্রাকচার ও অ্যালগরিদম
        </p>
        <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl">
          শূন্য থেকে ধাপে ধাপে DSA আয়ত্ত করো
        </h1>
        <p className="mt-4 text-lg text-fd-muted-foreground max-w-xl">
          JavaScript দিয়ে ডেটা স্ট্রাকচার ও অ্যালগরিদম শেখার জন্য গোছানো ডকুমেন্টেশন,
          চলমান কোড উদাহরণ এবং ইন্টারঅ্যাক্টিভ ভিজ্যুয়ালাইজার, সব এক জায়গায়।
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Button size="lg" render={<Link href="/docs" />}>
            শেখা শুরু করো
          </Button>
          <Button variant="outline" size="lg" render={<Link href="/docs" />}>
            কারিকুলাম দেখো
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-24">
        <div className="grid gap-px rounded-xl border bg-fd-border overflow-hidden sm:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="bg-fd-card p-6">
              <item.icon className="size-5 text-fd-muted-foreground" />
              <h2 className="mt-4 font-semibold">{item.title}</h2>
              <p className="mt-1.5 text-sm text-fd-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
