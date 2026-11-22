"use strict";

const scene = document.querySelector("#scene");
const notes = document.querySelector("#notes");
const stages = document.querySelector("#stages");
const theme = document.querySelector("#theme");
const steps = [
  ["History", interview],
  ["Safety screen", () => checkpoint("safety")],
  ["Examination", examination],
  ["Key findings", () => checkpoint("findings")],
  ["Diagnosis", () => checkpoint("diagnosis")],
  ["Counselling", () => checkpoint("plan")],
  ["Debrief", debrief]
];

let step, seenHistory, seenExam, results;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function button(text, className, action) {
  const node = element("button", text, className);
  node.type = "button";
  node.addEventListener("click", action);
  return node;
}

function start() {
  step = 0;
  seenHistory = new Map();
  seenExam = new Map();
  results = new Map();
  render();
}

function next() {
  step += 1;
  render();
}

function heading(title) {
  const node = element("h2", title);
  node.id = "scene-title";
  node.tabIndex = -1;
  scene.append(node);
}

function render() {
  const list = element("ol");
  steps.forEach(([name], index) => {
    const item = element("li", name);
    if (index === step) item.setAttribute("aria-current", "step");
    list.append(item);
  });
  stages.replaceChildren(list);
  scene.replaceChildren();
  steps[step][1]();
  renderNotes();
  const title = scene.querySelector("h2");
  title.focus({ preventScroll: true });
  if (title.getBoundingClientRect().top < 0) title.scrollIntoView({ block: "start" });
}

function interview() {
  heading("Take the history");
  scene.append(
    element("blockquote", clinicalCase.opening, "patient"),
    element("p", "Choose what to ask. Follow-up questions appear when the patient gives you a lead.")
  );
  const outline = element("details");
  outline.append(element("summary", "History checklist"));
  const topics = element("ul");
  for (const item of clinicalCase.history) topics.append(element("li", item.label));
  outline.append(topics);
  scene.append(outline);
  const actions = element("div", "", "actions");
  const reply = element("div");
  reply.setAttribute("role", "status");
  const follow = element("div", "", "actions");
  function ask(item, trigger) {
    seenHistory.set(item.id, [item.question, item.reply]);
    reply.replaceChildren(element("p", item.question, "muted"), element("blockquote", item.reply, "patient"));
    trigger.setAttribute("aria-pressed", "true");
    renderNotes();
  }
  for (const item of clinicalCase.history) {
    const choice = button(item.question, "choice", () => {
      ask(item, choice);
      follow.replaceChildren();
      if (item.follow) {
        const branch = { ...item.follow, id: item.id + "-follow" };
        const probe = button(branch.question, "choice", () => ask(branch, probe));
        probe.setAttribute("aria-pressed", String(seenHistory.has(branch.id)));
        follow.append(probe);
      }
      proceed.disabled = false;
    });
    choice.setAttribute("aria-pressed", "false");
    actions.append(choice);
  }
  const proceed = button("Continue", "primary", next);
  proceed.disabled = true;
  scene.append(actions, reply, follow, proceed);
}

function examination() {
  heading("Examine the eye");
  scene.append(element("p", "Choose an exam component to reveal the finding."));
  const actions = element("div", "", "actions");
  const detail = element("p", "", "feedback");
  detail.hidden = true;
  detail.setAttribute("role", "status");
  const proceed = button("Continue", "primary", next);
  proceed.disabled = true;
  clinicalCase.exam.forEach(({ id, label, reply }) => {
    const choice = button(label, "choice", () => {
      seenExam.set(id, [label, reply]);
      choice.setAttribute("aria-pressed", "true");
      detail.hidden = false;
      detail.textContent = reply;
      proceed.disabled = seenExam.size !== clinicalCase.exam.length;
      renderNotes();
    });
    choice.setAttribute("aria-pressed", "false");
    actions.append(choice);
  });
  scene.append(actions, detail, proceed);
}

