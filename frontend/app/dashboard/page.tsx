'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MessageCircle, Send, X } from 'lucide-react';

type Candidate = {
  id: string;
  name: string;
  role: string;
  industry: string;
  skills: string[];
  lookingFor: string[];
  idea: string;
  score: number;
};

const candidates: Candidate[] = [
  {
    id: 'maya',
    name: 'Maya Chen',
    role: 'GTM operator',
    industry: 'Healthcare AI',
    skills: ['Sales', 'Fundraising', 'Healthcare', 'Partnerships'],
    lookingFor: ['Full-stack engineering', 'ML', 'Product'],
    idea: 'Automating provider intake and prior authorization workflows for specialty clinics.',
    score: 92
  },
  {
    id: 'leo',
    name: 'Leo Patel',
    role: 'AI engineer',
    industry: 'Fintech',
    skills: ['ML', 'Python', 'Risk models', 'Data pipelines'],
    lookingFor: ['Compliance', 'B2B sales', 'Design'],
    idea: 'A compliance copilot that reviews SMB lending applications before underwriter handoff.',
    score: 86
  },
  {
    id: 'sofia',
    name: 'Sofia Alvarez',
    role: 'Product designer',
    industry: 'Climate',
    skills: ['UX', 'Research', 'No-code', 'Brand'],
    lookingFor: ['Backend engineering', 'Energy markets', 'Sales'],
    idea: 'A marketplace connecting building owners with vetted retrofit financing options.',
    score: 81
  }
];

const initialMessages = [
  { sender: 'Maya', text: 'Your technical background fits what I need for the healthcare workflow product.' },
  { sender: 'You', text: 'Strong fit. I can prototype intake automation fast if you can validate pilots.' }
];

export default function DashboardPage() {
  const [index, setIndex] = useState(0);
  const [matches, setMatches] = useState<Candidate[]>([candidates[0]]);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');

  const candidate = candidates[index % candidates.length];
  const averageScore = useMemo(() => Math.round(matches.reduce((sum, match) => sum + match.score, 0) / matches.length), [matches]);

  function swipe(accepted: boolean) {
    if (accepted && !matches.some((match) => match.id === candidate.id)) {
      setMatches((current) => [candidate, ...current]);
    }
    setIndex((current) => current + 1);
  }

  function sendMessage() {
    const clean = draft.trim();
    if (!clean) return;
    setMessages((current) => [...current, { sender: 'You', text: clean }]);
    setDraft('');
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_22rem]">
      <div className="grid gap-6 xl:grid-cols-[23rem_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-brand-700">Your founder profile</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Alex Morgan</h1>
          <p className="mt-2 text-slate-600">Full-stack engineer exploring vertical AI SaaS.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {['React', 'Node.js', 'AI agents', 'PostgreSQL', 'Product'].map((skill) => (
              <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{skill}</span>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-brand-50 p-4">
            <p className="text-sm font-semibold text-brand-900">Looking for</p>
            <p className="mt-1 text-sm text-brand-800">B2B sales, healthcare access, fundraising, domain expertise</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-2xl font-bold">{matches.length}</p><p className="text-xs text-slate-500">matches</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-2xl font-bold">{averageScore}%</p><p className="text-xs text-slate-500">avg score</p></div>
          </div>
        </aside>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-700">Swipe queue</p>
              <h2 className="text-2xl font-bold text-slate-950">Find complementary founders</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{candidate.score}% fit</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={candidate.id + index}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white to-indigo-50 p-6"
            >
              <p className="text-sm font-semibold text-slate-500">{candidate.industry}</p>
              <h3 className="mt-2 text-4xl font-bold text-slate-950">{candidate.name}</h3>
              <p className="mt-1 text-lg text-slate-600">{candidate.role}</p>
              <p className="mt-5 rounded-2xl bg-white/80 p-4 text-slate-700">{candidate.idea}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Brings</p>
                  <div className="mt-2 flex flex-wrap gap-2">{candidate.skills.map((skill) => <span key={skill} className="rounded-full bg-white px-3 py-1 text-sm text-slate-700">{skill}</span>)}</div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Needs</p>
                  <div className="mt-2 flex flex-wrap gap-2">{candidate.lookingFor.map((skill) => <span key={skill} className="rounded-full bg-brand-100 px-3 py-1 text-sm text-brand-800">{skill}</span>)}</div>
                </div>
              </div>
              <div className="mt-8 flex justify-center gap-4">
                <button onClick={() => swipe(false)} className="rounded-full bg-rose-50 p-4 text-rose-600 hover:bg-rose-100" aria-label="Pass"><X /></button>
                <button onClick={() => swipe(true)} className="rounded-full bg-emerald-50 p-4 text-emerald-600 hover:bg-emerald-100" aria-label="Match"><Check /></button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <MessageCircle className="text-brand-600" />
          <h2 className="text-xl font-bold text-slate-950">Match messages</h2>
        </div>
        <div className="mt-5 space-y-3">
          {messages.map((message, idx) => (
            <div key={`${message.sender}-${idx}`} className={message.sender === 'You' ? 'ml-8 rounded-2xl bg-brand-600 p-3 text-white' : 'mr-8 rounded-2xl bg-slate-100 p-3 text-slate-800'}>
              <p className="text-xs font-semibold opacity-80">{message.sender}</p>
              <p className="mt-1 text-sm">{message.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && sendMessage()} className="min-w-0 flex-1 rounded-full border-slate-300 text-sm" placeholder="Message a match" />
          <button onClick={sendMessage} className="rounded-full bg-brand-600 p-3 text-white hover:bg-brand-700" aria-label="Send"><Send size={18} /></button>
        </div>
      </aside>
    </section>
  );
}
