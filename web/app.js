const form = document.querySelector("#ask-form");
const questionEl = document.querySelector("#question");
const answerEl = document.querySelector("#answer");
const useLlmEl = document.querySelector("#use-llm");
const explainButton = document.querySelector("#explain-button");
const perspectiveButtons = [...document.querySelectorAll("[data-perspective]")];
const exampleButtons = [...document.querySelectorAll("[data-question]")];

let perspective = "综合";

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
