// page-concepts.jsx — 哲学概念库

function PageConcepts({ focusId, onJumpAsk }) {
  const [filter, setFilter] = React.useState("全部");
  const [active, setActive] = React.useState(focusId || DATA.concepts[0].id);
  React.useEffect(() => { if (focusId) setActive(focusId); }, [focusId]);

  const schools = ["全部", ...Array.from(new Set(DATA.concepts.map(c => c.school)))];
  const list = filter === "全部" ? DATA.concepts : DATA.concepts.filter(c => c.school === filter);
  const concept = DATA.concepts.find(c => c.id === active) || DATA.concepts[0];

  const schoolColor = {
    "佛教":   "var(--celadon-deep)",
    "道家":   "var(--dai)",
    "儒家":   "var(--cinnabar-deep)",
    "宋明理学": "var(--gold)",
    "性灵":   "var(--cinnabar)",
  };

  return (
    <div data-screen-label="05 概念库" style={{ paddingTop: 40 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom: 28 }}>
        <div>
          <Eyebrow num={`${DATA.concepts.length} 条`}>philosophy concepts</Eyebrow>
          <h1 className="h-display" style={{ fontSize: 44 }}>
            <span className="zh">儒、释、道，与一些<br/>更小的名字。</span>
          </h1>
        </div>
      </div>

      {/* filter */}
      <div style={{ display:"flex", gap: 8, marginBottom: 28, borderBottom:".5px solid var(--rule)", paddingBottom: 12 }}>
        {schools.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              fontFamily:"var(--serif)", fontSize: 14,
              padding: "5px 12px 6px",
              border: "none", background:"transparent", cursor:"pointer",
              color: filter === s ? "var(--ink)" : "var(--ink-faint)",
              fontWeight: filter === s ? 600 : 400,
              borderBottom: "2px solid " + (filter === s ? "var(--cinnabar)" : "transparent"),
              marginBottom: -13,
              letterSpacing: ".04em",
            }}>{s}</button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {list.map(c => {
          const a = c.id === active;
          return (
            <div key={c.id} onClick={() => setActive(c.id)}
              style={{
                padding: "16px 18px 18px",
                border: ".5px solid " + (a ? "var(--cinnabar)" : "var(--rule)"),
                background: a ? "#fff" : "rgba(255,255,255,.42)",
                cursor: "pointer",
                position: "relative",
                transition: "all .15s",
              }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                <span style={{ fontFamily:"var(--serif)", fontSize: 22, fontWeight: 500 }}>{c.name}</span>
                <span style={{ fontFamily:"var(--mono)", fontSize: 9.5, letterSpacing:".1em", color: schoolColor[c.school] || "var(--ink-faint)", textTransform:"uppercase" }}>{c.school}</span>
              </div>
              <div style={{ fontFamily:"var(--mono)", fontSize: 10, color:"var(--ink-faint)", marginTop: 2, marginBottom: 10, letterSpacing:".04em" }}>{c.id}</div>
              <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-mute)", lineHeight: 1.7 }}>
                {c.desc}
              </p>
              {a && (
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: ".5px dashed var(--rule)" }}>
                  <div style={{ fontFamily:"var(--mono)", fontSize: 9.5, letterSpacing:".1em", color:"var(--ink-faint)", marginBottom: 6 }}>RELATED</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap: 6, marginBottom: 12 }}>
                    {c.related.map(r => <Tag key={r}>{r}</Tag>)}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onJumpAsk && onJumpAsk(`${c.name}在《红楼梦》中如何体现？`); }}
                    style={{
                      fontFamily:"var(--serif)", fontSize: 12.5,
                      padding: "4px 10px 5px",
                      background:"var(--cinnabar)", color:"var(--paper)",
                      border:"none", cursor:"pointer", borderRadius: 2,
                    }}>用此概念去问 →</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
window.PageConcepts = PageConcepts;
