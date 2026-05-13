"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ── Palettes ─────────────────────────────────────────────────────────────────
type Colors = typeof DARK;

const DARK = {
  paper:      "#09090b",
  paper2:     "#111113",
  ink:        "#fafaf9",
  ink2:       "#a1a1aa",
  ink3:       "#71717a",
  mute:       "#52525b",
  rule:       "#27272a",
  rule2:      "#3f3f46",
  accent:     "#3b82f6",
  accentDeep: "#2563eb",
  accentSoft: "#172554",
  data:       "#34d399",
  dataSoft:   "#064e3b",
  warn:       "#f59e0b",
  navBg:      "rgba(9,9,11,0.85)",
};

const LIGHT = {
  paper:      "#ffffff",
  paper2:     "#f4f4f5",
  ink:        "#09090b",
  ink2:       "#52525b",
  ink3:       "#71717a",
  mute:       "#a1a1aa",
  rule:       "#e4e4e7",
  rule2:      "#d4d4d8",
  accent:     "#2563eb",
  accentDeep: "#1d4ed8",
  accentSoft: "#dbeafe",
  data:       "#059669",
  dataSoft:   "#d1fae5",
  warn:       "#d97706",
  navBg:      "rgba(255,255,255,0.85)",
};

// scope/mock UIs are always dark (they're product previews)
const DARK_SURFACE = "#18181b";
const DARK_CARD    = "#0d0d0f";

const SERIF = '"Instrument Serif","Times New Roman",serif';
const MONO  = '"JetBrains Mono","IBM Plex Mono",ui-monospace,monospace';
const SANS  = '"Geist",-apple-system,"Helvetica Neue",sans-serif';

// ── Shared primitives ─────────────────────────────────────────────────────────
function Arr() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

// ── Animated Scope ────────────────────────────────────────────────────────────
const SCENES = [
  {
    prompt: "Show MRR trend in Europe.",
    title: "MRR · Europe", sub: "JAN — JUN 2026",
    bars: [40,55,48,62,70,82,78,88,92], accentFrom: 6,
    stats: [{ v:"€2.4M", k:"MRR" },{ v:"+18%", k:"vs Q1" },{ v:"1.8s", k:"dwell" }],
    pins: [
      { t:"view · chart.line", x:18, y:26, cls:"" },
      { t:"click · export",    x:78, y:70, cls:"green" },
      { t:"+1.8s dwell",       x:30, y:78, cls:"green" },
    ],
  },
  {
    prompt: "Create new customer + assign rep.",
    title: "New customer", sub: "5 OF 7 FIELDS · 1 ERROR",
    bars: [30,38,50,58,52,68,62,74,70], accentFrom: 5,
    stats: [{ v:"71%", k:"complete" },{ v:"2.1s", k:"to action" },{ v:"−31%", k:"tickets" }],
    pins: [
      { t:"field · drop-off", x:72, y:60, cls:"warn" },
      { t:"submit · ok",      x:22, y:82, cls:"green" },
    ],
  },
  {
    prompt: "Help me buy a laptop < $1,800.",
    title: "3 picks for you", sub: "VARIANT B · GRID LAYOUT",
    bars: [25,32,40,35,50,58,64,72,80], accentFrom: 6,
    stats: [{ v:"+9.1%", k:"cart-add" },{ v:"2.3×", k:"winner" },{ v:"62%", k:"checkout" }],
    pins: [
      { t:"card · selected", x:65, y:38, cls:"green" },
      { t:"cart · +1",       x:28, y:80, cls:"green" },
      { t:"view · grid",     x:80, y:70, cls:"" },
    ],
  },
];

