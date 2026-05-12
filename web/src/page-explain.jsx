// page-explain.jsx — beginner-friendly explanation page (real API)

function PageExplain() {
  const [topicId, setTopicId] = React.useState("buddhism_sunyata");
  const [activeQuestion, setActiveQuestion] = React.useState("");
  const [llmOn, setLlmOn] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState(null);

  const runExplain = async (questionText, conceptId) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveQuestion(questionText);
    if (conceptId) setTopicId(conceptId);
    try {
      const params = new URLSearchParams({ question: questionText, perspective: "综合", llm: llmOn ? "1" : "0" });
      const resp = await fetch(`/api/explain?${params}`);
      const data = await resp.json();
      setResult(data);
    } catch (e) {
      setError("请求失败，请检查服务是否正常。");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const concept = DATA.concepts.find(c => c.id === topicId);
    if (concept) runExplain(`${concept.name}在《红楼梦》中如何体现？`, concept.id);
    // eslint-disable-next-line
  }, []);

  const onSelectConcept = (c) => {
    runExplain(`${c.name}在《红楼梦》中如何体现？`, c.id);
  };

  const onNextQuestion = (q) => {
    runExplain(q, null);
  };

  return (
    <div data-screen-label="02 科普解释" style={{ paddingTop: 40 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", gap: 24, marginBottom: 32 }}>
        <div>
          <Eyebrow>explain mode · /api/explain</Eyebrow>
          <h1 className="h-display" style={{ fontSize: 44 }}>
            <span className="zh">把术语，讲成大白话。</span>
          </h1>
        </div>
        <div style={{ fontFamily:"var(--mono)", fontSize: 11, color:"var(--ink-faint)", letterSpacing:".06em", textAlign:"right", maxWidth: 260 }}>
          适用于不太熟悉儒释道概念的<br/>读者，给出更口语化的阐释
          <label style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap: 6, marginTop: 8, cursor:"pointer" }}>
            <input type="checkbox" checked={llmOn} onChange={e => setLlmOn(e.target.checked)} style={{ accentColor: "var(--cinnabar)" }}/>
            <span>启用 LLM · deepseek-chat</span>
          </label>
        </div>
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap: 8, marginBottom: 32 }}>
        {DATA.concepts.slice(0, 6).map(c => {
          const active = topicId === c.id;
          return (
            <button key={c.id} onClick={() => onSelectConcept(c)}
              style={{
                fontFamily:"var(--serif)", fontSize: 13,
                padding: "5px 11px 6px",
                border: ".5px solid " + (active ? "var(--cinnabar)" : "var(--rule-strong)"),
                color: active ? "var(--cinnabar)" : "var(--ink-mute)",
                background: active ? "rgba(185,75,60,.06)" : "transparent",
                cursor: "pointer", borderRadius: 2,
              }}>
              {c.name} <span style={{ fontFamily:"var(--mono)", fontSize: 10, opacity: .6, marginLeft: 4 }}>{c.school}</span>
            </button>
          );
        })}
      </div>

      {loading && (
        <div style={{ padding: "40px 0", color: "var(--ink-faint)", fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".06em" }}>
          <Dots /> &nbsp; 正在检索《红楼梦》语料…
        </div>
      )}

      {error && (
        <div style={{ color: "var(--cinnabar)", fontFamily: "var(--mono)", fontSize: 13, padding: "20px 0" }}>
          {error}
        </div>
      )}

      {result && !loading && (
        <div style={{ display:"grid", gridTemplateColumns: "1.4fr 1fr", gap: 56 }}>
          <div>
            <Eyebrow>title</Eyebrow>
            <h2 className="h-section" style={{ fontSize: 32, marginBottom: 28 }}>
              {result.explain_title || result.question}
            </h2>

            <Eyebrow>plain · 一句话理解</Eyebrow>
            <ol style={{ paddingLeft: 0, listStyle: "none", margin: "0 0 36px" }}>
              {(result.plain_explanation || []).map((t,i) => (
                <li key={i} style={{ display:"flex", gap: 16, padding: "10px 0", borderBottom: ".5px solid var(--rule)", fontSize: 15, lineHeight: 1.85 }}>
                  <span style={{ fontFamily: "var(--mono)", color: "var(--celadon-deep)", fontSize: 11, paddingTop: 5, minWidth: 18 }}>{String(i+1).padStart(2,"0")}</span>
                  <span style={{ flex: 1 }}>{t}</span>
                </li>
              ))}
            </ol>

            <Eyebrow>in red mansion · 放回小说里</Eyebrow>
            <div style={{ display:"flex", flexDirection:"column", gap: 12, marginBottom: 32 }}>
              {(result.red_mansion_examples || []).map((ex,i) => (
                <div key={i} style={{ padding: "14px 18px", background: "rgba(255,255,255,.45)", border: ".5px solid var(--rule)" }}>
                  <div style={{ fontSize: 15, lineHeight: 1.8 }}>{ex}</div>
                </div>
              ))}
            </div>

            <Eyebrow>why it matters</Eyebrow>
            <p style={{ fontSize: 16, lineHeight: 1.85, margin: "0 0 28px", color: "var(--ink-2)" }}>
              {result.why_it_matters || ""}
            </p>

            <Eyebrow>next questions · 顺着这条线再问</Eyebrow>
            <div style={{ display:"flex", flexWrap:"wrap", gap: 8 }}>
              {(result.next_questions || []).map((q,i) => (
                <button key={i} onClick={() => onNextQuestion(q)}
                  style={{ fontFamily:"var(--serif)", fontSize: 13.5, padding:"6px 12px", border:".5px dashed var(--rule-strong)", background:"transparent", cursor:"pointer", color:"var(--ink)" }}>→ {q}</button>
              ))}
            </div>
          </div>

          <aside style={{ borderLeft: ".5px solid var(--rule)", paddingLeft: 36 }}>
            <Eyebrow>依据</Eyebrow>
            <div style={{ display:"flex", flexDirection:"column", gap: 14, marginBottom: 28 }}>
              {(result.concepts || []).map(c => (
                <div key={c.id}>
                  <div style={{ fontFamily:"var(--mono)", fontSize: 10.5, letterSpacing: ".1em", color: "var(--ink-faint)" }}>CONCEPT</div>
                  <CiteChip kind="concept" id={c.id} />
                  <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "var(--ink-mute)", lineHeight: 1.7 }}>
                    {c.definition}
                  </p>
                </div>
              ))}
              {(result.concepts || []).length > 0 && <hr className="rule" />}
              <div>
                <div style={{ fontFamily:"var(--mono)", fontSize: 10.5, letterSpacing: ".1em", color: "var(--ink-faint)", marginBottom: 6 }}>PASSAGES</div>
                <div style={{ display:"flex", flexDirection:"column", gap: 6 }}>
                  {(result.evidence || []).map(p => <CiteChip key={p.id} kind="passage" id={p.id} />)}
                </div>
              </div>
            </div>

            {result.coverage_warning && (
              <div style={{ fontFamily:"var(--mono)", fontSize: 11, color: "var(--cinnabar)", lineHeight: 1.6, marginTop: 12 }}>
                {result.coverage_warning}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
window.PageExplain = PageExplain;
