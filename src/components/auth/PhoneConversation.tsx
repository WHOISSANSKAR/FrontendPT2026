// changes done by vb
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronLeft,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Flag,
  FolderPlus,
  MoreHorizontal,
  Send,
  Signal,
  Wifi,
  BatteryFull,
} from 'lucide-react';

type CardRow = { name: string; value: string };
type ChatStep =
  | { kind: 'customer'; text: string }
  | { kind: 'partner'; text: string }
  | { kind: 'status'; text: string; doneText: string }
  | { kind: 'doc'; text: string }
  | {
      kind: 'card';
      icon: 'location' | 'milestone' | 'project';
      title: string;
      badge: string;
      tone: 'amber' | 'blue' | 'emerald';
      subtitle: string;
      rows: CardRow[];
      progress?: number;
    };

type Chat = { topic: string; steps: ChatStep[] };

const CHATS: Chat[] = [
  {
    topic: 'Add location',
    steps: [
      { kind: 'customer', text: 'Hi, this is Rahul. I need to add a new location to my project, our Pune warehouse.' },
      { kind: 'status', text: 'SP is reviewing your request', doneText: 'Request seen by SP' },
      { kind: 'partner', text: 'Sure Rahul! Please share the site address and when you would like to start.' },
      { kind: 'customer', text: 'Plot 14, Hinjewadi Phase 2, Pune. We would like to start on 15 Dec.' },
      { kind: 'doc', text: 'Pune_Site_Layout.pdf' },
      { kind: 'partner', text: 'Thanks, I have checked the layout. I will do a site survey on 10 Dec first.' },
      {
        kind: 'card',
        icon: 'location',
        title: 'New location',
        badge: 'Proposed',
        tone: 'amber',
        subtitle: 'Pune · Hinjewadi Phase 2',
        rows: [
          { name: 'Site survey', value: '10 Dec' },
          { name: 'Work starts', value: '15 Dec' },
        ],
      },
      { kind: 'customer', text: 'Perfect, that works for us 👍' },
      { kind: 'partner', text: 'Great! I will add the Pune location and keep you posted here.' },
    ],
  },
  {
    topic: 'Milestone update',
    steps: [
      { kind: 'customer', text: 'Hi, when will the Installation milestone at the Pune location be done?' },
      { kind: 'status', text: 'SP is checking the schedule', doneText: 'Schedule checked by SP' },
      { kind: 'partner', text: 'Installation is 70% done. Racking is complete and the conveyors are being fitted now.' },
      {
        kind: 'card',
        icon: 'milestone',
        title: 'Installation',
        badge: 'In progress',
        tone: 'blue',
        subtitle: 'Pune · Hinjewadi Phase 2',
        progress: 70,
        rows: [
          { name: 'Racking', value: 'Done' },
          { name: 'Expected completion', value: '28 Dec' },
        ],
      },
      { kind: 'customer', text: 'Great. Any risk to that date?' },
      { kind: 'partner', text: 'No risks right now. I will tell you here if anything changes.' },
      { kind: 'customer', text: 'Thanks!' },
    ],
  },
  {
    topic: 'New project',
    steps: [
      { kind: 'customer', text: 'We want to start another project at the same Pune location, a CCTV setup.' },
      { kind: 'status', text: 'SP is reviewing your request', doneText: 'Request seen by SP' },
      { kind: 'partner', text: 'Sure! I can reuse the Pune site details we already have. What is the scope?' },
      { kind: 'customer', text: '32 cameras with an NVR, plus access control at both gates.' },
      {
        kind: 'card',
        icon: 'project',
        title: 'New project',
        badge: 'Proposed',
        tone: 'emerald',
        subtitle: 'CCTV & Access Control',
        rows: [
          { name: 'Location', value: 'Pune · Hinjewadi' },
          { name: 'Proposed start', value: '5 Jan' },
        ],
      },
      { kind: 'customer', text: 'Perfect, please go ahead 👍' },
      { kind: 'partner', text: 'Done! I will set up the new project at the same location.' },
    ],
  },
];

const STEP_DELAY = 1700;
const RESTART_DELAY = 4200;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const SpAvatar: React.FC = () => (
  <div className="mb-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[9px] font-bold text-white">
    SP
  </div>
);

