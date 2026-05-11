const form = document.querySelector("#ask-form");
const questionEl = document.querySelector("#question");
const answerEl = document.querySelector("#answer");
const useLlmEl = document.querySelector("#use-llm");
const explainButton = document.querySelector("#explain-button");
const quizButton = document.querySelector("#quiz-button");
const perspectiveButtons = [...document.querySelectorAll("[data-perspective]")];
const exampleButtons = [...document.querySelectorAll("[data-question]")];

let perspective = "综合";

const QUIZ_PROFILES = {
  baoyu: {
    name: "贾宝玉",
    title: "真情本位的反功利者",
    tags: ["重情", "反功名", "真性情", "共情"],
    summary: "你更在意真实感受和人与人之间的理解，不太愿意把人生交给外在评价。你像宝玉的地方，在于会本能地反抗“大家都说应该如此”的道路。",
    question: "贾宝玉为什么厌恶仕途经济？",
  },
  daiyu: {
    name: "林黛玉",
    title: "敏感清醒的真情守护者",
    tags: ["真情", "自我意识", "生命感", "敏锐"],
    summary: "你对关系中的细微变化很敏感，也更珍惜不可替代的真心。你像黛玉的地方，在于不愿用圆滑掩盖真实，也常能看见繁华背后的脆弱。",
    question: "林黛玉葬花体现了什么生命观？",
  },
  baochai: {
    name: "薛宝钗",
    title: "清醒稳妥的秩序协调者",
    tags: ["分寸", "现实理性", "礼", "人情练达"],
    summary: "你重视稳定、分寸和长远后果，擅长在复杂关系里寻找可行解。你像宝钗的地方，在于能把个人愿望放进现实秩序里权衡。",
    question: "薛宝钗更接近儒家伦理吗？",
  },
  xifeng: {
    name: "王熙凤",
    title: "高能掌控型行动派",
    tags: ["行动力", "权力感", "治理", "风险"],
    summary: "你不喜欢事情失控，遇到混乱会自然接管局面。你像凤姐的地方，在于有强执行力和局面判断力，但也要小心把掌控变成消耗。",
    question: "王熙凤的权术可以从因果角度怎样解释？",
  },
  tanchun: {
    name: "贾探春",
    title: "改革型清醒治理者",
    tags: ["治理", "边界", "改革", "责任"],
    summary: "你既看得见问题，也愿意推动规则变好。你像探春的地方，在于不只抱怨环境，而是会想办法重建秩序、划清边界。",
    question: "探春理家体现了什么治理观？",
  },
  miaoyu: {
    name: "妙玉",
    title: "审美洁癖型理想主义者",
    tags: ["清净", "孤高", "审美", "边界感"],
    summary: "你对精神品质和审美纯度要求很高，不太愿意为了合群牺牲标准。你像妙玉的地方，在于向往清净，但也容易被自己的标准困住。",
    question: "妙玉的清高是否真的接近佛教清净？",
  },
  xiangyun: {
    name: "史湘云",
    title: "旷达明亮的松弛派",
    tags: ["旷达", "真率", "松弛", "生命力"],
    summary: "你更愿意用开阔和幽默化解压力，不喜欢把情绪困在窄处。你像湘云的地方，在于真率、明亮，也能在无常中保留生命力。",
    question: "大观园诗社体现了怎样的自由与本真？",
  },
};