function checkpoint(key) {
  const quiz = clinicalCase.checkpoints[key];
  heading(quiz.title);
  const form = element("form");
  const fields = element("fieldset");
  fields.append(element("legend", quiz.prompt));
  for (const [id, label] of quiz.choices) {
    const row = element("label", "", "answer");
    const input = element("input");
    input.type = quiz.correct.length > 1 ? "checkbox" : "radio";
    input.name = "answer";
    input.value = id;
    row.append(input, element("span", label));
    fields.append(row);
  }
  const feedback = element("p", "", "feedback");
  feedback.id = "quiz-feedback";
  feedback.hidden = true;
  feedback.setAttribute("role", "status");
  const check = element("button", "Check answer", "primary");
  check.type = "submit";
  const proceed = button("Continue", "primary", next);
  proceed.hidden = true;
  form.append(fields, check, feedback, proceed);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const inputs = [...fields.querySelectorAll("input")];
    const selected = inputs.filter(input => input.checked).map(input => input.value);
    feedback.hidden = false;
    if (!selected.length) {
      feedback.textContent = "Select an answer before checking.";
      return;
    }
    const correct = selected.length === quiz.correct.length && quiz.correct.every(id => selected.includes(id));
    const explanation = quiz.feedback || quiz.choices.find(([id]) => id === selected[0])[2];
    const expected = quiz.choices.filter(([id]) => quiz.correct.includes(id)).map(([, label]) => label);
    const message = (correct ? "Correct. " : "Expected response: " + expected.join(" / ") + ". ") + explanation;
    results.set(key, { selected, message });
    feedback.textContent = message;
    if (quiz.modelResponse) {
      const example = element("blockquote", quiz.modelResponse, "patient");
      example.setAttribute("aria-label", "Example counselling");
      form.insertBefore(example, proceed);
    }
    fields.disabled = true;
    proceed.hidden = false;
    proceed.focus();
    check.hidden = true;
  });
  scene.append(form);
}

function renderNotes() {
  const title = element("h2", "Case notes");
  title.id = "notes-title";
  if (notes.childElementCount === 0) notes.append(title);
  const sections = [
    ["history", "History", seenHistory],
    ["exam", "Examination", seenExam]
  ];
  for (const [id, label, entries] of sections) {
    let details = notes.querySelector("#notes-" + id);
    if (!details) {
      details = element("details");
      details.id = "notes-" + id;
      details.open = true;
      details.append(element("summary", label), element("div"));
      notes.append(details);
    }
    const body = details.lastElementChild;
    if (!entries.size) {
      body.replaceChildren(element("p", "Nothing recorded yet.", "muted"));
      continue;
    }
    const list = element("dl", "", "findings");
    for (const [prompt, reply] of entries.values()) {
      list.append(element("dt", prompt), element("dd", reply));
    }
    body.replaceChildren(list);
  }
}

function debrief() {
  heading("Review your reasoning");
  const missed = clinicalCase.history.filter(item => !seenHistory.has(item.id)).map(item => item.label);
  if (missed.length) scene.append(element("p", "History topics to revisit: " + missed.join(", ") + "."));
  const review = element("div", "", "review");
  for (const [key, result] of results) {
    const quiz = clinicalCase.checkpoints[key];
    const selected = quiz.choices.filter(([id]) => result.selected.includes(id)).map(([, label]) => label);
    review.append(element("h3", quiz.title), element("p", "You chose: " + selected.join(" / ") + ".", "muted"), element("p", result.message));
  }
  const guide = element("details");
  guide.open = true;
  guide.append(element("summary", "Red-eye approach for your next patient"));
  const guideList = element("ol");
  for (const [label, detail] of clinicalCase.guide) {
    const item = element("li");
    item.append(element("strong", label), element("p", detail));
    guideList.append(item);
  }
  guide.append(guideList);
  const references = element("details");
  references.append(element("summary", "Clinical references"));
  const sourceList = element("ul");
  for (const [label, url] of clinicalCase.references) {
    const item = element("li");
    const link = element("a", label);
    link.href = url;
    item.append(link);
    sourceList.append(item);
  }
  references.append(sourceList);
  scene.append(review, guide, references, button("Restart case", "primary", start));
}

function applyTheme(setting) {
  document.documentElement.dataset.theme = setting;
  theme.textContent = setting === "dark" ? "Light mode" : "Dark mode";
}

let themeSetting = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
try {
  const saved = localStorage.getItem("ophthalmology-theme");
  if (saved === "dark" || saved === "light") themeSetting = saved;
} catch {}
applyTheme(themeSetting);
theme.addEventListener("click", () => {
  themeSetting = themeSetting === "dark" ? "light" : "dark";
  applyTheme(themeSetting);
  try { localStorage.setItem("ophthalmology-theme", themeSetting); } catch {}
});

start();
