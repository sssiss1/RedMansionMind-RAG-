const form = document.querySelector("#ask-form");
const questionEl = document.querySelector("#question");
const answerEl = document.querySelector("#answer");
const useLlmEl = document.querySelector("#use-llm");
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

function renderAnswer(data) {
  answerEl.innerHTML = `
    <section class="section">
      <h2>结论</h2>
      <div class="thesis">${escapeHtml(data.thesis)}</div>
      ${data.llm_enabled ? `<p class="meta">LLM: ${escapeHtml(data.llm_model || "enabled")}</p>` : ""}
      ${data.llm_error ? `<p class="warning">${escapeHtml(data.llm_error)}</p>` : ""}
      ${data.coverage_warning ? `<p class="warning">${escapeHtml(data.coverage_warning)}</p>` : ""}
      <div class="tags">${data.related_themes.map(tag).join("")}</div>
    </section>

    <section class="section">
      <h2>阐释</h2>
      <ul class="paragraphs">
        ${data.interpretation.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
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

    ${renderCitationNotes(data.citation_notes)}

    <section class="section">
      <div class="meta">${escapeHtml(data.limits || data.disclaimer)}</div>
    </section>
  `;
}

function renderPassage(item) {
  return `
    <article class="card">
      <div class="card-title">
        <span>第${item.chapter}回</span>
        <span class="meta">${item.score}</span>
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
        <span class="meta">${item.score}</span>
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

function renderCitationNotes(notes) {
  if (!Array.isArray(notes) || notes.length === 0) return "";
  return `
    <section class="section">
      <h2>引用说明</h2>
      <ul class="paragraphs">
        ${notes.map((note) => `<li>${escapeHtml(typeof note === "string" ? note : JSON.stringify(note))}</li>`).join("")}
      </ul>
    </section>
  `;
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