const Bubble: React.FC<{ step: ChatStep; settled: boolean }> = ({ step, settled }) => {
  if (step.kind === 'customer') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-[18px] rounded-br-md bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] px-3 py-2 text-[12.5px] leading-snug text-white shadow-[0_6px_14px_rgba(37,99,235,0.35)]">
          {step.text}
        </div>
      </div>
    );
  }
  if (step.kind === 'partner') {
    return (
      <div className="flex items-end gap-1.5">
        <SpAvatar />
        <div className="max-w-[80%] rounded-[18px] rounded-bl-md border border-slate-200/80 bg-white px-3 py-2 text-[12.5px] leading-snug text-slate-800 shadow-[0_4px_10px_rgba(15,23,42,0.06)]">
          {step.text}
        </div>
      </div>
    );
  }
  if (step.kind === 'status') {
    return (
      <div className="flex justify-center">
        <div
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors duration-500 ${
            settled ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          {settled ? <CheckCircle2 className="h-3 w-3" /> : <Loader2 className="h-3 w-3 animate-spin text-orange-500" />}
          <span>{settled ? step.doneText : step.text}</span>
        </div>
      </div>
    );
  }
  if (step.kind === 'doc') {
    return (
      <div className="flex justify-end">
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-800">
          <FileText className="h-3 w-3 text-blue-600" />
          {step.text}
        </div>
      </div>
    );
  }
  const Icon = step.icon === 'location' ? MapPin : step.icon === 'milestone' ? Flag : FolderPlus;
  const tone =
    step.tone === 'amber'
      ? 'bg-amber-50 text-amber-700'
      : step.tone === 'blue'
        ? 'bg-blue-50 text-blue-700'
        : 'bg-emerald-50 text-emerald-700';
  return (
    <div className="flex items-end gap-1.5">
      <SpAvatar />
      <div className="w-[80%] rounded-[16px] rounded-bl-md border border-slate-200/80 bg-white p-2.5 shadow-[0_4px_10px_rgba(15,23,42,0.06)]">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11.5px] font-bold text-slate-900">
            <Icon className="h-3 w-3 text-blue-600" />
            {step.title}
          </span>
          <span className={`rounded-full px-1.5 py-px text-[10px] font-semibold ${tone}`}>{step.badge}</span>
        </div>
        <div className="text-[11px] font-semibold text-slate-800">{step.subtitle}</div>
        {typeof step.progress === 'number' && (
          <div className="mt-1.5">
            <div className="flex justify-between text-[10.5px] text-slate-600">
              <span>Progress</span>
              <span className="font-mono font-semibold text-slate-800">{step.progress}%</span>
            </div>
            <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                initial={{ width: 0 }}
                animate={{ width: `${step.progress}%` }}
                transition={{ duration: 0.9, delay: 0.25, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
        {step.rows.map((m) => (
          <div key={m.name} className="mt-1 flex justify-between border-t border-slate-100 pt-1 text-[10.5px] text-slate-600">
            <span>{m.name}</span>
            <span className="font-mono font-semibold text-slate-800">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TypingDots: React.FC<{ side: 'left' | 'right' }> = ({ side }) => (
  <div className={`flex ${side === 'right' ? 'justify-end' : 'items-end gap-1.5'}`}>
    {side === 'left' && (
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[9px] font-bold text-white">
        SP
      </div>
    )}
    <div
      className={`flex gap-1 rounded-full px-3 py-2.5 ${
        side === 'right' ? 'bg-blue-100' : 'border border-slate-200/80 bg-white'
      }`}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="vb-typing-dot h-1.5 w-1.5 rounded-full bg-slate-400"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </div>
  </div>
);

export const PhoneConversation: React.FC = () => {
  const reduced = prefersReducedMotion();
  const [chatIndex, setChatIndex] = useState(0);
  const [count, setCount] = useState(reduced ? CHATS[0].steps.length : 0);
  const [typing, setTyping] = useState<null | 'left' | 'right'>(null);
  const [fit, setFit] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = (width: number, height: number) =>
      setFit(Math.max(0.4, Math.min(1.35, (height - 40) / 660, (width - 40) / 340)));
    measure(el.clientWidth, el.clientHeight);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => measure(entry.contentRect.width, entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(window.setTimeout(r, ms)));

    const run = async () => {
      let chat = 0;
      while (!cancelled) {
        const steps = CHATS[chat].steps;
        setChatIndex(chat);
        setCount(0);
        await wait(700);
        for (let i = 0; i < steps.length && !cancelled; i++) {
          const step = steps[i];
          if (step.kind === 'customer' || step.kind === 'partner' || step.kind === 'card') {
            setTyping(step.kind === 'customer' ? 'right' : 'left');
            await wait(900);
            setTyping(null);
          }
          if (cancelled) return;
          setCount(i + 1);
          await wait(STEP_DELAY);
        }
        await wait(RESTART_DELAY);
        chat = (chat + 1) % CHATS.length;
      }
    };
    run();
    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [reduced]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  }, [count, typing, reduced]);

  const visible = CHATS[chatIndex].steps.slice(0, count);

  return (
    <div
      ref={stageRef}
      className="relative flex h-full w-full items-center justify-center"
      aria-hidden="true"
    >
      <div
        className="vb-phone-float relative"
        style={{
          zoom: fit,
        }}
      >
        <div className="absolute left-1/2 top-[96%] h-10 w-[78%] -translate-x-1/2 rounded-[50%] bg-black/35 blur-2xl" />

        <div className="absolute inset-0 rounded-[50px] shadow-[0_40px_80px_rgba(2,6,23,0.45),0_12px_24px_rgba(2,6,23,0.25)]" />

        <div className="relative h-[600px] w-[292px] rounded-[50px] bg-gradient-to-br from-[#3b4252] via-[#111827] to-[#030712] p-[10px] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.14),inset_0_2px_6px_rgba(255,255,255,0.12)]">
          <span className="absolute -left-[3px] top-[120px] h-12 w-[3px] rounded-l bg-[#1f2937]" />
          <span className="absolute -left-[3px] top-[180px] h-12 w-[3px] rounded-l bg-[#1f2937]" />
          <span className="absolute -right-[3px] top-[150px] h-16 w-[3px] rounded-r bg-[#1f2937]" />

          <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[41px] bg-[#F5F7FB]">

            <div className="relative z-20 flex h-10 shrink-0 items-center justify-between px-6 pt-1 text-[11px] font-semibold text-slate-900">
              <span>9:41</span>
              <span className="absolute left-1/2 top-2 h-[22px] w-[88px] -translate-x-1/2 rounded-full bg-black" />
              <span className="flex items-center gap-1">
                <Signal className="h-3 w-3" />
                <Wifi className="h-3 w-3" />
                <BatteryFull className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="z-10 flex shrink-0 items-center gap-2 border-b border-slate-200/70 bg-white/90 px-3 py-2 backdrop-blur">
              <ChevronLeft className="h-4 w-4 text-slate-500" />
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[11px] font-bold text-white">
                SP
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-bold text-slate-900">Service Provider</div>
                <div className="flex items-center gap-1 text-[10.5px] text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  SP · Online
                </div>
              </div>
              <MoreHorizontal className="h-4 w-4 text-slate-400" />
            </div>

            <div ref={listRef} className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
              <div className="flex justify-center">
                <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[10.5px] font-semibold text-slate-500">
                  Today · {CHATS[chatIndex].topic}
                </span>
              </div>
              <AnimatePresence initial={false}>
                {visible.map((step, i) => (
                  <motion.div
                    key={`${chatIndex}-${i}-${step.kind}`}
                    initial={reduced ? false : { opacity: 0, y: 14, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Bubble step={step} settled={i < count - 1 || reduced} />
                  </motion.div>
                ))}
                {typing && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TypingDots side={typing} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex shrink-0 items-center gap-2 border-t border-slate-200/70 bg-white px-3 py-2.5">
              <div className="flex-1 rounded-full bg-slate-100 px-3 py-1.5 text-[11.5px] text-slate-400">Message SP…</div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_4px_10px_rgba(37,99,235,0.4)]">
                <Send className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mx-auto mb-1.5 h-1 w-24 shrink-0 rounded-full bg-slate-900/80" />
          </div>
        </div>

      </div>
    </div>
  );
};
