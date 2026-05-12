// page-characters.jsx — 人物哲学画像

function CharPortrait({ ch, h = 420 }) {
  if (ch.image) {
    return (
      <figure style={{
        margin: 0,
        height: h,
        border: ".5px solid var(--rule)",
        background: "rgba(255,255,255,.35)",
        overflow: "hidden",
      }}>
        <img
          src={ch.image}
          alt={ch.imageAlt || `${ch.name}人物画像`}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 28%",
          }}
        />
      </figure>
    );
  }
  if (ch.id === "daiyu") {
    return (
      <svg viewBox="0 0 320 420" xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: h, display: "block", border: ".5px solid var(--rule)" }}
        role="img" aria-label="林黛玉 · 瀟湘竹影">
        <defs>
          <pattern id="dy_paper" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="#ece5cf" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#1d2628" strokeOpacity=".035" />
          </pattern>
        </defs>
        <rect width="320" height="420" fill="url(#dy_paper)" />

        {/* main bamboo stalk */}
        <g fill="none" stroke="#1d2628" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 76 410 C 74 340 80 260 84 180 C 88 100 92 50 96 14" strokeWidth="3.2" />
          <g strokeWidth="1.8">
            <path d="M 70 340 L 84 338" />
            <path d="M 73 270 L 86 268" />
            <path d="M 77 195 L 90 193" />
            <path d="M 81 115 L 94 113" />
            <path d="M 86 50 L 98 48" />
          </g>

          {/* secondary stalk, receded */}
          <path d="M 138 410 C 140 330 146 250 150 160 C 154 100 158 70 160 40" strokeWidth="1.8" opacity=".35" />
          <g strokeWidth="1.3" opacity=".35">
            <path d="M 132 320 L 144 318" />
            <path d="M 136 240 L 148 238" />
            <path d="M 141 160 L 152 158" />
          </g>
        </g>

        {/* leaves — brush-stroke teardrops */}
        <g fill="#1d2628">
          {/* top cluster */}
          <path d="M 96 14 Q 142 6 184 -4 Q 148 18 100 34 Z" />
          <path d="M 95 30 Q 128 32 166 36 Q 128 50 96 50 Z" opacity=".82" />
          <path d="M 90 22 Q 58 16 24 2 Q 58 30 92 42 Z" opacity=".78" />

          {/* mid cluster */}
          <path d="M 86 178 Q 120 172 156 162 Q 120 192 88 198 Z" />
          <path d="M 84 200 Q 52 200 18 194 Q 52 220 86 220 Z" opacity=".8" />
          <path d="M 84 216 Q 110 224 136 232 Q 108 230 84 228 Z" opacity=".68" />

          {/* low scatter */}
          <path d="M 80 310 Q 108 304 138 292 Q 108 318 82 326 Z" opacity=".7" />
          <path d="M 78 330 Q 56 336 32 340 Q 56 348 80 346 Z" opacity=".5" />
        </g>

        {/* fallen leaf — the sole splash of cinnabar */}
        <path d="M 222 352 Q 252 348 276 336 Q 254 366 226 368 Z" fill="#b94b3c" opacity=".88" />

        {/* vertical inscription */}
        <g fontFamily="var(--serif), serif" fill="#1d2628" opacity=".55" fontSize="14">
          <text x="278" y="40">瀟</text>
          <text x="278" y="60">湘</text>
          <text x="278" y="80">竹</text>
          <text x="278" y="100">影</text>
        </g>

        {/* seal */}
        <g transform="translate(252, 366)">
          <rect width="40" height="40" fill="#b94b3c" rx="2" />
          <text x="20" y="29" fill="#f6e5c4" fontFamily="var(--serif), serif"
            fontSize="20" fontWeight="600" textAnchor="middle">黛</text>
        </g>
      </svg>
    );
  }
  return <ImagePlaceholder h={h} label={`portrait · ${ch.id}`} />;
}