function Scope({ C }: { C: Colors }) {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"in"|"out">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("out"), 4600);
    const t2 = setTimeout(() => { setI(v => (v+1) % SCENES.length); setPhase("in"); }, 5200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [i]);

  const s = SCENES[i];
  const pinBg  = (cls: string) => cls === "green" ? C.dataSoft : cls === "warn" ? "#451a03" : "#27272a";
  const pinClr = (cls: string) => cls === "green" ? C.data     : cls === "warn" ? C.warn    : "#fafaf9";
  const dotClr = (cls: string) => cls === "green" ? C.data     : cls === "warn" ? C.warn    : C.accent;

  return (
    <div style={{
      position:"relative", background:DARK_SURFACE, color:"#fafaf9",
      borderRadius:18, overflow:"hidden", aspectRatio:"1/1.05",
      boxShadow:`0 0 0 1px #27272a, 0 30px 60px -30px rgba(0,0,0,0.6)`,
    }}>
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 18px", borderBottom:"1px solid #27272a",
        fontFamily:MONO, fontSize:11, letterSpacing:"0.06em", color:"#71717a",
      }}>
        <span>LENS · SESSION 0x4f2c</span>
        <span style={{ display:"flex", alignItems:"center", gap:8, color:C.accent }}>
          <span className="lens-live-pulse" style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:C.accent }}/>
          REC
        </span>
      </div>

      <div style={{ padding:20, display:"flex", flexDirection:"column", height:"calc(100% - 44px)" }}>
        <div style={{
          display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
          background:"rgba(255,255,255,0.04)", border:"1px solid #27272a",
          borderRadius:10, fontFamily:MONO, fontSize:12, color:"#a1a1aa", marginBottom:16,
        }}>
          <span style={{ color:"#52525b" }}>›</span>
          <span key={"p"+i} style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.prompt}</span>
          <span className="lens-caret" style={{ width:1.5, height:13, background:C.accent }}/>
        </div>

        <div key={"c"+i} style={{
          flex:1, background:DARK_CARD, border:"1px solid #27272a",
          borderRadius:12, padding:18, position:"relative", overflow:"hidden",
        }}>
          <div style={{ fontFamily:SERIF, fontSize:22, lineHeight:1.1, marginBottom:4 }}>{s.title}</div>
          <div style={{ fontFamily:MONO, fontSize:11, color:"#52525b", letterSpacing:"0.04em", marginBottom:18 }}>{s.sub}</div>

          <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:110, paddingTop:12, borderTop:"1px dashed #27272a" }}>
            {s.bars.map((h, idx) => (
              <div key={idx} style={{
                flex:1, borderRadius:"3px 3px 0 0", minHeight:4,
                transition:"height 600ms cubic-bezier(.4,.8,.3,1)", height:`${h}%`,
                background: idx < s.accentFrom ? "#3f3f46" : `linear-gradient(180deg,${C.accent},${C.accentDeep})`,
              }}/>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginTop:14 }}>
            {s.stats.map((st, idx) => (
              <div key={idx}>
                <div style={{ fontFamily:SERIF, fontSize:22, lineHeight:1 }}>{st.v}</div>
                <div style={{ fontFamily:MONO, fontSize:10, color:"#52525b", letterSpacing:"0.08em", textTransform:"uppercase", marginTop:4 }}>{st.k}</div>
              </div>
            ))}
          </div>

          {phase === "in" && s.pins.map((p, idx) => (
            <span key={"pin"+idx} className="lens-pin-in" style={{
              position:"absolute", display:"inline-flex", alignItems:"center", gap:6,
              padding:"4px 8px", fontFamily:MONO, fontSize:10, letterSpacing:"0.04em",
              background:pinBg(p.cls), color:pinClr(p.cls),
              borderRadius:999, whiteSpace:"nowrap", boxShadow:"0 4px 12px -4px rgba(0,0,0,0.6)",
              left:`${p.x}%`, top:`${p.y}%`, transform:"translate(-50%,-50%)",
              animationDelay:`${600 + idx*350}ms`,
            }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:dotClr(p.cls) }}/>
              {p.t}
            </span>
          ))}
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", marginTop:14, fontFamily:MONO, fontSize:10.5, color:"#52525b", letterSpacing:"0.06em" }}>
          <span>{s.pins.length + 4} events captured</span>
          <span style={{ color:C.accent }}>● recording</span>
        </div>
      </div>
    </div>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  { q:"Does this replace C1 or OpenUI?",         a:"No — we sit next to them. You keep using C1 or OpenUI to generate the UI; Lens measures and controls what they render. Think of it as Mixpanel + a policy layer, designed specifically for generated component trees." },
  { q:"Is this just generic product analytics?", a:"No. We understand prompts, models, generated component trees and business events together — not just anonymous pageviews and clicks. The same chart rendered from two prompts is two different things in Lens." },
  { q:"What stacks do you support?",             a:"Anything using Thesys C1 or OpenUI with a modern React frontend (Next.js, Remix, vanilla CSR). Custom GenUI renderers can be added via a small adapter. Backend SDKs are Node, Python and Go." },
  { q:"What about privacy and PII?",             a:"Prompts and generated specs can be redacted client-side before they leave the browser. We never store raw model output without your team's policy explicitly allowing it. SOC 2 Type I is in progress." },
  { q:"How long does it take to integrate?",     a:"About fifteen minutes for the SDK and your first dashboard. Custom events, business-outcome tracking and policies take longer — usually a half-day with your team and ours." },
];

function FAQSection({ C }: { C: Colors }) {
  const [open, setOpen] = useState(0);
  return (
    <div style={{ borderTop:`1px solid ${C.rule}`, marginBottom:80 }}>
      {FAQS.map((f, i) => (
        <div key={i} onClick={() => setOpen(open === i ? -1 : i)}
          style={{ borderBottom:`1px solid ${C.rule}`, padding:"22px 0", cursor:"pointer" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:32,
            fontFamily:SERIF, fontSize:26, lineHeight:1.1, fontWeight:400, color:C.ink }}>
            {f.q}
            <span style={{ width:22, height:22, display:"grid", placeItems:"center",
              fontFamily:MONO, color:C.accent, fontSize:18,
              transition:"transform 200ms", transform: open === i ? "rotate(45deg)" : "none" }}>+</span>
          </div>
          <div style={{
            maxHeight: open === i ? 220 : 0, overflow:"hidden",
            transition:"max-height 240ms ease, margin 240ms ease",
            color:C.ink2, fontSize:15, lineHeight:1.55, maxWidth:"64ch",
            marginTop: open === i ? 14 : 0,
          }}>{f.a}</div>
        </div>
      ))}
    </div>
  );
}

function SectionHead({ num, title, C }: { num: string; title: React.ReactNode; C: Colors }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:60,
      padding:"96px 0 40px", borderTop:`1px solid ${C.rule}`, alignItems:"start" }}>
      <div style={{ fontFamily:MONO, fontSize:11, letterSpacing:"0.14em", color:C.mute, textTransform:"uppercase", paddingTop:6 }}>{num}</div>
      {title}
    </div>
  );
}

function H2({ children, C }: { children: React.ReactNode; C: Colors }) {
  return (
    <h2 style={{ fontFamily:SERIF, fontWeight:400, fontSize:56, lineHeight:1, letterSpacing:"-0.015em", margin:"0 0 18px", maxWidth:"18ch", color:C.ink }}>
      {children}
    </h2>
  );
}

