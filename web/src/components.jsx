// components.jsx — shared UI atoms

const { useState, useEffect, useRef, useMemo } = React;
const DATA = window.RMM_DATA;

// — Eyebrow label —
function Eyebrow({ children, num }) {
  return (
    <div className="eyebrow">
      <span>{children}</span>
      {num != null && <span style={{ color: "var(--ink-faint)", letterSpacing: 0 }}>· {num}</span>}
    </div>
  );
}

// — Citation chip —
// formats raw IDs into readable Chinese labels by default.
//   hlm_ch005_p005 → 第五回·§005
//   buddhism_sunyata → 概念·色空
//   scene_xxx → 场景·...
function _zhNum(n) {
  const map = ["零","一","二","三","四","五","六","七","八","九","十"];
  if (n <= 10) return map[n];
  if (n < 20) return "十" + (n % 10 ? map[n % 10] : "");
  if (n < 100) {
    const t = Math.floor(n/10), o = n % 10;
    return map[t] + "十" + (o ? map[o] : "");
  }
  return String(n);
}
function formatCiteId(id, kind) {
  if (!id) return "";
  if (kind === "passage" || /^hlm_ch\d+_p\d+/.test(id)) {
    const m = id.match(/^hlm_ch(\d+)_p(\d+)/);
    if (m) return `第${_zhNum(parseInt(m[1],10))}回 · §${m[2]}`;
  }
  if (kind === "concept" || (window.RMM_DATA && window.RMM_DATA.concepts.some(c => c.id === id))) {
    const c = window.RMM_DATA && window.RMM_DATA.concepts.find(c => c.id === id);
    if (c) return `${c.name}`;
  }
  if (kind === "scene" || /^scene_/.test(id)) {
    const s = window.RMM_DATA && window.RMM_DATA.scenes.find(s => s.id === id);
    if (s) return s.name;
  }
  return id;
}
function CiteChip({ kind = "passage", id, label, onClick, active, raw }) {
  const display = label || (raw ? id : formatCiteId(id, kind));
  return (
    <span
      className={`chip chip--${kind} ${active ? "chip--active" : ""}`}
      onClick={onClick}
      title={id}
    >
      {display}
    </span>
  );
}

// — Tag —
function Tag({ children }) { return <span className="tag">{children}</span>; }

// — Section title with optional small Chinese ordinal —
function SectionTitle({ ordinal, children, en }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 18 }}>
      {ordinal != null && (
        <span style={{
          fontFamily: "var(--serif)", color: "var(--cinnabar)",
          fontSize: 14, fontWeight: 500, letterSpacing: ".1em",
          minWidth: 28
        }}>{ordinal}</span>
      )}
      <h2 className="h-section" style={{ flex: 1 }}>{children}</h2>
      {en && <span style={{ fontFamily: "var(--display)", fontStyle: "italic", color: "var(--ink-faint)", fontSize: 14 }}>{en}</span>}
    </div>
  );
}

// — Vertical Chinese label —
function Vlabel({ children, style }) {
  return (
    <span style={{
      writingMode: "vertical-rl", textOrientation: "upright",
      fontFamily: "var(--serif)", letterSpacing: ".15em",
      ...style
    }}>{children}</span>
  );
}

// — Big seal stamp —
function Seal({ text, size = 56, rotate = -3, style }) {
  return (
    <div style={{
      width: size, height: size,
      background: "var(--cinnabar)",
      color: "#f6e5c4",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--serif)", fontWeight: 600,
      fontSize: size * 0.32,
      letterSpacing: ".05em",
      writingMode: text && text.length >= 2 ? "vertical-rl" : "horizontal-tb",
      textOrientation: "upright",
      boxShadow: "inset 0 0 0 1.5px rgba(255,235,200,.35), 0 1px 0 rgba(0,0,0,.05)",
      transform: `rotate(${rotate}deg)`,
      borderRadius: 3,
      ...style
    }}>{text}</div>
  );
}

// — Typewriter that reveals text char by char —
function useTypewriter(fullText, speed = 18, start = true) {
  const [n, setN] = useState(start ? 0 : 0);
  useEffect(() => {
    if (!start) { setN(0); return; }
    setN(0);
    let i = 0;
    const tick = () => {
      i = Math.min(i + 1, fullText.length);
      setN(i);
      if (i < fullText.length) {
        const c = fullText[i - 1] || "";
        // pause longer at punctuation
        const delay = /[，。；：]/.test(c) ? speed * 6 : /[、,]/.test(c) ? speed * 3 : speed;
        timer = setTimeout(tick, delay);
      }
    };
    let timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [fullText, speed, start]);
  return { shown: fullText.slice(0, n), done: n >= fullText.length };
}

// — Loading dots row —
function Dots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: "50%",
          background: "var(--celadon-deep)",
          animation: `blink 1.1s ${i*0.18}s infinite ease-in-out`
        }} />
      ))}
    </span>
  );
}

// — Stage line: shows a process step —
function StageLine({ label, done, active }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap: 10, fontFamily:"var(--mono)", fontSize: 11.5, color: done? "var(--ink-2)" : "var(--ink-faint)", letterSpacing: ".04em" }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: done ? "var(--celadon-deep)" : active ? "var(--cinnabar)" : "transparent",
        border: ".5px solid " + (done || active ? "transparent" : "var(--rule-strong)"),
        transition: "all .25s"
      }} />
      <span>{label}</span>
      {active && !done && <Dots />}
    </div>
  );
}

// — Bar (for eval / character schools) —
function MiniBar({ value, max = 100, color = "var(--celadon-deep)", w = 120 }) {
  return (
    <span style={{ display: "inline-block", width: w, height: 4, background: "rgba(29,38,40,.08)", verticalAlign: "middle" }}>
      <span style={{ display: "block", height: "100%", width: `${(value/max)*100}%`, background: color, transition:"width .6s" }} />
    </span>
  );
}

// — Image placeholder (subtle striped) —
function ImagePlaceholder({ w = "100%", h = 220, label = "image", style }) {
  return (
    <div style={{
      width: w, height: h,
      background:
        "repeating-linear-gradient(45deg, rgba(29,38,40,.06) 0 2px, transparent 2px 9px), rgba(255,255,255,.35)",
      border: ".5px solid var(--rule)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--ink-faint)",
      letterSpacing: ".18em", textTransform:"uppercase",
      ...style
    }}>{label}</div>
  );
}

// — Make these globally available to other babel scripts —
Object.assign(window, {
  CiteChip, Tag, SectionTitle, Vlabel, Seal,
  Eyebrow, useTypewriter, Dots, StageLine, MiniBar, ImagePlaceholder, DATA,
});