const QUIZ_QUESTIONS = [
  {
    text: "如果人生路线上出现分歧，你更相信什么？",
    options: [
      { text: "跟随真心，不想为了体面牺牲自己", scores: { baoyu: 3, daiyu: 1, xiangyun: 1 } },
      { text: "先看现实条件，选择最稳妥的路", scores: { baochai: 3, tanchun: 1 } },
      { text: "把局面掌握在手里，主动争取资源", scores: { xifeng: 3, tanchun: 1 } },
      { text: "保持精神上的干净，不随波逐流", scores: { miaoyu: 3, daiyu: 1 } },
    ],
  },
  {
    text: "面对复杂人际关系，你通常会怎么做？",
    options: [
      { text: "敏锐感受关系变化，宁可真诚也不敷衍", scores: { daiyu: 3, baoyu: 1 } },
      { text: "照顾分寸和场面，不让事情失衡", scores: { baochai: 3, tanchun: 1 } },
      { text: "快速判断谁能做事、谁会添乱", scores: { xifeng: 3, tanchun: 1 } },
      { text: "保持距离，选择少而精的关系", scores: { miaoyu: 3, daiyu: 1 } },
    ],
  },
  {
    text: "你最不能接受哪种状态？",
    options: [
      { text: "真实感情被功利和规矩压扁", scores: { baoyu: 3, daiyu: 1 } },
      { text: "秩序混乱、大家都不守边界", scores: { tanchun: 3, baochai: 1 } },
      { text: "被别人看穿弱点、失去主动权", scores: { xifeng: 3 } },
      { text: "审美和精神标准被迫降低", scores: { miaoyu: 3 } },
    ],
  },
  {
    text: "如果你在大观园组织一次活动，你会负责什么？",
    options: [
      { text: "写诗、赏花、让大家玩得有灵气", scores: { xiangyun: 3, baoyu: 1 } },
      { text: "安排流程，确保每个人都舒服得体", scores: { baochai: 3 } },
      { text: "制定规则、分配资源、提高效率", scores: { tanchun: 3, xifeng: 1 } },
      { text: "挑选器物与环境，宁缺毋滥", scores: { miaoyu: 3 } },
    ],
  },
  {
    text: "你如何看待“成功”？",
    options: [
      { text: "不违背本心，比外界认可重要", scores: { baoyu: 3, xiangyun: 1 } },
      { text: "能在现实中站稳，也照顾身边人", scores: { baochai: 3, tanchun: 1 } },
      { text: "有能力影响局势，不被命运推着走", scores: { xifeng: 3, tanchun: 1 } },
      { text: "精神上自洽，不被俗世标准污染", scores: { miaoyu: 3, daiyu: 1 } },
    ],
  },
  {
    text: "遇到喜欢的人或事，你更像哪一种？",
    options: [
      { text: "投入很深，很难把真情轻轻放下", scores: { daiyu: 3, baoyu: 2 } },
      { text: "会喜欢，但也会考虑现实后果", scores: { baochai: 3 } },
      { text: "越喜欢越想保护和掌控", scores: { xifeng: 2, tanchun: 1 } },
      { text: "热烈但不拧巴，过去了也能笑一笑", scores: { xiangyun: 3 } },
    ],
  },
  {
    text: "你最欣赏《红楼梦》里的哪种精神？",
    options: [
      { text: "为真情辩护", scores: { baoyu: 3, daiyu: 2 } },
      { text: "在世情中保有分寸", scores: { baochai: 3 } },
      { text: "看清制度问题并试着改变", scores: { tanchun: 3 } },
      { text: "繁华中仍看见无常", scores: { daiyu: 2, miaoyu: 1, xiangyun: 1 } },
    ],
  },
  {
    text: "朋友会觉得你身上最明显的气质是？",
    options: [
      { text: "真诚、共情、偶尔不合时宜", scores: { baoyu: 3 } },
      { text: "细腻、敏锐、有自己的骄傲", scores: { daiyu: 3 } },
      { text: "可靠、周全、懂现实", scores: { baochai: 3 } },
      { text: "明亮、爽快、有生命力", scores: { xiangyun: 3 } },
    ],
  },
];

perspectiveButtons.forEach((button) => {
  button.addEventListener("click", () => {
    perspective = button.dataset.perspective;
    perspectiveButtons.forEach((item) => item.classList.toggle("active", item === button));
  });
});

exampleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    questionEl.value = button.dataset.question;
    ask();
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  ask();
});

explainButton.addEventListener("click", () => {
  explain();
});

quizButton.addEventListener("click", () => {
  renderQuiz();
});

