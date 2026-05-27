import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-950">
          <span className="rounded-2xl bg-brand-600 p-2 text-white"><Sparkles size={18} /></span>
          FounderMatch
        </Link>
        <div className="flex items-center gap-3 text-sm font-medium">
          <SignedOut>
            <Link href="/sign-in" className="text-slate-700 hover:text-brand-700">Sign in</Link>
            <Link href="/sign-up" className="rounded-full bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">Join free</Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="text-slate-700 hover:text-brand-700">Dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}
