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
  notes.replaceChildren();
  step = 0;
  seenHistory = new Map();
  seenExam = new Map();
  results = new Map();
  render();
}

function next() {
  step += 1;
  render();
  if (step === 2) notes.querySelector("#notes-exam").open = true;
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
  scene.classList.toggle("chat-scene", step === 0);
  steps[step][1]();
  renderNotes();
  const title = scene.querySelector("h2");
  title.focus({ preventScroll: true });
  if (title.getBoundingClientRect().top < 0) title.scrollIntoView({ block: "start" });
}

function chatMessage(speaker, message, side) {
  const bubble = element("div", "", "message " + side + "-message");
  bubble.append(element("span", speaker, "message-label"), element("p", message));
  return bubble;
}

function interview() {
  const header = element("div", "", "chat-header");
  const avatar = element("span", clinicalCase.patient[0], "chat-avatar");
  avatar.setAttribute("aria-hidden", "true");
  const identity = element("div", "", "chat-identity");
  heading(clinicalCase.patient);
  identity.append(scene.lastElementChild, element("span", "Patient interview"));
  const notesLink = element("a", "Clinical notes", "chat-notes-link");
  notesLink.href = "#notes";
  header.append(avatar, identity, notesLink);

  const log = element("div", "", "chat-log");
  log.setAttribute("role", "log");
  log.setAttribute("aria-label", "Patient conversation");
  log.tabIndex = 0;
  const opening = element("div", "", "chat-turn");
  opening.append(chatMessage(clinicalCase.patient, clinicalCase.opening, "patient"));
  log.append(opening);

  const composer = element("form", "", "chat-composer");
  const label = element("label", "Your message", "composer-label");
  label.htmlFor = "draft";
  const draft = element("textarea");
  draft.id = "draft";
  draft.rows = 2;
  draft.readOnly = true;
  draft.placeholder = "Choose a suggested question";
  const suggestions = element("div", "", "suggestions");
  const more = element("details", "", "more-questions");
  const moreSuggestions = element("div", "", "suggestions");
  more.append(element("summary", "More questions"), moreSuggestions);
  const actions = element("div", "", "composer-actions");
  const send = element("button", "Send", "primary");
  send.type = "submit";
  send.disabled = true;
  const proceed = button("Finish interview", "secondary", next);
  proceed.disabled = true;
  const options = clinicalCase.history.flatMap(topic => topic.questions);
  let selected;
  let lastFeedback;

  function showSuggestions(after) {
    const available = options.filter(item =>
      !seenHistory.has(item.id) && (!item.requires || seenHistory.has(item.requires))
    );
    const related = available.filter(item => item.requires === after && item.requires);
    const suggested = [...related, ...available.filter(item => !related.includes(item))].slice(0, 3);
    function choice(item) {
      const option = button(item.question, "suggestion", () => {
        selected = item;
        draft.value = item.question;
        send.disabled = false;
        send.focus();
      });
      return option;
    }
    suggestions.replaceChildren(...suggested.map(choice));
    moreSuggestions.replaceChildren(...available.filter(item => !suggested.includes(item)).map(choice));
    more.hidden = moreSuggestions.childElementCount === 0;
    if (!available.length) suggestions.append(element("p", "You can finish the interview.", "muted"));
  }

  composer.addEventListener("submit", event => {
    event.preventDefault();
    if (!selected) return;
    const item = selected;
    const turn = element("div", "", "chat-turn");
    const feedback = element("details", "", "turn-feedback");
    feedback.open = true;
    if (lastFeedback) lastFeedback.open = false;
    feedback.dataset.kind = item.kind || "appropriate";
    const verdict = item.kind === "review"
      ? "Reconsider this question"
      : item.requires ? "Appropriate follow-up" : "Appropriate question";
    feedback.append(
      element("summary", verdict),
      element("p", item.feedback)
    );
    turn.append(
      chatMessage("You", item.question, "learner"),
      chatMessage(clinicalCase.patient, item.reply, "patient"),
      feedback
    );
    log.append(turn);
    log.scrollTop = log.scrollHeight;
    lastFeedback = feedback;
    seenHistory.set(item.id, item);
    selected = undefined;
    draft.value = "";
    send.disabled = true;
    proceed.disabled = ![...seenHistory.values()].some(answer => answer.kind !== "review");
    showSuggestions(item.id);
    renderNotes();
    log.focus({ preventScroll: true });
  });

  actions.append(proceed, send);
  composer.append(label, draft, actions, element("p", "Suggested questions", "suggestion-label"), suggestions, more);
  scene.append(header, log, composer);
  showSuggestions();
}