async function ask() {
  const question = questionEl.value.trim();
  if (!question) return;

  answerEl.innerHTML = `<div class="empty">检索《红楼梦》文本和哲学概念中${useLlmEl.checked ? "，并调用 LLM 生成阐释" : ""}...</div>`;

  const params = new URLSearchParams({ question, perspective, llm: useLlmEl.checked ? "1" : "0" });
  const response = await fetch(`/api/ask?${params}`);
  const data = await response.json();

  if (!response.ok) {
    answerEl.innerHTML = `<div class="empty">${escapeHtml(data.error || "请求失败")}</div>`;
    return;
  }

  renderAnswer(data);
}

async function explain() {
  const question = questionEl.value.trim();
  if (!question) return;

  answerEl.innerHTML = `<div class="empty">正在把相关哲学概念讲成更容易理解的版本${useLlmEl.checked ? "，并调用 LLM 生成科普解释" : ""}...</div>`;

  const params = new URLSearchParams({ question, perspective, llm: useLlmEl.checked ? "1" : "0" });
  const response = await fetch(`/api/explain?${params}`);
  const data = await response.json();

  if (!response.ok) {
    answerEl.innerHTML = `<div class="empty">${escapeHtml(data.error || "请求失败")}</div>`;
    return;
  }

  renderExplain(data);
}

function renderAnswer(data) {
  const citations = buildCitationMap(data);
  answerEl.innerHTML = `
    <section class="section">
      <h2>结论</h2>
      <div class="thesis">${renderInlineCitations(data.thesis, citations)}</div>
      ${data.llm_enabled ? `<p class="meta">LLM: ${escapeHtml(data.llm_model || "enabled")}</p>` : ""}
      ${data.llm_error ? `<p class="warning">${escapeHtml(data.llm_error)}</p>` : ""}
      ${data.coverage_warning ? `<p class="warning">${escapeHtml(data.coverage_warning)}</p>` : ""}
      ${renderMatchedScenes(data.matched_scenes)}
      <div class="tags">${data.related_themes.map(tag).join("")}</div>
    </section>

    <section class="section">
      <h2>阐释</h2>
      <ul class="paragraphs">
        ${data.interpretation.map((line) => `<li>${renderInlineCitations(line, citations)}</li>`).join("")}
      </ul>
    </section>

    <section class="section">
      <h2>原文证据</h2>
      <div class="grid">${data.evidence.map(renderPassage).join("")}</div>
    </section>

    <section class="section">
      <h2>哲学概念</h2>
      <div class="grid">${data.concepts.map(renderConcept).join("")}</div>
    </section>

    <section class="section">
      <h2>相关人物</h2>
      <div class="grid">${data.related_characters.map(renderCharacter).join("") || `<div class="meta">暂无匹配人物。</div>`}</div>
    </section>

    ${renderCitationNotes(data.citation_notes, citations)}

    <section class="section">
      <div class="meta">${renderInlineCitations(data.limits || data.disclaimer, citations)}</div>
    </section>
  `;
}

function renderExplain(data) {
  const citations = buildCitationMap(data);
  answerEl.innerHTML = `
    <section class="section intro-section">
      <h2>科普解释</h2>
      <div class="thesis">${escapeHtml(data.explain_title || "用《红楼梦》入门中国哲学")}</div>
      ${data.llm_enabled ? `<p class="meta">LLM: ${escapeHtml(data.llm_model || "enabled")}</p>` : ""}
      ${data.llm_error ? `<p class="warning">${escapeHtml(data.llm_error)}</p>` : ""}
      ${data.coverage_warning ? `<p class="warning">${escapeHtml(data.coverage_warning)}</p>` : ""}
      ${renderMatchedScenes(data.matched_scenes)}
      <div class="tags">${data.related_themes.map(tag).join("")}</div>
    </section>

    <section class="section">
      <h2>先把概念讲简单</h2>
      <ul class="paragraphs">
        ${(data.plain_explanation || []).map((line) => `<li>${renderInlineCitations(line, citations)}</li>`).join("")}
      </ul>
    </section>

    <section class="section">
      <h2>放回《红楼梦》里看</h2>
      <ul class="paragraphs">
        ${(data.red_mansion_examples || []).map((line) => `<li>${renderInlineCitations(line, citations)}</li>`).join("")}
      </ul>
    </section>

    <section class="section">
      <h2>为什么这有助于读懂小说</h2>
      <p class="quote">${renderInlineCitations(data.why_it_matters || data.disclaimer, citations)}</p>
    </section>

    <section class="section">
      <h2>可以继续问</h2>
      <ul class="paragraphs">
        ${(data.next_questions || []).map((line) => `<li>${renderInlineCitations(line, citations)}</li>`).join("")}
      </ul>
    </section>

    <section class="section">
      <h2>原文证据</h2>
      <div class="grid">${data.evidence.map(renderPassage).join("")}</div>
    </section>

    <section class="section">
      <h2>哲学概念</h2>
      <div class="grid">${data.concepts.map(renderConcept).join("")}</div>
    </section>

    ${renderCitationNotes(data.citation_notes, citations)}
  `;
}

