// page-scenes.jsx — 情节场景索引浏览

function PageScenes({ focusId, onJumpAsk }) {
  const [active, setActive] = React.useState(focusId || DATA.scenes[0].id);
  React.useEffect(() => { if (focusId) setActive(focusId); }, [focusId]);
  const scene = DATA.scenes.find(s => s.id === active) || DATA.scenes[0];

  return (
    <div data-screen-label="04 场景索引" style={{ paddingTop: 40 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom: 32 }}>
        <div>
          <Eyebrow num={`${DATA.scenes.length} 条目`}>scene index · 别名表</Eyebrow>
          <h1 className="h-display" style={{ fontSize: 44 }}>
            <span className="zh">情节，与它的另一些名字。</span>
          </h1>
        </div>
        <div style={{ fontFamily:"var(--mono)", fontSize: 11, color:"var(--ink-faint)", letterSpacing:".06em", textAlign:"right", maxWidth: 280 }}>
          把「葬花」「葬花词」「埋香冢」<br/>映射到第二十七回
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: "320px 1fr", gap: 56 }}>
        {/* list */}
        <div style={{ borderRight: ".5px solid var(--rule)", paddingRight: 24 }}>
          {DATA.scenes.map((s, i) => {
            const a = s.id === active;
            return (
              <div key={s.id} onClick={() => setActive(s.id)}
                style={{
                  display:"flex", gap: 12, padding: "12px 0",
                  borderBottom: ".5px solid var(--rule)",
                  cursor: "pointer",
                  background: a ? "rgba(185,75,60,.04)" : "transparent",
                  margin: a ? "0 -12px" : "0",
                  paddingLeft: a ? 12 : 0,
                  paddingRight: a ? 12 : 0,
                  borderLeft: a ? "2px solid var(--cinnabar)" : "none",
                }}>
                <span style={{ fontFamily:"var(--mono)", fontSize: 10.5, color:"var(--ink-faint)", minWidth: 22, paddingTop: 4 }}>
                  {String(i+1).padStart(2,"0")}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily:"var(--serif)", fontSize: 16.5, fontWeight: a ? 600 : 500 }}>
                    {s.name}
                  </div>
                  <div style={{ fontFamily:"var(--mono)", fontSize: 10, color:"var(--ink-faint)", letterSpacing:".05em", marginTop: 2 }}>
                    ch. {s.chapters.join(", ")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* detail */}
        <div>
          <Eyebrow num={`ch. ${scene.chapters.join(", ")}`}>{scene.id}</Eyebrow>
          <h2 className="h-section" style={{ fontSize: 38, marginBottom: 8 }}>{scene.name}</h2>
          <div style={{ fontFamily:"var(--kai)", fontSize: 18, color:"var(--ink-mute)", marginBottom: 32 }}>
            一处情节，多种说法
          </div>

          <div style={{ display:"grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
            <div>
              <Eyebrow>aliases · 别名</Eyebrow>
              <div style={{ display:"flex", flexWrap:"wrap", gap: 6 }}>
                {scene.aliases.map(a => (
                  <span key={a} style={{
                    fontFamily:"var(--serif)", fontSize: 14,
                    padding: "3px 10px 4px",
                    background: "rgba(255,255,255,.6)",
                    border:".5px solid var(--rule-strong)",
                    borderRadius: 2,
                  }}>{a}</span>
                ))}
              </div>
            </div>
            <div>
              <Eyebrow>keywords · 主题</Eyebrow>
              <div style={{ display:"flex", flexWrap:"wrap", gap: 6 }}>
                {scene.keywords.map(k => <Tag key={k}>#{k}</Tag>)}
              </div>
            </div>
          </div>

          <hr className="rule" />
          <Eyebrow>retrieval boost · 影响</Eyebrow>
          <div style={{ fontSize: 15, lineHeight: 1.8, color: "var(--ink-2)", marginBottom: 24 }}>
            当问句中出现任一别名时，系统会把
            {scene.chapters.map(ch => <span key={ch} style={{ margin: "0 4px", fontFamily:"var(--mono)", color: "var(--cinnabar)" }}>第{ch}回</span>)}
            的 passages 加权，使得检索结果更稳定地落在正确章节。
          </div>

          <Eyebrow>example query → top hit</Eyebrow>
          <div className="card" style={{ display:"flex", alignItems:"center", gap: 16 }}>
            <span style={{ fontFamily:"var(--serif)", fontSize: 16, flex: 1 }}>
              「{scene.aliases[0]}{scene.keywords[0] ? `体现了什么${scene.keywords[0]}观` : ""}？」
            </span>
            <span style={{ fontFamily:"var(--mono)", fontSize: 10.5, color:"var(--ink-faint)" }}>→</span>
            <CiteChip kind="passage" id={`hlm_ch${String(scene.chapters[0]).padStart(3,"0")}_p005`} />
          </div>

          <div style={{ marginTop: 28, display:"flex", gap: 12 }}>
            <button className="btn" onClick={() => onJumpAsk && onJumpAsk(`${scene.aliases[0]}体现了什么${scene.keywords[0]||"思想"}？`)}>
              用这个去问 →
            </button>
            <button className="btn btn--ghost">复制 scene_id</button>
          </div>
        </div>
      </div>
    </div>
  );
}
window.PageScenes = PageScenes;