function atlasPhotos(photos) {
  const panel = element("div", "", "atlas-panel");
  panel.append(element("p", "Compare the lid contour and lash bases in these EyeRounds teaching photos, then reveal Sarah’s exam findings."));
  const gallery = element("div", "", "atlas-gallery");
  for (const photo of photos) {
    const figure = element("figure");
    const img = element("img");
    img.alt = photo.alt;
    img.src = photo.src;
    const caption = element("figcaption");
    const source = element("a", "EyeRounds atlas source");
    source.href = photo.source;
    const license = element("a", "CC BY-NC-ND 3.0");
    license.href = "https://creativecommons.org/licenses/by-nc-nd/3.0/";
    caption.append(element("strong", photo.label), element("p", photo.credit + " · University of Iowa"), source, " · ", license);
    figure.append(img, caption);
    gallery.append(figure);
  }
  panel.append(gallery);
  return panel;
}

function examination() {
  heading("Examine the eye");
  scene.append(element("p", "Select each exam component. For the lids, inspect the reference photos before revealing the findings."));
  const actions = element("div", "", "actions");
  const panel = element("div");
  const proceed = button("Continue", "primary", next);
  proceed.disabled = true;
  for (const { id, label, reply, photos } of clinicalCase.exam) {
    const choice = button(label, "choice", () => {
      const detail = element("p", "", "feedback");
      detail.setAttribute("role", "status");
      function reveal() {
        seenExam.set(id, [label, reply]);
        choice.setAttribute("aria-pressed", "true");
        detail.textContent = reply;
        proceed.disabled = seenExam.size !== clinicalCase.exam.length;
        renderNotes();
      }
      panel.replaceChildren();
      if (photos) panel.append(atlasPhotos(photos));
      if (photos && !seenExam.has(id)) {
        const inspect = button("Reveal lid findings", "secondary", () => {
          inspect.hidden = true;
          reveal();
          detail.tabIndex = -1;
          detail.focus();
        });
        panel.append(inspect);
      } else {
        reveal();
      }
      panel.append(detail);
    });
    choice.setAttribute("aria-pressed", "false");
    actions.append(choice);
  }
  scene.append(actions, panel, proceed);
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

function topicAnswers(topic) {
  return topic.questions.filter(item => item.kind !== "review" && seenHistory.has(item.id));
}

function topicCovered(topic) {
  return topic.questions.every(item => item.kind === "review" || item.requires || seenHistory.has(item.id));
}

function notesSection(id, label, open) {
  let section = notes.querySelector("#notes-" + id);
  if (!section) {
    section = element("details", "", "notes-section");
    section.id = "notes-" + id;
    section.open = open;
    section.append(element("summary", label), element("div"));
    notes.append(section);
  }
  return section.lastElementChild;
}

function historyChecklist(topics) {
  const list = element("ul", "", "checklist");
  for (const topic of topics) {
    const answers = topicAnswers(topic);
    const covered = topicCovered(topic);
    const item = element("li", "", "check-item");
    item.dataset.status = covered ? "covered" : "pending";
    item.append(
      element("span", topic.label, "check-label"),
      element("span", covered ? "Checked" : answers.length ? "Ask more" : "To ask", "check-state")
    );
    if (answers.length) item.append(element("p", answers.map(answer => answer.note).join(" "), "check-evidence"));
    list.append(item);
  }
  return list;
}

function renderNotes() {
  if (!notes.childElementCount) {
    const title = element("h2", "Clinical notes");
    title.id = "notes-title";
    notes.append(title);
  }
  notesSection("safety", "Check for red flags", true).replaceChildren(
    historyChecklist(clinicalCase.history.filter(topic => topic.priority))
  );
  notesSection("characterize", "Characterize the red eye", true).replaceChildren(
    historyChecklist(clinicalCase.history.filter(topic => !topic.priority))
  );
  const exam = element("dl", "", "clinical-finding");
  for (const { id, label, purpose } of clinicalCase.exam) {
    const found = seenExam.get(id);
    exam.append(element("dt", label), element("dd", found ? found[1] : purpose));
  }
  notesSection("exam", "Examination checklist", step > 1).replaceChildren(exam);
  const transcript = notesSection("transcript", "Interview transcript", false);
  transcript.parentElement.hidden = step === 0;
  const entries = element("dl", "", "clinical-finding");
  entries.append(element("dt", clinicalCase.patient), element("dd", clinicalCase.opening));
  for (const item of seenHistory.values()) {
    entries.append(element("dt", item.question), element("dd", item.reply));
  }
  transcript.replaceChildren(entries);
}

function debrief() {
  heading("Review your reasoning");
  const missed = clinicalCase.history.filter(item => !topicCovered(item)).map(item => item.label);
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