function renderQuiz() {
  answerEl.innerHTML = `
    <section class="section quiz-hero">
      <h2>红楼价值观测试</h2>
      <div class="thesis">你的价值观更接近《红楼梦》里的谁？</div>
      <p class="quote">这不是严肃人格诊断，更像一次进入红楼世界的轻量入口。选你更自然会做的答案，看看你更接近哪一种处世哲学。</p>
    </section>
    <form id="value-quiz" class="quiz-form">
      ${QUIZ_QUESTIONS.map(renderQuizQuestion).join("")}
      <section class="section quiz-submit">
        <button type="submit">查看我的红楼人格</button>
        <button type="button" id="quiz-reset" class="secondary-action">重新选择</button>
      </section>
    </form>
  `;

  const quizForm = document.querySelector("#value-quiz");
  quizForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showQuizResult(new FormData(quizForm));
  });
  document.querySelector("#quiz-reset").addEventListener("click", renderQuiz);
}

function renderQuizQuestion(question, questionIndex) {
  return `
    <section class="section quiz-question">
      <h2>${questionIndex + 1}. ${escapeHtml(question.text)}</h2>
      <div class="quiz-options">
        ${question.options
          .map(
            (option, optionIndex) => `
              <label class="quiz-option">
                <input type="radio" name="q${questionIndex}" value="${optionIndex}" ${optionIndex === 0 ? "required" : ""} />
                <span>${escapeHtml(option.text)}</span>
              </label>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function showQuizResult(formData) {
  const scores = Object.fromEntries(Object.keys(QUIZ_PROFILES).map((key) => [key, 0]));
  QUIZ_QUESTIONS.forEach((question, questionIndex) => {
    const optionIndex = Number(formData.get(`q${questionIndex}`));
    const option = question.options[optionIndex];
    Object.entries(option.scores).forEach(([profile, value]) => {
      scores[profile] += value;
    });
  });

  const ranked = Object.entries(scores)
    .map(([key, score]) => ({ key, score, ...QUIZ_PROFILES[key] }))
    .sort((a, b) => b.score - a.score);
  const top = ranked[0];
  const runnerUp = ranked[1];
  const maxScore = Math.max(...ranked.map((item) => item.score), 1);

  answerEl.innerHTML = `
    <section class="section quiz-result">
      <h2>测试结果</h2>
      <p class="result-eyebrow">你的红楼价值观最接近</p>
      <div class="result-name">${escapeHtml(top.name)}</div>
      <div class="thesis">${escapeHtml(top.title)}</div>
      <div class="tags">${top.tags.map(tag).join("")}</div>
      <p class="quote">${escapeHtml(top.summary)}</p>
      <div class="result-actions">
        <button type="button" data-question="${escapeHtml(top.question)}" class="result-question">用这个结果生成阐释</button>
        <button type="button" id="quiz-again" class="secondary-action">再测一次</button>
      </div>
    </section>

    <section class="section">
      <h2>相似度排行</h2>
      <div class="score-list">
        ${ranked.slice(0, 5).map((item) => renderScoreBar(item, maxScore)).join("")}
      </div>
    </section>

    <section class="section">
      <h2>另一面</h2>
      <p class="quote">你也有一点 ${escapeHtml(runnerUp.name)} 的影子：${escapeHtml(runnerUp.title)}。如果把第一名看作你的主线，第二名就是你在压力或亲密关系里容易显露的副线。</p>
    </section>
  `;

  document.querySelector("#quiz-again").addEventListener("click", renderQuiz);
  document.querySelector(".result-question").addEventListener("click", (event) => {
    questionEl.value = event.currentTarget.dataset.question;
    ask();
  });
}

function renderScoreBar(item, maxScore) {
  const percent = Math.round((item.score / maxScore) * 100);
  return `
    <div class="score-row">
      <div class="score-label">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.title)}</span>
      </div>
      <div class="score-track">
        <div class="score-fill" style="width: ${percent}%"></div>
      </div>
      <span class="score-value">${percent}%</span>
    </div>
  `;
}

function renderPassage(item) {
  return `
    <article class="card">
      <div class="card-title">
        <span>第${item.chapter}回</span>
        <span class="citation-chip passage-chip">${escapeHtml(formatPassageId(item.id))}</span>
      </div>
      <p class="meta">${escapeHtml(item.title)}</p>
      <p class="quote">${escapeHtml(item.text)}</p>
      <div class="tags">${item.themes.map(tag).join("")}</div>
    </article>
  `;
}

function renderConcept(item) {
  return `
    <article class="card">
      <div class="card-title">
        <span>${escapeHtml(item.tradition)} · ${escapeHtml(item.name)}</span>
        <span class="citation-chip concept-chip">${escapeHtml(formatConceptId(item))}</span>
      </div>
      <p class="quote">${escapeHtml(item.definition)}</p>
      <div class="tags">${item.keywords.slice(0, 5).map(tag).join("")}</div>
    </article>
  `;
}

function renderCharacter(item) {
  return `
    <article class="card">
      <div class="card-title">${escapeHtml(item.name)}</div>
      <p class="quote">${escapeHtml(item.summary)}</p>
      <div class="tags">${item.keywords.map(tag).join("")}</div>
    </article>
  `;
}

function renderMatchedScenes(scenes) {
  if (!Array.isArray(scenes) || scenes.length === 0) return "";
  return `
    <div class="scene-strip">
      ${scenes
        .map(
          (scene) =>
            `<span class="scene-pill">${escapeHtml(scene.name)} · 第${scene.chapters.map(escapeHtml).join("、")}回</span>`,
        )
        .join("")}
    </div>
  `;
}

function renderCitationNotes(notes, citations) {
  if (!Array.isArray(notes) || notes.length === 0) return "";
  return `
    <section class="section">
      <h2>引用说明</h2>
      <ul class="paragraphs">
        ${notes.map((note) => `<li>${renderInlineCitations(typeof note === "string" ? note : JSON.stringify(note), citations)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function buildCitationMap(data) {
  const map = new Map();
  (data.evidence || []).forEach((item) => {
    map.set(item.id, {
      label: formatPassageId(item.id),
      kind: "passage",
      title: `第${item.chapter}回 · ${item.title}`,
    });
  });
  (data.concepts || []).forEach((item) => {
    map.set(item.id, {
      label: `${item.tradition} · ${item.name}`,
      kind: "concept",
      title: item.definition,
    });
  });
  return map;
}

function renderInlineCitations(value, citations) {
  const text = String(value || "");
  const pattern = /\b(hlm_ch\d{3}_p\d{3}|[a-z]+_[a-z0-9_]+)\b/g;
  let html = "";
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const id = match[1];
    const citation = citations.get(id);
    html += escapeHtml(text.slice(cursor, match.index));
    if (citation) {
      html += `<span class="citation-chip ${citation.kind}-chip" title="${escapeHtml(citation.title)}">${escapeHtml(citation.label)}</span>`;
    } else {
      html += escapeHtml(id);
    }
    cursor = match.index + id.length;
  }
  html += escapeHtml(text.slice(cursor));
  return html;
}

function formatPassageId(id) {
  const match = String(id).match(/^hlm_ch(\d{3})_p(\d{3})$/);
  if (!match) return id;
  return `第${Number(match[1])}回 · p${Number(match[2])}`;
}

function formatConceptId(item) {
  return `${item.tradition} · ${item.name}`;
}

function tag(value) {
  return `<span class="tag">${escapeHtml(value)}</span>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

ask();
