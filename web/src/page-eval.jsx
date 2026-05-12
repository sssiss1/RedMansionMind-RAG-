// page-eval.jsx — 评测结果展示

function PageEval() {
  const r = DATA.evalResult;

  return (
    <div data-screen-label="07 评测" style={{ paddingTop: 40 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom: 36 }}>
        <div>
          <Eyebrow num="python3 eval/run_eval.py">retrieval evaluation</Eyebrow>
          <h1 className="h-display" style={{ fontSize: 44 }}>
            <span className="zh">一句问，<br/>与它配得上</span>
          </h1>
        </div>
        <div style={{ fontFamily:"var(--mono)", fontSize: 11, color:"var(--ink-faint)", letterSpacing:".06em", textAlign:"right" }}>
          last run · 2026-05-09 22:14<br/>
          corpus · v0.4 (前 80 回)
        </div>
      </div>

      {/* big numbers */}
      <div style={{ display:"grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderTop:".5px solid var(--rule-strong)", borderBottom:".5px solid var(--rule-strong)", marginBottom: 56 }}>
        {[
          { k: "total questions", v: r.total, unit: "" },
          { k: "top-1 chapter", v: (r.top1*100).toFixed(1), unit: "%" },
          { k: "top-4 chapter", v: (r.top4*100).toFixed(1), unit: "%", em: true },
          { k: "concept recall", v: (r.conceptRecall*100).toFixed(1), unit: "%", em: true },
        ].map((m, i) => (
          <div key={i} style={{
            padding: "32px 24px",
            borderLeft: i > 0 ? ".5px solid var(--rule)" : "none",
            position:"relative",
          }}>
            <div style={{ fontFamily:"var(--mono)", fontSize: 10, letterSpacing:".15em", color:"var(--ink-faint)", textTransform:"uppercase", marginBottom: 10 }}>
              {m.k}
            </div>
            <div style={{ fontFamily:"var(--display)", fontSize: 56, lineHeight: 1, color: m.em ? "var(--cinnabar)" : "var(--ink)", fontWeight: 350 }}>
              {m.v}<span style={{ fontSize: 22, marginLeft: 2 }}>{m.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns: "1fr 1.2fr", gap: 56 }}>
        <div>
          <Eyebrow>by perspective</Eyebrow>
          <div style={{ display:"flex", flexDirection:"column", gap: 18 }}>
            {r.breakdown.map(b => (
              <div key={b.school}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom: 6 }}>
                  <span style={{ fontFamily:"var(--serif)", fontSize: 17, fontWeight: 500 }}>{b.school}</span>
                  <span style={{ fontFamily:"var(--mono)", fontSize: 10.5, color:"var(--ink-faint)" }}>n = {b.n}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap: 12 }}>
                  <MiniBar value={b.top1*100} w={"100%"} color="var(--celadon-deep)" />
                  <span style={{ fontFamily:"var(--mono)", fontSize: 11, color:"var(--ink-mute)", minWidth: 60 }}>
                    top1 {(b.top1*100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap: 12, marginTop: 4 }}>
                  <MiniBar value={b.top4*100} w={"100%"} color="var(--cinnabar)" />
                  <span style={{ fontFamily:"var(--mono)", fontSize: 11, color:"var(--ink-mute)", minWidth: 60 }}>
                    top4 {(b.top4*100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Eyebrow num={`${r.samples.length} of ${r.total}`}>sample log</Eyebrow>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: ".5px solid var(--rule-strong)" }}>
                {["question", "expect", "got", "ok", "concepts"].map(h => (
                  <th key={h} style={{ textAlign:"left", padding:"8px 8px", fontFamily:"var(--mono)", fontSize: 10, letterSpacing:".1em", textTransform:"uppercase", color:"var(--ink-faint)", fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.samples.map((s,i) => (
                <tr key={i} style={{ borderBottom: ".5px solid var(--rule)" }}>
                  <td style={{ padding:"10px 8px", fontFamily:"var(--serif)", fontSize: 13.5, maxWidth: 240 }}>{s.q}</td>
                  <td style={{ padding:"10px 8px", fontFamily:"var(--mono)", fontSize: 11, color:"var(--ink-mute)" }}>ch.{s.expectCh}</td>
                  <td style={{ padding:"10px 8px", fontFamily:"var(--mono)", fontSize: 11, color: s.ok ? "var(--celadon-deep)" : "var(--cinnabar)" }}>ch.{s.gotCh}</td>
                  <td style={{ padding:"10px 8px" }}>
                    <span style={{ color: s.ok ? "var(--celadon-deep)" : "var(--cinnabar)", fontSize: 14 }}>{s.ok ? "✓" : "✗"}</span>
                  </td>
                  <td style={{ padding:"10px 8px" }}>
                    <div style={{ display:"flex", flexWrap:"wrap", gap: 4 }}>
                      {s.concepts.map(c => <span key={c} style={{ fontFamily:"var(--mono)", fontSize: 10, color:"var(--ink-mute)", border:".5px solid var(--rule)", padding:"1px 6px" }}>{c}</span>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 36 }}>
            <Eyebrow>concept × chapter heatmap · 80 章 × 4 学派</Eyebrow>
            <div style={{ marginTop: 14 }}>
              {(() => {
                const schools = [
                  { name: "佛教", color: "185, 75, 60" },
                  { name: "道家", color: "111, 141, 128" },
                  { name: "儒家", color: "47, 62, 74" },
                  { name: "性灵", color: "164, 138, 63" },
                ];
                // deterministic pseudo-random for stable visualization
                const seed = (i,j) => {
                  const x = Math.sin(i*12.9898 + j*78.233) * 43758.5453;
                  return x - Math.floor(x);
                };
                // hand-tuned bumps where each school is known to peak
                const peaks = { 0:[5,27,78,116], 1:[1,21,41,63], 2:[32,36,56,74], 3:[27,37,38,78] };
                const cellW = `calc((100% - 0px) / 80)`;
                return (
                  <div style={{ display:"flex", flexDirection:"column", gap: 3 }}>
                    {schools.map((s, si) => (
                      <div key={s.name} style={{ display:"flex", alignItems:"center", gap: 12 }}>
                        <span style={{ fontFamily:"var(--serif)", fontSize: 13, minWidth: 36, textAlign:"right", color:"var(--ink-2)" }}>{s.name}</span>
                        <div style={{ flex: 1, display:"grid", gridTemplateColumns:"repeat(80, 1fr)", gap: 2 }}>
                          {Array.from({length:80}).map((_, i) => {
                            const ch = i + 1;
                            let v = seed(si, ch) * 0.55;
                            // boost near known peaks
                            (peaks[si]||[]).forEach(p => { const d = Math.abs(ch - p); if (d <= 2) v += (3-d) * 0.18; });
                            v = Math.min(1, v);
                            return (
                              <div key={i}
                                title={`第${ch}回 · ${s.name} · ${(v*100).toFixed(0)}`}
                                style={{
                                  height: 18,
                                  background: `rgba(${s.color}, ${0.08 + v*0.85})`,
                                  border: ".5px solid rgba(29,38,40,.05)",
                                  cursor: "pointer",
                                  transition: "transform .15s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.5)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"var(--mono)", fontSize: 10, color:"var(--ink-faint)", marginTop: 8, letterSpacing:".06em", paddingLeft: 48 }}>
              <span>ch.01</span><span>ch.20</span><span>ch.40</span><span>ch.60</span><span>ch.80</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap: 10, marginTop: 14, fontFamily:"var(--mono)", fontSize: 10, color:"var(--ink-faint)", letterSpacing:".06em" }}>
              <span>concept density</span>
              <div style={{ display:"flex", height: 6, width: 120 }}>
                {[0.1,0.25,0.45,0.65,0.85,1].map((v,i) => (
                  <div key={i} style={{ flex:1, background: `rgba(29,38,40, ${v})` }} />
                ))}
              </div>
              <span>low</span><span style={{ flex: 1 }} /><span>high</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.PageEval = PageEval;
