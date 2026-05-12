// page-characters.jsx — 人物哲学画像

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
          <ImagePlaceholder h={420} label={`portrait · ${ch.id}`} />
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
            {["hlm_ch003_p012", "hlm_ch027_p008", "hlm_ch054_p003", "hlm_ch078_p015"].map(id => (
              <CiteChip key={id} kind="passage" id={id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
window.PageCharacters = PageCharacters;
