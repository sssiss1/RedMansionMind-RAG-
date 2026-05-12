// app.jsx — main shell, routing, tweaks

const NAV = [
  { id: "ask",     zh: "問", num: "01", label: "主问答" },
  { id: "explain", zh: "釋", num: "02", label: "科普解释" },
  { id: "quiz",    zh: "測", num: "03", label: "价值观测试" },
  { id: "scenes",  zh: "情", num: "04", label: "情节场景" },
  { id: "concepts",zh: "理", num: "05", label: "概念库" },
  { id: "chars",   zh: "人", num: "06", label: "人物画像" },
  { id: "eval",    zh: "考", num: "07", label: "评测结果" },
];

const RMM_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#6f8d80", "#8c2f3a"],
  "density": "regular",
  "font": "song"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(RMM_TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState("ask");
  const [presetAsk, setPresetAsk] = React.useState(null);
  const [focusScene, setFocusScene] = React.useState(null);
  const [focusConcept, setFocusConcept] = React.useState(null);

  // apply tweaks to CSS vars + body data attrs
  React.useEffect(() => {
    const root = document.documentElement;
    const primary = (t.palette && t.palette[0]) || "#6f8d80";
    const accent  = (t.palette && t.palette[1]) || "#b94b3c";
    root.style.setProperty("--celadon", primary);
    root.style.setProperty("--celadon-deep", shade(primary, -.18));
    root.style.setProperty("--celadon-soft", shade(primary, .22));
    root.style.setProperty("--cinnabar", accent);
    root.style.setProperty("--cinnabar-deep", shade(accent, -.18));
    document.body.dataset.density = t.density || "regular";
    document.body.dataset.font = t.font || "song";
  }, [t.palette, t.density, t.font]);

  function shade(hex, amt) {
    // amt in [-1, 1]
    const m = hex.match(/^#([0-9a-f]{6})$/i);
    if (!m) return hex;
    let [r,g,b] = [0,2,4].map(i => parseInt(m[1].substr(i,2),16));
    const fn = (c) => amt < 0 ? Math.round(c * (1+amt)) : Math.round(c + (255-c)*amt);
    [r,g,b] = [r,g,b].map(fn).map(c => Math.max(0, Math.min(255,c)));
    return "#" + [r,g,b].map(c => c.toString(16).padStart(2,"0")).join("");
  }

  const handleJumpAsk = (q) => { setPresetAsk(q); setRoute("ask"); };
  const handleJumpScene = (id) => { setFocusScene(id); setRoute("scenes"); };
  const handleJumpConcept = (id) => { setFocusConcept(id); setRoute("concepts"); };

  let pageEl;
  switch(route) {
    case "ask":      pageEl = <PageAsk presetQuestion={presetAsk} onJumpScene={handleJumpScene} onJumpConcept={handleJumpConcept} onJumpExplain={() => setRoute("explain")} />; break;
    case "explain":  pageEl = <PageExplain />; break;
    case "quiz":     pageEl = <PageQuiz />; break;
    case "scenes":   pageEl = <PageScenes focusId={focusScene} onJumpAsk={handleJumpAsk} />; break;
    case "concepts": pageEl = <PageConcepts focusId={focusConcept} onJumpAsk={handleJumpAsk} />; break;
    case "chars":    pageEl = <PageCharacters />; break;
    case "eval":     pageEl = <PageEval />; break;
    default:         pageEl = null;
  }

  return (
    <div className="app">
      {/* sidebar */}
      <nav className="nav">
        <div className="nav__brand">
          <div className="nav__seal">紅</div>
          <small>RMM</small>
        </div>
        {NAV.map(n => (
          <div key={n.id}
            className={`nav__item ${route === n.id ? "nav__item--active" : ""}`}
            onClick={() => setRoute(n.id)}
            title={n.label}>
            <span className="nav__zh">{n.zh}</span>
            <span className="nav__num">{n.num}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: "0 8px", fontFamily:"var(--mono)", fontSize: 9, color:"var(--ink-faint)", letterSpacing:".08em", textAlign:"center", lineHeight: 1.5 }}>
          v0.4<br/>MVP
        </div>
      </nav>

      {/* main */}
      <main className="main">
        <header className="mast">
          <h1 className="mast__title">
            <em>红楼梦哲学阐释</em>
            <span style={{ fontFamily: "var(--display)", fontStyle:"italic", fontWeight: 300 }}>RedMansionMind</span>
          </h1>
          <div className="mast__meta">
            <span>corpus · <b>1,322</b> passages</span>
            <span>scenes · <b>{DATA.scenes.length}</b></span>
            <span>concepts · <b>{DATA.concepts.length}</b></span>
            <span>eval · <b>top-4 100%</b></span>
          </div>
        </header>

        {pageEl}

        <div className="colofon">
          <span>© RedMansionMind · MIT · for literary study</span>
          <span>Corpus: 《红楼梦》前 80 回 · Project Gutenberg</span>
        </div>
      </main>

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="主题" />
        <TweakColor label="配色" value={t.palette}
          options={[
            ["#6f8d80", "#8c2f3a"],   // 青瓷 + 胭脂 (default · 红楼感)
            ["#6f8d80", "#6e2530"],   // 青瓷 + 枣红（更暗）
            ["#6f8d80", "#a83248"],   // 青瓷 + 海棠红
            ["#6f8d80", "#a26336"],   // 青瓷 + 赭石
            ["#6f8d80", "#2f3e4a"],   // 青瓷 + 黛蓝
            ["#6f8d80", "#b94b3c"],   // 青瓷 + 朱砂（原）
          ]}
          onChange={v => setTweak("palette", v)} />

        <TweakSection label="排版" />
        <TweakRadio label="密度" value={t.density}
          options={["compact","regular","comfy"]}
          onChange={v => setTweak("density", v)} />
        <TweakRadio label="字体" value={t.font}
          options={["song","hei","kai"]}
          onChange={v => setTweak("font", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