function Lede({ children, C }: { children: React.ReactNode; C: Colors }) {
  return <p style={{ fontSize:19, lineHeight:1.45, color:C.ink2, maxWidth:"60ch", margin:0 }}>{children}</p>;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const C = isDark ? DARK : LIGHT;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mq.matches);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });
  }, [router]);

  const wrap: React.CSSProperties = { maxWidth:1240, margin:"0 auto", padding:"0 40px" };
  const accentItalic = { fontStyle:"italic" as const, color:C.accent };

  return (
    <div style={{ background:C.paper, color:C.ink, fontFamily:SANS, fontSize:16, lineHeight:1.5, WebkitFontSmoothing:"antialiased", transition:"background 200ms, color 200ms" }}>

      {/* NAV */}
      <nav style={{ position:"sticky", top:0, zIndex:50, background:C.navBg, backdropFilter:"saturate(180%) blur(12px)", borderBottom:`1px solid ${C.rule}` }}>
        <div style={{ ...wrap, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 40px" }}>
          <a href="#" style={{ display:"flex", alignItems:"center", gap:10, fontFamily:MONO, fontSize:13, letterSpacing:"0.04em", color:C.ink, textDecoration:"none", fontWeight:500 }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke={C.ink} strokeWidth="1.4"/>
              <circle cx="11" cy="11" r="5" stroke={C.accent} strokeWidth="1.4"/>
              <circle cx="11" cy="11" r="1.6" fill={C.accent}/>
              <line x1="11" y1="0.5" x2="11" y2="3.5" stroke={C.ink} strokeWidth="1.2"/>
              <line x1="11" y1="18.5" x2="11" y2="21.5" stroke={C.ink} strokeWidth="1.2"/>
              <line x1="0.5" y1="11" x2="3.5" y2="11" stroke={C.ink} strokeWidth="1.2"/>
              <line x1="18.5" y1="11" x2="21.5" y2="11" stroke={C.ink} strokeWidth="1.2"/>
            </svg>
            GenUI&nbsp;Lens
          </a>
          <div style={{ display:"flex", gap:28, fontFamily:MONO, fontSize:12, color:C.ink3, letterSpacing:"0.04em" }}>
            {[["#problem","The blind spot"],["#solution","What we do"],["#how","SDK"],["#cases","Examples"]].map(([href,label]) => (
              <a key={href} href={href} style={{ textDecoration:"none", color:C.ink3 }}>{label}</a>
            ))}
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {/* theme toggle */}
            <button onClick={() => setIsDark(d => !d)} style={{
              width:36, height:36, borderRadius:"50%", border:`1px solid ${C.rule2}`,
              background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
              color:C.ink3, transition:"border-color 150ms, color 150ms",
            }}>
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <Link href="/login" style={{
              display:"inline-flex", alignItems:"center", gap:10, padding:"10px 16px",
              background:"transparent", color:C.ink2, border:`1px solid ${C.rule2}`,
              borderRadius:999, fontFamily:MONO, fontSize:12.5, letterSpacing:"0.04em", textDecoration:"none",
            }}>Sign in</Link>
            <Link href="/login" style={{
              display:"inline-flex", alignItems:"center", gap:10, padding:"10px 16px",
              background:C.accent, color:"#fff", border:`1px solid ${C.accent}`,
              borderRadius:999, fontFamily:MONO, fontSize:12.5, letterSpacing:"0.04em", textDecoration:"none",
            }}>Get started <Arr /></Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding:"56px 0 0" }}>
        <div style={wrap}>
          <div style={{ display:"grid", gridTemplateColumns:"1.05fr 1fr", gap:56, alignItems:"start", paddingBottom:80 }}>
            <div>
              <div style={{ fontFamily:MONO, fontSize:11, letterSpacing:"0.16em", textTransform:"uppercase", color:C.accent, fontWeight:500 }}>v0.1 — for C1 / OpenUI teams</div>
              <h1 style={{ fontFamily:SERIF, fontWeight:400, fontSize:"clamp(56px,7.5vw,104px)", lineHeight:0.92, letterSpacing:"-0.02em", margin:"22px 0 28px", color:C.ink }}>
                Observability<br/>for <em style={accentItalic}>generative</em><br/>interfaces.
              </h1>
              <p style={{ fontSize:19, lineHeight:1.5, color:C.ink2, maxWidth:"48ch", margin:"0 0 32px" }}>
                C1 and OpenUI let your LLM draw the UI. <strong style={{ fontWeight:500, color:C.ink }}>GenUI&nbsp;Lens</strong> shows which generated layouts actually work — and gives PMs, design and compliance real control over what models put on screen.
              </p>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <Link href="/login" style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"12px 18px", background:C.accent, color:"#fff", border:`1px solid ${C.accent}`, borderRadius:999, fontFamily:MONO, fontSize:12.5, letterSpacing:"0.04em", textDecoration:"none" }}>Get started <Arr /></Link>
                <a href="#how" style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"12px 18px", background:"transparent", color:C.ink2, border:`1px solid ${C.rule2}`, borderRadius:999, fontFamily:MONO, fontSize:12.5, letterSpacing:"0.04em", textDecoration:"none" }}>See how it works</a>
              </div>
              <div style={{ display:"flex", gap:22, fontFamily:MONO, fontSize:11.5, color:C.mute, letterSpacing:"0.06em", textTransform:"uppercase", paddingTop:28, borderTop:`1px solid ${C.rule}`, marginTop:40 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:C.accent, boxShadow:`0 0 0 3px ${C.accentSoft}` }}/>
                  14 design partners
                </div>
                <div>Works with C1 · OpenUI</div>
                <div>SOC&nbsp;2 in progress</div>
              </div>
            </div>
            <Scope C={C} />
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section id="problem">
        <div style={wrap}>
          <SectionHead C={C} num="01 / The problem" title={
            <div>
              <H2 C={C}>The <em style={accentItalic}>blind spot</em> in Generative UI.</H2>
              <Lede C={C}>Generic analytics doesn't understand generated components, prompts, or model variants. Once the LLM is drawing the UI, every familiar feedback loop breaks.</Lede>
            </div>
          }/>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:1, background:C.rule, border:`1px solid ${C.rule}`, borderRadius:12, overflow:"hidden", marginBottom:80 }}>
            {[
              { n:"01", h:"Your UI is a moving target.",       p:"C1 and OpenUI turn LLM responses into live interfaces — charts, forms, dashboards, flows. The component tree is different for every user, every query, every model release." },
              { n:"02", h:"Page-view analytics don't fit.",    p:"Mixpanel sees an anonymous click. It doesn't know which prompt produced the screen, which variant was rendered, or whether the model picked the right component at all." },
              { n:"03", h:"Backend traces stop at the API.",   p:"LLM observability tools track tokens, latency and cost. None of them see what the user actually saw, where attention landed, or where flows fell apart on screen." },
              { n:"04", h:"Design & compliance have no levers.", p:"There is no way to say \"never render this pattern,\" \"always escalate this kind of form,\" or \"flag layouts that violate our design system\" — until something goes wrong." },
            ].map(card => (
              <div key={card.n} style={{ background:C.paper2, padding:"32px 28px", display:"flex", flexDirection:"column", gap:14 }}>
                <div style={{ fontFamily:MONO, fontSize:11, color:C.accent, letterSpacing:"0.14em" }}>{card.n}</div>
                <h3 style={{ fontFamily:SERIF, fontSize:26, fontWeight:400, margin:0, lineHeight:1.1, color:C.ink }}>{card.h}</h3>
                <p style={{ margin:0, color:C.ink2, fontSize:15, lineHeight:1.55, maxWidth:"42ch" }}>{card.p}</p>
              </div>
            ))}
          </div>

          {/* blindspot diagram */}
          <div style={{ margin:"16px 0 80px", background:C.paper2, border:`1px solid ${C.rule}`, borderRadius:14, padding:36 }}>
            <div style={{ fontFamily:MONO, fontSize:10.5, letterSpacing:"0.14em", textTransform:"uppercase", color:C.mute, marginBottom:22 }}>What teams see today</div>
            <svg viewBox="0 0 1160 220" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ display:"block", overflow:"visible" }}>
              <defs>
                <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" fill={C.ink3}/>
                </marker>
                <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="6" stroke={C.accent} strokeWidth="2" opacity="0.35"/>
                </pattern>
              </defs>
              {[
                { x:20,  label:"USER QUERY",  text:'"Show MRR…"' },
                { x:240, label:"LLM",         text:"Claude / GPT-5" },
                { x:460, label:"C1 / OPENUI", text:"Renders UI", w:180 },
              ].map((b, idx) => (
                <g key={idx} transform={`translate(${b.x},70)`}>
                  <rect width={b.w ?? 160} height="80" rx="10" fill={isDark ? DARK_SURFACE : "#f4f4f5"} stroke={C.rule2} strokeWidth="1.2"/>
                  <text x="20" y="34" fontFamily={MONO} fontSize="11" fill={C.mute} letterSpacing="1.5">{b.label}</text>
                  <text x="20" y="58" fontFamily={SERIF} fontSize="20" fill={C.ink}>{b.text}</text>
                </g>
              ))}
              <line x1="180" y1="110" x2="240" y2="110" stroke={C.rule2} strokeWidth="1.4" markerEnd="url(#arr)"/>
              <line x1="400" y1="110" x2="460" y2="110" stroke={C.rule2} strokeWidth="1.4" markerEnd="url(#arr)"/>
              <line x1="640" y1="110" x2="700" y2="110" stroke={C.rule2} strokeWidth="1.4" markerEnd="url(#arr)"/>
              <g transform="translate(700,40)">
                <rect width="200" height="140" rx="10" fill="url(#hatch)" stroke={C.accent} strokeWidth="1.4" strokeDasharray="4 4"/>
                <text x="20" y="34" fontFamily={MONO} fontSize="11" fill={C.accent} letterSpacing="1.5">GENERATED UI</text>
                <text x="20" y="62" fontFamily={SERIF} fontSize="22" fontStyle="italic" fill={C.accent}>blind</text>
                <text x="20" y="86" fontFamily={SERIF} fontSize="22" fontStyle="italic" fill={C.accent}>spot.</text>
                <text x="20" y="118" fontFamily={MONO} fontSize="10" fill={C.accentDeep}>no metrics · no controls</text>
              </g>
              <line x1="900" y1="110" x2="960" y2="110" stroke={C.rule2} strokeWidth="1.4" markerEnd="url(#arr)"/>
              <g transform="translate(960,70)">
                <rect width="180" height="80" rx="10" fill={isDark ? DARK_SURFACE : "#f4f4f5"} stroke={C.rule2} strokeWidth="1.2"/>
                <text x="20" y="34" fontFamily={MONO} fontSize="11" fill={C.mute} letterSpacing="1.5">OUTCOME</text>
                <text x="20" y="58" fontFamily={SERIF} fontSize="20" fill={C.ink}>?</text>
              </g>
              <g transform="translate(240,184)" fontFamily={MONO} fontSize="10" fill={C.mute}><text>↑ token / latency tracing covers this</text></g>
              <g transform="translate(960,184)" fontFamily={MONO} fontSize="10" fill={C.mute}><text>↑ product analytics covers this</text></g>
              <g transform="translate(700,205)" fontFamily={MONO} fontSize="10" fill={C.accent}><text>↑ nothing covers this</text></g>
            </svg>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section id="solution">
        <div style={wrap}>
          <SectionHead C={C} num="02 / What we do" title={
            <div>
              <H2 C={C}>Observability <em style={accentItalic}>and</em> control for AI-generated interfaces.</H2>
              <Lede C={C}>GenUI Lens sits next to your C1 / OpenUI renderer. Every generated component is tracked, evaluated, and governed — just like any other critical part of your product.</Lede>
            </div>
          }/>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18, marginBottom:80 }}>
            {[
              { icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="10" y="2" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="2" y="10" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="10" y="10" width="6" height="6" rx="1.2" fill="currentColor"/></svg>, title:"Auto-instrumented components", body:"Cards, tables, charts, forms — every generated node gets a stable ID and rich context: intent, prompt, model, variant, user segment." },
              { icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 14 L6 9 L9 12 L16 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="6" cy="9" r="1.4" fill="currentColor"/><circle cx="9" cy="12" r="1.4" fill="currentColor"/></svg>, title:"Per-component UX metrics", body:"Impressions, dwell, clicks, completion, time-to-action, error rates — rolled up by component, prompt, model and cohort." },
              { icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2 L15 5 V10 C15 13 12 15 9 16 C6 15 3 13 3 10 V5 Z" stroke="currentColor" strokeWidth="1.4" fill="none"/><path d="M6.5 9 L8.2 10.5 L11.5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>, title:"Guardrails & policies", body:"Declare what the model is allowed to render. Block patterns, escalate risky flows to human review, enforce your design system at runtime." },
              { icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 4 H15 M3 9 H15 M3 14 H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="13" cy="14" r="2" stroke="currentColor" strokeWidth="1.4"/></svg>, title:"Layout experiments", body:"Compare generated layouts and prompt variants head-to-head. See which actually drive completion, conversion and revenue — not just clicks." },
            ].map(c => (
              <div key={c.title} style={{ background:C.paper2, border:`1px solid ${C.rule}`, borderRadius:12, padding:22, display:"flex", flexDirection:"column", gap:14, minHeight:220 }}>
                <div style={{ width:32, height:32, display:"grid", placeItems:"center", background:C.accentSoft, borderRadius:8, color:C.accent }}>{c.icon}</div>
                <h4 style={{ margin:0, fontFamily:SERIF, fontSize:20, fontWeight:400, lineHeight:1.15, color:C.ink }}>{c.title}</h4>
                <p style={{ margin:0, fontSize:14, color:C.ink2, lineHeight:1.5 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how">
        <div style={wrap}>
          <SectionHead C={C} num="03 / How it works" title={
            <div>
              <H2 C={C}>A drop-in SDK for <em style={accentItalic}>C1</em> &amp; <em style={accentItalic}>OpenUI</em> apps.</H2>
              <Lede C={C}>Three steps. About fifteen minutes from <code style={{ background:C.paper2, border:`1px solid ${C.rule}`, padding:"2px 6px", borderRadius:4, fontFamily:MONO, fontSize:14, color:C.ink }}>npm install</code> to the first generated component in your dashboard.</Lede>
            </div>
          }/>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:60 }}>
            <div style={{ background:C.paper2, border:`1px solid ${C.rule}`, borderRadius:14, padding:26, display:"flex", flexDirection:"column", minHeight:360 }}>
              <div style={{ fontFamily:MONO, fontSize:11, color:C.accent, letterSpacing:"0.14em", marginBottom:12 }}>STEP 01</div>
              <h4 style={{ fontFamily:SERIF, fontSize:30, fontWeight:400, margin:"0 0 10px", lineHeight:1, color:C.ink }}>Instrument</h4>
              <p style={{ margin:"0 0 22px", fontSize:14.5, color:C.ink2, lineHeight:1.5 }}>Wrap your C1Component or OpenUI renderer. We auto-tag generated nodes and stream view / click / submit / error events.</p>
              <div style={{ marginTop:"auto", background:DARK_CARD, border:"1px solid #27272a", padding:"14px 16px", borderRadius:8, fontFamily:MONO, fontSize:11.5, lineHeight:1.6, whiteSpace:"pre", color:"#fafaf9" }}>
                <span style={{ color:"#52525b" }}>{"// app.tsx\n"}</span>
                <span style={{ color:"#93c5fd" }}>{"import"}</span>{" { "}
                <span style={{ color:"#bfdbfe" }}>LensProvider</span>{" } "}
                <span style={{ color:"#93c5fd" }}>from</span>{" "}
                <span style={{ color:"#86efac" }}>"@genui/lens"</span>
                {"\n\n<"}<span style={{ color:"#bfdbfe" }}>LensProvider</span>{" apiKey={"}
                <span style={{ color:"#86efac" }}>"sk_..."</span>
                {"}>\n  <"}<span style={{ color:"#bfdbfe" }}>C1Component</span>{" spec={spec} />\n</"}
                <span style={{ color:"#bfdbfe" }}>LensProvider</span>{">"}
              </div>
            </div>
            <div style={{ background:C.paper2, border:`1px solid ${C.rule}`, borderRadius:14, padding:26, display:"flex", flexDirection:"column", minHeight:360 }}>
              <div style={{ fontFamily:MONO, fontSize:11, color:C.accent, letterSpacing:"0.14em", marginBottom:12 }}>STEP 02</div>
              <h4 style={{ fontFamily:SERIF, fontSize:30, fontWeight:400, margin:"0 0 10px", lineHeight:1, color:C.ink }}>Observe</h4>
              <p style={{ margin:"0 0 22px", fontSize:14.5, color:C.ink2, lineHeight:1.5 }}>Events roll up into dashboards: which flows users see, how they interact, where they drop off, and which downstream business events follow.</p>
              <div style={{ marginTop:"auto" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontFamily:MONO, fontSize:11, color:C.ink3 }}>
                  <span>Completion · last 14d</span><span style={{ color:C.accent }}>+18%</span>
                </div>
                <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:70 }}>
                  {[30,38,50,58,52,68,62,74,70,82,88,92].map((h,idx) => (
                    <div key={idx} style={{ flex:1, height:`${h}%`, background: idx >= 9 ? C.accent : C.rule2, borderRadius:"2px 2px 0 0" }}/>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ background:C.paper2, border:`1px solid ${C.rule}`, borderRadius:14, padding:26, display:"flex", flexDirection:"column", minHeight:360 }}>
              <div style={{ fontFamily:MONO, fontSize:11, color:C.accent, letterSpacing:"0.14em", marginBottom:12 }}>STEP 03</div>
              <h4 style={{ fontFamily:SERIF, fontSize:30, fontWeight:400, margin:"0 0 10px", lineHeight:1, color:C.ink }}>Act</h4>
              <p style={{ margin:"0 0 22px", fontSize:14.5, color:C.ink2, lineHeight:1.5 }}>Pick winning layouts, refine prompts, enforce guardrails, escalate risky UIs to human review. Close the loop on what your model generates.</p>
              <div style={{ marginTop:"auto", display:"flex", flexDirection:"column", gap:6 }}>
                {[
                  { allow:true,  text:"chart.line · variant B", tag:"ALLOW" },
                  { allow:false, text:"form.payment + ssn",     tag:"BLOCK" },
                  { allow:false, text:"modal.confirm.destructive", tag:"REVIEW" },
                ].map(r => (
                  <div key={r.text} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", background:isDark ? DARK_CARD : C.paper, border:`1px solid ${C.rule}`, borderRadius:8, fontFamily:MONO, fontSize:11, color: r.allow ? C.data : "#ef4444" }}>
                    {r.allow
                      ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.5 L5 9 L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                      : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/><line x1="3" y1="9" x2="9" y2="3" stroke="currentColor" strokeWidth="1.4"/></svg>
                    }
                    {r.text}
                    <span style={{ marginLeft:"auto", padding:"2px 6px", borderRadius:4, fontSize:9, letterSpacing:"0.08em", background: r.allow ? C.dataSoft : isDark ? "#450a0a" : "#fef2f2", color: r.allow ? C.data : "#ef4444" }}>{r.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section id="cases">
        <div style={wrap}>
          <SectionHead C={C} num="04 / In practice" title={
            <div>
              <H2 C={C}>What you can <em style={accentItalic}>see</em> with it.</H2>
              <Lede C={C}>Three concrete shapes of generative UI we already track — and the kind of question Lens lets you answer about each.</Lede>
            </div>
          }/>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:22, marginBottom:80 }}>
            {[
              {
                prompt:'"Show MRR trend in Europe."',
                title:"Analytics copilot",
                desc:"Which generated chart variants get the longest dwell, the most exports, the fastest answer? Lens compares prompts side by side.",
                m1:"+24%", l1:"chart interactions", m2:"−1.4s", l2:"time-to-answer",
                stage: (
                  <div style={{ background:DARK_CARD, border:"1px solid #27272a", borderRadius:8, padding:14, color:"#fafaf9" }}>
                    <div style={{ fontFamily:SERIF, fontSize:15, marginBottom:10 }}>MRR · Europe</div>
                    <div style={{ fontFamily:MONO, fontSize:10, color:"#52525b", letterSpacing:"0.06em" }}>JAN — JUN 2026</div>
                    <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:38, marginTop:8 }}>
                      {[40,55,48,62,70,82,78,88,92].map((h,i) => <span key={i} style={{ flex:1, height:`${h}%`, background:C.accent, borderRadius:2, opacity:0.85 }}/>)}
                    </div>
                    <div style={{ height:1, background:"#27272a", margin:"6px 0" }}/>
                    <div style={{ display:"flex", justifyContent:"space-between", fontFamily:MONO, fontSize:10, color:"#52525b" }}><span>€2.4M</span><span>+18.4% MoM</span></div>
                  </div>
                ),
                pins:[{ label:"chart · 1.8s dwell", x:"80%", y:"38%", green:true },{ label:"export · clicked", x:"18%", y:"80%", green:false }],
              },
              {
                prompt:'"Create a new customer, assign rep."',
                title:"Internal operations agent",
                desc:"Track form completion, field-level abandonment and errors across generated flows. Surface layouts that quietly cost your team support tickets.",
                m1:"−31%", l1:"support tickets", m2:"+42%", l2:"first-pass completion",
                stage: (
                  <div style={{ background:DARK_CARD, border:"1px solid #27272a", borderRadius:8, padding:14, color:"#fafaf9" }}>
                    <div style={{ fontFamily:SERIF, fontSize:15, marginBottom:10 }}>New customer</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                      {[80,60,70,90,50].map((w,i) => (
                        <div key={i} style={{ height:18, width:`${w}%`, background:"rgba(255,255,255,0.04)", borderRadius:4, boxShadow: i===2 ? "inset 0 0 0 1px #f87171" : "none", position:"relative", overflow:"hidden" }}>
                          <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,rgba(255,255,255,0.06) 0%,transparent 50%)", borderRadius:4 }}/>
                        </div>
                      ))}
                    </div>
                    <div style={{ height:1, background:"#27272a", margin:"6px 0" }}/>
                    <div style={{ display:"flex", justifyContent:"space-between", fontFamily:MONO, fontSize:10, color:"#52525b" }}><span>5 of 7 fields</span><span style={{ color:"#f87171" }}>1 error</span></div>
                  </div>
                ),
                pins:[{ label:"field · drop-off", x:"75%", y:"56%", green:false, warn:true },{ label:"form · started", x:"22%", y:"30%", green:false }],
              },
              {
                prompt:'"Help me buy a laptop under $1,800."',
                title:"E-commerce assistant",
                desc:"Compare generated product layouts and step-by-step flows. See which ones actually reach add-to-cart — and which silently lose the user.",
                m1:"+9.1%", l1:"cart-add rate", m2:"2.3×", l2:"variant winner",
                stage: (
                  <div style={{ background:DARK_CARD, border:"1px solid #27272a", borderRadius:8, padding:14, color:"#fafaf9" }}>
                    <div style={{ fontFamily:SERIF, fontSize:15, marginBottom:10 }}>3 picks for you</div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
                      {[false,true,false].map((picked,i) => (
                        <div key={i} style={{ aspectRatio:"1", background:"rgba(255,255,255,0.04)", borderRadius:6, boxShadow: picked ? `inset 0 0 0 1.5px ${C.accent}` : "none" }}/>
                      ))}
                    </div>
                    <div style={{ height:1, background:"#27272a", margin:"6px 0" }}/>
                    <div style={{ display:"flex", justifyContent:"space-between", fontFamily:MONO, fontSize:10, color:"#52525b" }}><span>Variant B · grid</span><span style={{ color:C.accent }}>add to cart</span></div>
                  </div>
                ),
                pins:[{ label:"card · selected", x:"65%", y:"55%", green:true },{ label:"cart · +1", x:"28%", y:"82%", green:false }],
              },
            ].map(cs => (
              <div key={cs.title} style={{ background:C.paper2, border:`1px solid ${C.rule}`, borderRadius:14, overflow:"hidden", display:"flex", flexDirection:"column" }}>
                <div style={{ background:DARK_SURFACE, padding:22, position:"relative", minHeight:220, borderBottom:`1px solid ${C.rule}` }}>
                  <div style={{ fontFamily:MONO, fontSize:11.5, color:"#71717a", marginBottom:14 }}>prompt: <strong style={{ color:"#a1a1aa", fontWeight:400 }}>{cs.prompt}</strong></div>
                  {cs.stage}
                  {(cs.pins as {label:string;x:string;y:string;green:boolean;warn?:boolean}[]).map((p,pi) => (
                    <span key={pi} style={{
                      position:"absolute", display:"inline-flex", alignItems:"center", gap:6, padding:"4px 8px",
                      fontFamily:MONO, fontSize:10,
                      background: p.green ? C.dataSoft : p.warn ? "#451a03" : "#27272a",
                      color:      p.green ? C.data     : p.warn ? "#fcd34d" : "#a1a1aa",
                      borderRadius:999, whiteSpace:"nowrap", transform:"translate(-50%,-50%)",
                      boxShadow:"0 4px 12px -4px rgba(0,0,0,0.5)",
                      left:p.x, top:p.y,
                    }}>
                      <span style={{ width:5, height:5, borderRadius:"50%", background: p.green ? C.data : p.warn ? "#f59e0b" : C.accent }}/>
                      {p.label}
                    </span>
                  ))}
                </div>
                <div style={{ padding:22 }}>
                  <h4 style={{ fontFamily:SERIF, fontSize:22, fontWeight:400, margin:"0 0 8px", color:C.ink }}>{cs.title}</h4>
                  <p style={{ margin:0, fontSize:14, color:C.ink2, lineHeight:1.5 }}>{cs.desc}</p>
                  <div style={{ display:"flex", gap:16, marginTop:16, paddingTop:16, borderTop:`1px solid ${C.rule}`, fontFamily:MONO, fontSize:11, color:C.mute }}>
                    <div><b style={{ display:"block", fontFamily:SERIF, fontWeight:400, fontSize:18, color:C.ink, marginBottom:2 }}>{cs.m1}</b>{cs.l1}</div>
                    <div><b style={{ display:"block", fontFamily:SERIF, fontWeight:400, fontSize:18, color:C.ink, marginBottom:2 }}>{cs.m2}</b>{cs.l2}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO */}
      <section id="who">
        <div style={wrap}>
          <SectionHead C={C} num="05 / Who it's for" title={
            <div>
              <H2 C={C}>Built for <em style={accentItalic}>AI-native</em> product teams.</H2>
              <Lede C={C}>Three roles, one shared dashboard. Each gets the slice they need without anyone owning the whole pipeline alone.</Lede>
            </div>
          }/>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:C.rule, border:`1px solid ${C.rule}`, borderRadius:12, overflow:"hidden", marginBottom:80 }}>
            {[
              { mark:"P", title:"Product & growth", body:"Understand which generated flows actually move activation, retention and revenue — without hacking together your own logging pipeline or waiting on engineering." },
              { mark:"D", title:"Design & UX",       body:"See what the model is drawing in the wild. Measure UX quality across variants and enforce the patterns that reflect your design system, not the model's defaults." },
              { mark:"C", title:"Compliance & ops",  body:"Detect risky patterns early — exposed fields, unsafe actions, non-compliant flows — and route the riskiest UIs to human review before they ever reach a customer." },
            ].map(c => (
              <div key={c.mark} style={{ background:C.paper2, padding:"32px 28px", minHeight:220 }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:C.accentSoft, color:C.accent, display:"grid", placeItems:"center", fontFamily:SERIF, fontSize:18, marginBottom:18, border:`1px solid ${C.rule2}` }}>{c.mark}</div>
                <h4 style={{ fontFamily:SERIF, fontSize:22, margin:"0 0 10px", fontWeight:400, color:C.ink }}>{c.title}</h4>
                <p style={{ margin:0, fontSize:14.5, color:C.ink2, lineHeight:1.55 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY NOW */}
      <section id="why">
        <div style={wrap}>
          <SectionHead C={C} num="06 / Why now" title={<H2 C={C}>Generative UI needs its <em style={accentItalic}>own</em> observability.</H2>}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"start", paddingBottom:80 }}>
            <p style={{ fontFamily:SERIF, fontSize:38, lineHeight:1.1, letterSpacing:"-0.01em", margin:0, color:C.ink }}>
              The UI is no longer static — it's generated{" "}
              <em style={accentItalic}>per user, per query, in real time</em>.
            </p>
            <div>
              {["C1 and OpenUI have changed how AI apps are built. The interface isn't shipped once and measured forever — it's drawn fresh, by a model, with every conversation.",
                "Traditional observability stops at the API. It tracks tokens, latency, cost. None of it sees what the user actually saw on screen, where the layout failed, or whether the model picked a component your design team would have approved.",
                "That front-of-screen layer is what we're building. A category in itself.",
              ].map((p,i) => <p key={i} style={{ fontSize:15.5, color:C.ink2, lineHeight:1.55, margin:"0 0 14px", maxWidth:"50ch" }}>{p}</p>)}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="access">
        <div style={wrap}>
          <div style={{ background:C.paper2, border:`1px solid ${C.rule}`, borderRadius:22, padding:"64px 56px", position:"relative", overflow:"hidden", marginBottom:72 }}>
            <div style={{ position:"absolute", inset:0, background:`radial-gradient(60% 80% at 80% 20%,${C.accentSoft} 0%,transparent 60%),radial-gradient(50% 70% at 20% 80%,${C.dataSoft} 0%,transparent 60%)`, pointerEvents:"none", opacity:0.5 }}/>
            <div style={{ position:"relative", display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:56, alignItems:"center" }}>
              <div>
                <div style={{ fontFamily:MONO, fontSize:11, letterSpacing:"0.16em", textTransform:"uppercase", color:C.mute, marginBottom:14 }}>Get access</div>
                <h2 style={{ fontFamily:SERIF, fontSize:56, lineHeight:1, letterSpacing:"-0.015em", margin:"0 0 18px", fontWeight:400, color:C.ink }}>
                  Start measuring your <em style={accentItalic}>AI&nbsp;UI</em> today.
                </h2>
                <p style={{ color:C.ink2, fontSize:16, margin:"0 0 22px", maxWidth:"44ch" }}>
                  Create a free account, connect your C1 or OpenUI app, and see your first generated component in the dashboard in under fifteen minutes.
                </p>
                <ul style={{ listStyle:"none", padding:0, margin:"0 0 26px", display:"flex", flexDirection:"column", gap:8, fontFamily:MONO, fontSize:12.5, color:C.ink3 }}>
                  {["Teams shipping with C1, OpenUI or a homegrown renderer","AI copilots and agents that want real UX visibility","Free to start · no credit card required"].map(item => (
                    <li key={item}><span style={{ color:C.accent }}>→ </span>{item}</li>
                  ))}
                </ul>
              </div>
              <div style={{ background:isDark ? DARK_SURFACE : C.paper, border:`1px solid ${C.rule}`, borderRadius:16, padding:32, display:"flex", flexDirection:"column", gap:16 }}>
                <Link href="/login" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, padding:"16px 24px", background:C.accent, color:"#fff", borderRadius:10, fontFamily:MONO, fontSize:14, letterSpacing:"0.04em", textDecoration:"none", textAlign:"center" }}>
                  Get started — it&apos;s free <Arr />
                </Link>
                <Link href="/login" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, padding:"14px 24px", background:"transparent", color:C.ink2, border:`1px solid ${C.rule2}`, borderRadius:10, fontFamily:MONO, fontSize:13, letterSpacing:"0.04em", textDecoration:"none", textAlign:"center" }}>
                  Sign in to existing account
                </Link>
                <p style={{ margin:0, fontFamily:MONO, fontSize:11, color:C.mute, textAlign:"center", letterSpacing:"0.06em" }}>WORKS WITH C1 · OPENUI · CUSTOM RENDERERS</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div style={wrap}>
          <SectionHead C={C} num="07 / FAQ" title={<H2 C={C}>Short answers, <em style={accentItalic}>up front</em>.</H2>}/>
          <FAQSection C={C} />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding:"56px 0 40px", borderTop:`1px solid ${C.rule}` }}>
        <div style={{ ...wrap, display:"flex", justifyContent:"space-between", alignItems:"flex-end", gap:32, fontFamily:MONO, fontSize:11.5, color:C.mute, letterSpacing:"0.04em" }}>
          <div>
            <div style={{ fontFamily:SERIF, fontSize:80, lineHeight:0.9, color:C.ink, letterSpacing:"-0.02em" }}>
              GenUI<em style={accentItalic}>·</em>Lens
            </div>
            <div style={{ marginTop:10 }}>v0.1 — built in the open · © 2026</div>
          </div>
          <div style={{ display:"flex", gap:32 }}>
            {[
              { head:"Product",  links:["SDK","Dashboards","Policies","Experiments"] },
              { head:"Company",  links:["Manifesto","Changelog","Hiring","Press"] },
              { head:"Contact",  links:["hi@genui-lens.com","X / @genuilens","GitHub"] },
            ].map(col => (
              <div key={col.head}>
                <div style={{ color:C.ink3, marginBottom:8 }}>{col.head}</div>
                {col.links.map(l => <div key={l}>{l}</div>)}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