function PageCharacters() {
  const [active, setActive] = React.useState(DATA.characters[0].id);
  const ch = DATA.characters.find(c => c.id === active);

  return (
    <div data-screen-label="06 人物画像" style={{ paddingTop: 40 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom: 32 }}>
        <div>
          <Eyebrow>character philosophy profiles</Eyebrow>
          <h1 className="h-display" style={{ fontSize: 44 }}>
            <span className="zh">红楼众生，各执一理。</span>
          </h1>
        </div>
      </div>

      {/* horizontal character picker */}
      <div style={{ display:"flex", gap: 16, overflowX:"auto", paddingBottom: 12, marginBottom: 32, borderBottom: ".5px solid var(--rule)" }}>
        {DATA.characters.map(c => {
          const a = c.id === active;
          return (
            <div key={c.id} onClick={() => setActive(c.id)}
              style={{
                cursor:"pointer", flexShrink: 0,
                padding: "12px 18px 14px",
                border: ".5px solid " + (a ? "var(--cinnabar)" : "var(--rule-strong)"),
                background: a ? "#fff" : "rgba(255,255,255,.45)",
                minWidth: 140,
              }}>
              <div style={{ fontFamily:"var(--serif)", fontSize: 20, fontWeight: 500, color: a ? "var(--cinnabar)" : "var(--ink)" }}>{c.name}</div>
              <div style={{ fontFamily:"var(--mono)", fontSize: 9.5, color:"var(--ink-faint)", letterSpacing:".06em", marginTop: 4 }}>{c.id}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap: 56 }}>
        {/* portrait */}
        <div>
          <CharPortrait ch={ch} h={420} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginTop: 18 }}>
            <h2 style={{ fontFamily:"var(--display)", fontSize: 64, lineHeight: 1, margin: 0, fontWeight: 300 }}>
              <span style={{ fontFamily:"var(--serif)", fontWeight: 500 }}>{ch.name}</span>
            </h2>
            <Seal text={ch.name.slice(-1)} size={42} rotate={-2} />
          </div>
          <div style={{ fontFamily:"var(--kai)", fontSize: 20, color:"var(--cinnabar)", marginTop: 6 }}>{ch.subtitle}</div>
        </div>

        {/* analysis */}
        <div>
          <Eyebrow>summary</Eyebrow>
          <p style={{ fontFamily:"var(--serif)", fontSize: 17, lineHeight: 1.85, color: "var(--ink-2)", margin: "0 0 32px" }}>
            {ch.summary}
          </p>

          <div style={{ display:"flex", gap: 8, flexWrap:"wrap", marginBottom: 32 }}>
            {ch.tags.map(t => <Tag key={t}>{t}</Tag>)}
          </div>

          <hr className="rule" />

          <Eyebrow>philosophical inclination</Eyebrow>
          <div style={{ display:"flex", flexDirection:"column", gap: 14, marginBottom: 32 }}>
            {Object.entries(ch.schools).map(([k,v]) => (
              <div key={k}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom: 5, fontSize: 13.5, fontFamily:"var(--serif)" }}>
                  <span style={{ letterSpacing:".05em" }}>{k}</span>
                  <span style={{ fontFamily:"var(--mono)", fontSize: 11, color:"var(--ink-faint)" }}>{v}</span>
                </div>
                <MiniBar value={v} w={"100%"} color={v >= 60 ? "var(--cinnabar)" : "var(--celadon-deep)"} />
              </div>
            ))}
          </div>

          <Eyebrow>key passages</Eyebrow>
          <div style={{ display:"flex", flexWrap:"wrap", gap: 6 }}>
            {(ch.keyPassages || ["hlm_ch003_p012", "hlm_ch027_p008", "hlm_ch054_p003", "hlm_ch078_p015"]).map(id => (
              <CiteChip key={id} kind="passage" id={id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
window.PageCharacters = PageCharacters;
