// page-quiz.jsx — 红楼价值观测试

function PageQuiz() {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState([]);
  const qs = DATA.quizQuestions;
  const done = step >= qs.length;

  const choose = (optIdx) => {
    const next = [...answers, optIdx];
    setAnswers(next);
    setStep(s => s + 1);
  };

  const reset = () => { setStep(0); setAnswers([]); };

  // tally
  const scores = React.useMemo(() => {
    const s = {};
    answers.forEach((optIdx, qi) => {
      const w = qs[qi].options[optIdx].weights;
      Object.entries(w).forEach(([k,v]) => { s[k] = (s[k]||0)+v; });
    });
    return s;
  }, [answers]);

  const ranked = Object.entries(scores).sort((a,b) => b[1]-a[1]);
  const top = ranked[0] && DATA.characters.find(c => c.id === ranked[0][0]);
  const maxScore = ranked[0] ? ranked[0][1] : 1;

  return (
    <div data-screen-label="03 价值观测试" style={{ paddingTop: 40 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", gap: 24, marginBottom: 36 }}>
        <div>
          <Eyebrow>quiz · {qs.length} 问</Eyebrow>
          <h1 className="h-display" style={{ fontSize: 44 }}>
            <span className="zh">大观园里的月亮，<br/>照见每个人不同的影子</span>
          </h1>
        </div>
        <Seal text="閒情" size={56} rotate={3} />
      </div>

      {!done && (
        <>
          {/* progress */}
          <div style={{ display:"flex", gap: 8, marginBottom: 36 }}>
            {qs.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 3,
                background: i < step ? "var(--cinnabar)" : i === step ? "var(--celadon-deep)" : "rgba(29,38,40,.12)",
                transition: "background .3s",
              }} />
            ))}
          </div>
          <div style={{ fontFamily:"var(--mono)", fontSize: 10.5, color:"var(--ink-faint)", letterSpacing:".12em", marginBottom: 16 }}>
            第 {String(step+1).padStart(2,"0")} 问 / 共 {String(qs.length).padStart(2,"0")}
          </div>

          <div style={{ fontFamily:"var(--serif)", fontSize: 30, fontWeight: 500, lineHeight: 1.4, marginBottom: 32, maxWidth: 720 }}>
            {qs[step].q}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap: 10, maxWidth: 720 }}>
            {qs[step].options.map((o, i) => (
              <button key={i} onClick={() => choose(i)}
                style={{
                  textAlign:"left", padding: "16px 20px",
                  fontFamily:"var(--serif)", fontSize: 17, lineHeight: 1.55,
                  border:".5px solid var(--rule-strong)", background:"rgba(255,255,255,.55)",
                  cursor:"pointer", color:"var(--ink)", borderRadius: 2,
                  display:"flex", gap: 18, alignItems:"flex-start",
                  transition: "all .15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--cinnabar)"; e.currentTarget.style.background = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--rule-strong)"; e.currentTarget.style.background = "rgba(255,255,255,.55)"; }}
              >
                <span style={{ fontFamily:"var(--mono)", fontSize: 11.5, color:"var(--cinnabar)", paddingTop: 4, minWidth: 18 }}>{String.fromCharCode(65+i)}.</span>
                <span>{o.text}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {done && top && (
        <div className="fade-in">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 48, alignItems:"start", marginBottom: 40 }}>
            <div>
              <Eyebrow>result · 你最近于</Eyebrow>
              <h2 style={{ fontFamily:"var(--display)", fontSize: 88, lineHeight: 1, margin: "0 0 8px", fontWeight: 300 }}>
                <span style={{ fontFamily:"var(--serif)", fontWeight: 500 }}>{top.name}</span>
              </h2>
              <div style={{ fontFamily:"var(--kai)", fontSize: 20, color:"var(--cinnabar)", marginBottom: 24 }}>
                {top.subtitle}
              </div>
              <p style={{ fontFamily:"var(--serif)", fontSize: 16, lineHeight: 1.85, color:"var(--ink-2)", margin: "0 0 24px" }}>
                {top.summary}
              </p>
              <div style={{ display:"flex", gap: 8, flexWrap:"wrap", marginBottom: 24 }}>
                {top.tags.map(t => <Tag key={t}>{t}</Tag>)}
              </div>
              <button className="btn btn--ghost" onClick={reset}>再测一次 ↻</button>
            </div>

            <aside>
              <Eyebrow>哲学倾向</Eyebrow>
              <div style={{ display:"flex", flexDirection:"column", gap: 14, marginBottom: 28 }}>
                {Object.entries(top.schools).map(([k,v]) => (
                  <div key={k}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom: 4, fontSize: 13, fontFamily:"var(--serif)" }}>
                      <span>{k}</span>
                      <span style={{ fontFamily:"var(--mono)", fontSize: 11, color:"var(--ink-faint)" }}>{v}</span>
                    </div>
                    <MiniBar value={v} w={"100%"} color="var(--celadon-deep)" />
                  </div>
                ))}
              </div>

              <Eyebrow>相邻者</Eyebrow>
              <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
                {ranked.slice(1, 4).map(([id, s]) => {
                  const ch = DATA.characters.find(c => c.id === id);
                  if (!ch) return null;
                  return (
                    <div key={id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:".5px solid var(--rule)" }}>
                      <span style={{ fontFamily:"var(--serif)", fontSize: 15 }}>{ch.name}</span>
                      <span style={{ fontFamily:"var(--mono)", fontSize: 11, color: "var(--ink-faint)" }}>{Math.round(s/maxScore*100)}%</span>
                    </div>
                  );
                })}
              </div>
            </aside>
          </div>

          <hr className="rule rule--strong" />
          <Eyebrow>your path · 你的选择</Eyebrow>
          <ol style={{ paddingLeft: 0, listStyle:"none", margin: 0 }}>
            {answers.map((optIdx, qi) => (
              <li key={qi} style={{ padding: "10px 0", borderBottom: ".5px solid var(--rule)", display:"flex", gap: 18, alignItems:"baseline" }}>
                <span style={{ fontFamily:"var(--mono)", fontSize: 11, color:"var(--cinnabar)", minWidth: 24 }}>{String(qi+1).padStart(2,"0")}</span>
                <span style={{ flex: 1, fontFamily:"var(--serif)" }}>
                  <span style={{ color:"var(--ink-faint)" }}>{qs[qi].q}</span>
                  <span style={{ display:"block", marginTop: 4, color:"var(--ink)" }}>→ {qs[qi].options[optIdx].text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
window.PageQuiz = PageQuiz;
