// page-ask.jsx — main Q&A page

const { useState: _useStateAsk, useEffect: _useEffectAsk, useRef: _useRefAsk, useMemo: _useMemoAsk } = React;

function PageAsk({ presetQuestion, onJumpScene, onJumpConcept, onJumpExplain }) {
  const [question, setQ] = React.useState(presetQuestion || DATA.demoQuestions[0].q);
  const [perspective, setP] = React.useState("综合");
  const [llmOn, setLlmOn] = React.useState(true);
  const [phase, setPhase] = React.useState("idle"); // idle | thinking | retrieving | composing | done
  const [evidence, setEvidence] = React.useState({ passages: [], concepts: [], scenes: [] });
  const [shownThesis, setShownThesis] = React.useState("");
  const [shownSentences, setShownSentences] = React.useState([]); // arr of indexes done
  const [activeChip, setActiveChip] = React.useState(null);
  const [poemIdx, setPoemIdx] = React.useState(() => Math.floor(Math.random() * DATA.heroPoems.length));
  const hasAsked = phase !== "idle";
  const [apiAnswer, setApiAnswer] = React.useState(null);
  const [fetchKey, setFetchKey] = React.useState(0);

  React.useEffect(() => {
    if (presetQuestion && presetQuestion !== question) {
      setQ(presetQuestion);
    }
    // eslint-disable-next-line
  }, [presetQuestion]);

  React.useEffect(() => {
    if (fetchKey === 0) return;
    let cancelled = false;
    setPhase("retrieving");
    (async () => {
      try {
        const params = new URLSearchParams({ question, perspective, llm: llmOn ? "1" : "0" });
        const resp = await fetch(`/api/ask?${params}`);
        if (cancelled) return;
        const data = await resp.json();
        if (cancelled) return;
        setEvidence({
          passages: (data.evidence || []).map(p => ({
            id: p.id,
            ch: p.chapter,
            score: Math.min(1.0, (p.score || 0) / 30),
            snippet: (p.text || "").slice(0, 80),
          })),
          concepts: (data.concepts || []).map(c => ({
            id: c.id,
            name: c.name,
            score: Math.min(1.0, (c.score || 0) / 30),
          })),
          scenes: (data.matched_scenes || []).map(s => ({
            id: s.id || s.name,
            name: s.name,
            chapter: s.chapters ? s.chapters[0] : 0,
            matched: s.keywords || [],
          })),
        });
        setApiAnswer({
          thesis: data.thesis || "",
          interpretation: (data.interpretation || []).map(text => ({ text, cites: [] })),
          textualEvidence: data.textual_evidence || [],
          conceptAnalysis: data.concept_analysis || [],
          reasoning: data.reasoning || [],
          counterpoint: data.counterpoint || "",
          conclusion: data.conclusion || "",
          citationNotes: data.citation_notes || [],
          limits: data.limits || data.disclaimer || "",
          llmEnabled: !!data.llm_enabled,
          llmError: data.llm_error || "",
          llmModel: data.llm_model || "",
        });
        setPhase("composing");
      } catch (e) {
        if (!cancelled) {
          setApiAnswer({ thesis: "请求失败，请检查服务是否正常。", interpretation: [], textualEvidence: [], conceptAnalysis: [], reasoning: [], counterpoint: "", conclusion: "", citationNotes: [], limits: "" });
          setPhase("composing");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [fetchKey]);

  const answerData = apiAnswer || DATA.mockAnswer;
  const reasoningItems = (answerData.reasoning && answerData.reasoning.length)
    ? answerData.reasoning.map(text => ({ text, cites: [] }))
    : (answerData.interpretation || []);

  // typewriter for thesis once composing
  const thesisText = answerData.thesis;
  const thesisTW = useTypewriter(thesisText, 22, phase === "composing");

  // reveal interpretation sentences one by one after thesis done
  React.useEffect(() => {
    if (phase !== "composing" || !thesisTW.done) return;
    let cancelled = false;
    const total = reasoningItems.length;
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      i++;
      setShownSentences(arr => [...arr, arr.length]);
      if (i < total) setTimeout(tick, 850);
      else setTimeout(() => !cancelled && setPhase("done"), 500);
    };
    setTimeout(tick, 350);
    return () => { cancelled = true; };
  }, [thesisTW.done, phase, reasoningItems.length]);

  const ask = (q) => {
    setShownSentences([]);
    setShownThesis("");
    setEvidence({ passages: [], concepts: [], scenes: [] });
    setActiveChip(null);
    setApiAnswer(null);
    setQ(q);
    setFetchKey(k => k + 1);
    setPhase("thinking");
  };

  const reset = () => {
    setPhase("idle");
    setShownSentences([]);
    setEvidence({ passages: [], concepts: [], scenes: [] });
    setActiveChip(null);
    setApiAnswer(null);
  };

  return (
    <div data-screen-label="01 主问答">
      {/* HERO */}
      {!hasAsked && (
        <section style={{ paddingTop: 60, paddingBottom: 28, minHeight: "60vh", display:"flex", flexDirection:"column", justifyContent:"center" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap: 36, marginBottom: 36 }}>
            <div style={{ flex: 1 }}>
              <Eyebrow num="v0.4 · MVP">red mansion mind</Eyebrow>
              <h1 className="h-display">
                <span className="zh">没缘法转眼分离乍，</span><br/>
                <span className="zh">赤条条来去无牵挂。</span>
                <span className="en">A citation-grounded RAG for<br/><em>Dream of the Red Chamber</em>.</span>
              </h1>
              <div style={{ marginTop: 14, fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-faint)", letterSpacing: ".06em" }}>
                ── 寄生草 · 第二十二回
              </div>
            </div>
            <div style={{ paddingTop: 8 }}>
              <Seal text="紅樓" size={66} rotate={-4} />
            </div>
          </div>

          {/* ASK INPUT */}
          <div className="card" style={{ padding: 0, background:"#fff", borderColor:"var(--rule-strong)" }}>
            <div style={{ display:"flex", alignItems:"stretch" }}>
              <input
                value={question}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key === "Enter" && ask(question)}
                placeholder="试问一句——譬如：太虚幻境体现了什么佛教思想？"
                style={{
                  flex: 1, border: "none", outline: "none",
                  padding: "22px 28px", fontFamily: "var(--body-font)",
                  fontSize: 18, background: "transparent", color: "var(--ink)",
                }}
              />
              <button className="btn btn--cinnabar" style={{ borderRadius: 0, padding: "0 32px" }} onClick={() => ask(question)}>
                问 →
              </button>
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding: "10px 18px 12px", borderTop: ".5px dashed var(--rule)" }}>
              <div style={{ display:"flex", gap: 4 }}>
                {["综合","儒家","道家","佛教"].map(p => (
                  <button key={p} onClick={() => setP(p)}
                    style={{
                      fontFamily:"var(--serif)", fontSize: 12.5,
                      padding: "4px 12px 5px",
                      border: ".5px solid " + (perspective === p ? "var(--ink)" : "var(--rule)"),
                      background: perspective === p ? "var(--ink)" : "transparent",
                      color: perspective === p ? "var(--paper)" : "var(--ink-mute)",
                      cursor: "pointer", borderRadius: 2, letterSpacing: ".05em",
                    }}>{p}</button>
                ))}
              </div>
              <label style={{ display:"flex", alignItems:"center", gap: 8, fontFamily:"var(--mono)", fontSize: 11, color: "var(--ink-mute)", cursor:"pointer" }}>
                <input type="checkbox" checked={llmOn} onChange={e => setLlmOn(e.target.checked)} style={{ accentColor: "var(--cinnabar)" }}/>
                <span>启用 LLM 生成 · deepseek-chat</span>
              </label>
            </div>
          </div>

          {/* demo questions */}
          <div style={{ marginTop: 26 }}>
            <Eyebrow>试试这些</Eyebrow>
            <div style={{ display:"flex", flexWrap:"wrap", gap: 8 }}>
              {DATA.demoQuestions.map((d, i) => (
                <button key={i} onClick={() => ask(d.q)}
                  style={{
                    fontFamily:"var(--serif)", fontSize: 13.5,
                    padding: "7px 14px 9px",
                    border: ".5px solid var(--rule-strong)",
                    background: "rgba(255,255,255,.5)",
                    color: "var(--ink)", cursor: "pointer", borderRadius: 2,
                    textAlign: "left",
                  }}>
                  {d.q}
                  <span style={{ marginLeft: 10, fontFamily:"var(--mono)", fontSize: 10, color:"var(--ink-faint)" }}>
                    {d.tags.join(" · ")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* BACKGROUND + EXPLAIN ENTRY */}
          <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 36, alignItems: "stretch" }}>
            <div className="card" style={{ background: "rgba(255,255,255,.55)", borderColor: "var(--rule)" }}>
              <Eyebrow>about · 《红楼梦》</Eyebrow>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, margin: "0 0 14px", letterSpacing: ".01em" }}>
                一部以家族盛衰写人生的小说
              </h3>
              <p style={{ margin: "0 0 12px", fontSize: 14.5, lineHeight: 1.85, color: "var(--ink-2)" }}>
                《红楼梦》（又名《石头记》）是清代曹雪芹所著的章回体长篇小说，
                通行本前八十回为曹氏所作，后四十回多由高鹗续补。
                小说以贾、史、王、薛四大家族的兴衰为背景，
                以贾宝玉、林黛玉、薛宝钗的情感与命运为主线，
                兼写大观园中众多女儿的际遇。
              </p>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.85, color: "var(--ink-2)" }}>
                它既是世情之书，也是哲学之书：在繁华的人间烟火之下，
                隐隐贯穿着 <em style={{ fontStyle: "normal", color: "var(--cinnabar)", fontWeight: 500 }}>儒家</em>之礼、
                <em style={{ fontStyle: "normal", color: "var(--celadon-deep)", fontWeight: 500 }}>道家</em>之逍遥、
                <em style={{ fontStyle: "normal", color: "var(--dai)", fontWeight: 500 }}>佛家</em>之色空，
                以及晚明 <em style={{ fontStyle: "normal", color: "var(--gold)", fontWeight: 500 }}>性灵</em>之真情。
                本项目即试图把这几条暗线提到台前，以原文段落为据加以阐释。
              </p>
              <div style={{ display: "flex", gap: 24, marginTop: 20, paddingTop: 16, borderTop: ".5px dashed var(--rule)", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-faint)", letterSpacing: ".06em" }}>
                <span>作者 · <b style={{ color: "var(--ink-2)" }}>曹雪芹</b></span>
                <span>成书 · <b style={{ color: "var(--ink-2)" }}>清乾隆中叶</b></span>
                <span>章回 · <b style={{ color: "var(--ink-2)" }}>前 80 回（本项目）</b></span>
                <span>别名 · <b style={{ color: "var(--ink-2)" }}>石头记</b></span>
              </div>
            </div>

            <div style={{ background: "var(--dai)", color: "var(--paper)", padding: "var(--gap-3)", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -18, top: -10, opacity: .15 }}>
                <Seal text="釋" size={120} rotate={-6} />
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: ".18em", color: "var(--celadon-soft)", textTransform: "uppercase", marginBottom: 14 }}>
                  ── 科普模式
                </div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 500, margin: "0 0 14px", lineHeight: 1.35 }}>
                  把"色空"<br/>讲成大白话。
                </h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, opacity: .82 }}>
                  不熟悉儒释道术语？切到科普模式，
                  让 LLM 用日常语言解释一个哲学概念，
                  再把它放回小说情节里给你看。
                </p>
              </div>
              <button
                onClick={() => onJumpExplain && onJumpExplain()}
                style={{
                  marginTop: 22, alignSelf: "flex-start",
                  fontFamily: "var(--serif)", fontSize: 14, letterSpacing: ".05em",
                  background: "var(--cinnabar)", color: "var(--paper)",
                  border: "none", padding: "10px 20px 11px",
                  cursor: "pointer", borderRadius: 2, position: "relative",
                }}>
                进入科普模式 →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* QUESTION + ANSWER */}
      {hasAsked && (
        <section style={{ paddingTop: 36 }}>
          {/* question bar */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap: 24, marginBottom: 28 }}>
            <div style={{ flex: 1 }}>
              <Eyebrow num={`视角 · ${perspective}`}>question</Eyebrow>
              <div style={{ fontFamily: "var(--serif)", fontSize: 30, lineHeight: 1.3, fontWeight: 500 }}>
                {question}
              </div>
            </div>
            <button className="btn btn--ghost" onClick={reset} style={{ flexShrink:0 }}>← 再问</button>
          </div>

          {/* pipeline status */}
          <div style={{ display:"flex", gap: 28, padding: "14px 0", borderTop: ".5px solid var(--rule)", borderBottom: ".5px solid var(--rule)", marginBottom: 28 }}>
            <StageLine label="QUERY · 别名匹配" done={phase !== "thinking"} active={phase === "thinking"} />
            <StageLine label="RETRIEVAL · BM25 + 章节加权" done={phase === "composing" || phase === "done"} active={phase === "retrieving"} />
            <StageLine label="EVIDENCE · 段落 + 概念" done={phase === "composing" || phase === "done"} active={phase === "retrieving"} />
            <StageLine label="LLM · 结构化生成" done={phase === "done"} active={phase === "composing"} />
          </div>

          {/* two-column layout */}
          <div style={{ display:"grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 56 }}>
            {/* main answer column */}
            <div className="answer">
              {/* LLM status banner (only show after phase done so it doesn't shift the typewriter) */}
              {(phase === "composing" || phase === "done") && apiAnswer && (() => {
                if (apiAnswer.llmError) {
                  return (
                    <div style={{ marginBottom: 20, padding: "10px 14px", border: ".5px solid var(--cinnabar)", background: "rgba(185,75,60,.06)", fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--cinnabar)", lineHeight: 1.6 }}>
                      LLM 调用失败，下面是本地模板兜底输出。<br/>
                      <span style={{ color: "var(--ink-mute)" }}>{apiAnswer.llmError}</span>
                    </div>
                  );
                }
                if (llmOn && !apiAnswer.llmEnabled) {
                  return (
                    <div style={{ marginBottom: 20, padding: "10px 14px", border: ".5px dashed var(--rule-strong)", fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--ink-mute)" }}>
                      LLM 未启用（OPENAI_API_KEY 未配置），当前为本地模板输出。
                    </div>
                  );
                }
                if (apiAnswer.llmEnabled) {
                  return (
                    <div style={{ marginBottom: 20, fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--celadon-deep)", letterSpacing: ".08em" }}>
                      ✓ LLM · {apiAnswer.llmModel || "deepseek-chat"}
                    </div>
                  );
                }
                return null;
              })()}

              {/* thesis */}
              <Eyebrow>论点 · thesis</Eyebrow>
              <div style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.55, fontWeight: 500, marginBottom: 36, borderLeft: "2px solid var(--cinnabar)", paddingLeft: 18 }}>
                {phase === "composing" ? thesisTW.shown : (phase === "done" ? thesisText : "")}
                {phase === "composing" && !thesisTW.done && <span className="stream-cursor" />}
              </div>

              {/* textual evidence */}
              {(thesisTW.done || phase === "done") && (
                <>
                  <Eyebrow num={(answerData.textualEvidence || []).length}>文本依据 · evidence</Eyebrow>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 14, marginBottom: 34 }}>
                    {(answerData.textualEvidence || []).map((item, i) => (
                      <div key={i} className="fade-in" style={{ background:"rgba(255,255,255,.48)", border:".5px solid var(--rule)", padding:"14px 16px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", gap: 10, alignItems:"baseline", marginBottom: 8 }}>
                          <strong style={{ fontFamily:"var(--serif)", fontSize: 14.5, fontWeight: 500 }}>{item.title || "文本依据"}</strong>
                          {item.passage_id && <CiteChip kind="passage" id={item.passage_id} active={activeChip === item.passage_id} onClick={() => setActiveChip(item.passage_id)} />}
                        </div>
                        <div style={{ fontSize: 14, lineHeight: 1.75, color:"var(--ink-2)" }}>{item.claim || item.text}</div>
                      </div>
                    ))}
                  </div>

                  <Eyebrow num={(answerData.conceptAnalysis || []).length}>概念解释 · concepts</Eyebrow>
                  <div style={{ display:"flex", flexDirection:"column", gap: 10, marginBottom: 34 }}>
                    {(answerData.conceptAnalysis || []).map((item, i) => (
                      <div key={i} className="fade-in" style={{ borderLeft:"2px solid var(--celadon-deep)", paddingLeft: 14 }}>
                        <div style={{ display:"flex", alignItems:"center", gap: 8, marginBottom: 5 }}>
                          <span style={{ fontFamily:"var(--serif)", fontWeight: 500 }}>{item.name || "概念"}</span>
                          {item.concept_id && <CiteChip kind="concept" id={item.concept_id} active={activeChip === item.concept_id} onClick={() => setActiveChip(item.concept_id)} />}
                        </div>
                        <div style={{ fontSize: 14.5, lineHeight: 1.8, color:"var(--ink-2)" }}>{item.analysis || item.text}</div>
                      </div>
                    ))}
                  </div>

                  <Eyebrow num={`${shownSentences.length}/${reasoningItems.length}`}>推理展开 · reasoning</Eyebrow>
                  <ol style={{ paddingLeft: 0, listStyle: "none", margin: "0 0 36px" }}>
                    {reasoningItems.map((sent, i) => shownSentences.includes(i) && (
                      <li key={i} className="fade-in answer__sent" style={{ display:"flex", gap: 16, padding: "10px 0", borderBottom: ".5px solid var(--rule)", fontSize: 16, lineHeight: 1.85 }}>
                        <span style={{ fontFamily: "var(--mono)", color: "var(--cinnabar)", fontSize: 11, paddingTop: 6, minWidth: 18 }}>
                          {String(i+1).padStart(2,"0")}
                        </span>
                        <span style={{ flex: 1 }}>
                          {sent.text}。
                          <span style={{ display:"inline-flex", gap: 6, marginLeft: 8, verticalAlign: "middle" }}>
                            {(sent.cites || []).map((c, j) => (
                              <CiteChip key={j} kind={c.kind} id={c.id}
                                active={activeChip === c.id}
                                onClick={() => {
                                  setActiveChip(c.id);
                                  if (c.kind === "concept") onJumpConcept && onJumpConcept(c.id);
                                }}
                              />
                            ))}
                          </span>
                        </span>
                      </li>
                    ))}
                    {phase === "composing" && shownSentences.length < reasoningItems.length && (
                      <li style={{ padding: "12px 0", color: "var(--ink-faint)", fontFamily: "var(--mono)", fontSize: 11.5, letterSpacing: ".06em" }}>
                        <Dots /> &nbsp; 继续生成中
                      </li>
                    )}
                  </ol>
                </>
              )}

              {/* counterpoint + conclusion + notes */}
              {phase === "done" && (
                <div className="fade-in" style={{ display:"grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <Eyebrow>复杂性 · counterpoint</Eyebrow>
                    <p style={{ margin: "0 0 22px", fontSize: 15.5, lineHeight: 1.85, color: "var(--ink-2)" }}>
                      {answerData.counterpoint || ""}
                    </p>
                    <Eyebrow>结论 · conclusion</Eyebrow>
                    <p style={{ margin: "0 0 28px", fontSize: 17, lineHeight: 1.75, fontWeight: 500, color: "var(--ink)" }}>
                      {answerData.conclusion || thesisText}
                    </p>
                  </div>
                  <div>
                    <Eyebrow>证据脚注 · notes</Eyebrow>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.8, color: "var(--ink-2)" }}>
                      {(answerData.citationNotes || []).map((n,i) => <li key={i}>{n}</li>)}
                    </ul>
                  </div>
                  <div>
                    <Eyebrow>边界 · limits</Eyebrow>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: "var(--ink-2)", fontStyle:"italic" }}>
                      {answerData.limits}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* evidence sidebar */}
            <aside style={{ borderLeft: ".5px solid var(--rule)", paddingLeft: 36 }}>
              <Eyebrow num={evidence.scenes.length || ""}>scene match</Eyebrow>
              {evidence.scenes.length === 0 ? <Dots /> : (
                <div style={{ marginBottom: 28 }}>
                  {evidence.scenes.map(s => (
                    <div key={s.id} className="fade-in" style={{ cursor:"default" }}>
                      <div style={{ fontFamily:"var(--serif)", fontSize: 17, fontWeight: 500 }}>{s.name}</div>
                      <div style={{ fontFamily:"var(--mono)", fontSize: 10.5, color: "var(--ink-faint)", letterSpacing: ".06em", marginTop: 2 }}>
                        ch.{s.chapter} · {s.matched.join(" / ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Eyebrow num={evidence.passages.length || ""}>passages</Eyebrow>
              <div style={{ display:"flex", flexDirection:"column", gap: 12, marginBottom: 28 }}>
                {evidence.passages.length === 0
                  ? Array(4).fill(0).map((_,i) => (
                      <div key={i} style={{ height: 38, background: "rgba(29,38,40,.04)", animation: `blink 1.3s ${i*0.1}s infinite ease-in-out` }} />
                    ))
                  : evidence.passages.map(p => (
                    <div key={p.id} className="fade-in"
                      onClick={() => setActiveChip(p.id)}
                      style={{
                        cursor: "pointer",
                        borderLeft: "2px solid " + (activeChip === p.id ? "var(--cinnabar)" : "transparent"),
                        paddingLeft: 10,
                      }}>
                      <div style={{ display:"flex", justifyContent:"space-between", gap: 8 }}>
                        <CiteChip kind="passage" id={p.id} active={activeChip === p.id} />
                        <span style={{ fontFamily:"var(--mono)", fontSize: 10, color: "var(--ink-faint)" }}>{p.score.toFixed(3)}</span>
                      </div>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 12.5, color: "var(--ink-mute)", marginTop: 6, lineHeight: 1.55 }}>
                        {p.snippet}
                      </div>
                    </div>
                  ))}
              </div>

              <Eyebrow num={evidence.concepts.length || ""}>concepts</Eyebrow>
              <div style={{ display:"flex", flexDirection:"column", gap: 6 }}>
                {evidence.concepts.map(c => (
                  <div key={c.id} className="fade-in" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <CiteChip kind="concept" id={c.id}
                      active={activeChip === c.id}
                      onClick={() => setActiveChip(c.id)}
                    />
                    <MiniBar value={c.score*100} w={60} />
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}

window.PageAsk = PageAsk;
