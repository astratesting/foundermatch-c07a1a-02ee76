import Link from 'next/link';
import { ArrowRight, Brain, MessageCircle, Sparkles, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';

const stats = [
  ['AI score', 'Skill complementarity + industry fit'],
  ['Swipe flow', 'Coffee chat speed for founder discovery'],
  ['Warm matches', 'Message only after mutual interest']
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-4 py-2 text-sm font-medium text-brand-700 shadow-sm">
            <Sparkles size={16} /> AI-powered co-founder matching
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            Meet your missing founder half.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            FounderMatch pairs builders, sellers, designers, and domain experts by complementary skills, shared industries, and startup intent — then turns fit into focused conversations.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-up" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow-glow hover:bg-brand-700">
              Start matching <ArrowRight size={18} />
            </Link>
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 hover:border-brand-200 hover:text-brand-700">
              View demo dashboard
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {stats.map(([title, copy]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{copy}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card-gradient rounded-[2rem] border border-white p-6 shadow-glow">
          <div className="rounded-[1.5rem] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-700">92% compatible</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-950">Maya Chen</h2>
                <p className="text-slate-600">GTΜ operator building B2B AI tools</p>
              </div>
              <div className="rounded-full bg-brand-50 p-4 text-brand-600"><Brain size={28} /></div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Sales', 'AI SaaS', 'Fundraising', 'Healthcare'].map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{tag}</span>
              ))}
            </div>
            <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-slate-700">
              Looking for a technical co-founder to ship a provider workflow automation product. Strong customer access, pilot pipeline, and seed investor intros.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-rose-50 p-4 text-rose-600">Pass</div>
              <div className="rounded-2xl bg-amber-50 p-4 text-amber-600"><MessageCircle className="mx-auto" /></div>
              <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-600">Match</div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-20 md:grid-cols-3">
        {[
          [Users, 'Complete profiles', 'Capture skills, industries, founder goals, and startup ideas.'],
          [Brain, 'Score compatibility', 'Blend skill gaps, matching industries, and what each founder wants.'],
          [MessageCircle, 'Chat after match', 'Keep messages scoped to mutual matches so signal stays high.']
        ].map(([Icon, title, copy]) => {
          const LucideIcon = Icon as typeof Users;
          return (
            <div key={title as string} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <LucideIcon className="text-brand-600" />
              <h3 className="mt-4 text-xl font-semibold text-slate-950">{title as string}</h3>
              <p className="mt-2 text-slate-600">{copy as string}</p>
            </div>
          );
        })}
      </section>
    </main>
  );
}
