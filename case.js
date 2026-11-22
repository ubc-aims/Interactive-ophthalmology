"use strict";

const scene = document.querySelector("#scene");
const notes = document.querySelector("#notes");
const stages = document.querySelector("#stages");
const theme = document.querySelector("#theme");
const steps = [
  {
    label: "History",
    objective: "Take a focused red-eye history. Ask about vision change, pain, light sensitivity, contact lenses, injury, and recent procedures. Clarify the redness and lid bump.",
    render: interview
  },
  {
    label: "Examination",
    objective: "Check visual acuity, pupils, eye movements, lids, cornea, and anterior chamber. Use the photos and exam findings to identify which structures are involved.",
    render: examination
  },
  {
    label: "Preceptor",
    objective: "Present a concise case summary. State your working diagnosis, support it with key findings, compare relevant alternatives, and explain the urgency.",
    render: () => discussion("preceptor")
  },
  {
    label: "Counselling",
    objective: "Explain the likely cause to Sarah in everyday language. Discuss what she can do, when to recheck the bump, and which symptoms need urgent assessment.",
    render: () => discussion("counselling")
  }
];

let step, seenHistory, seenExam, interviewTurns, studentNotes, manualChecks, assessments, activeHints;
let chatKey;

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
  interviewTurns = [];
  seenExam = new Map();
  studentNotes = "";
  manualChecks = new Set();
  assessments = new Map();
  render();
}

function next() {
  step += 1;
  render();
  if (step === 1) notes.querySelector("#notes-exam").open = true;
}

function heading(title) {
  const node = element("h2", title);
  node.id = "scene-title";
  node.tabIndex = -1;
  scene.append(node);
}

function render() {
  const stage = steps[step];
  const list = element("ol");
  steps.forEach(({ label }, index) => {
    const item = element("li", label);
    if (index === step) item.setAttribute("aria-current", "step");
    list.append(item);
  });
  const progress = element("progress", "", "case-progress");
  progress.max = steps.length;
  progress.value = step;
  progress.setAttribute("aria-label", "Completed case stages");
  const caption = element("p", stage ? `Stage ${step + 1} of ${steps.length}` : "Case complete", "progress-caption");
  stages.replaceChildren(caption, progress, list);
  scene.replaceChildren();
  activeHints = null;
  scene.classList.toggle("chat-scene", Boolean(stage) && step !== 1);
  if (stage) stage.render();
  else debrief();
  renderNotes();
  const title = scene.querySelector("h2");
  title.focus({ preventScroll: true });
  if (title.getBoundingClientRect().top < 0) title.scrollIntoView({ block: "start" });
}

function stageObjective() {
  return element("p", steps[step].objective, "stage-objective");
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
  const draft = element("textarea");
  draft.id = "draft";
  draft.rows = 1;
  draft.setAttribute("aria-label", "Message to Sarah");
  draft.placeholder = "Message to Sarah";
  const suggestions = element("div", "", "suggestions");
  activeHints = suggestions;
  const send = element("button", "Send", "primary");
  send.type = "submit";
  send.disabled = true;
  const proceed = button("Start examination", "secondary", next);
  proceed.disabled = true;
  const end = element("div", "", "stage-end");
  end.hidden = true;
  end.append(chatMessage(clinicalCase.patient, "I’m ready whenever you want to take a look at my eye.", "patient"), proceed);
  const options = clinicalCase.history.flatMap(topic => topic.questions);
  let selected;
  let lastFeedback;
  let pending = false;
  const turnStatus = element("p", "", "chat-status");
  turnStatus.setAttribute("role", "status");

  draft.addEventListener("input", () => {
    selected = undefined;
    send.disabled = !draft.value.trim() || pending;
  });
  enterToSend(draft, composer);

  function showSuggestions(recentIds = []) {
    const available = options.filter(item =>
      !seenHistory.has(item.id) && (!item.requires || seenHistory.has(item.requires))
    );
    const related = available.filter(item => recentIds.includes(item.requires));
    function choice(item) {
      return button(item.question, "suggestion", () => {
        if (pending) return;
        selected = item;
        draft.value = item.question;
        send.disabled = false;
        draft.focus();
      });
    }
    suggestions.replaceChildren(...[...related, ...available.filter(item => !related.includes(item))].map(choice));
    if (!available.length) suggestions.append(element("p", "You can finish the history.", "muted"));
  }

  function addTurn(question, reply, verdict, explanation, kind) {
    const turn = element("div", "", "chat-turn");
    const feedback = element("details", "", "turn-feedback");
    feedback.open = true;
    if (lastFeedback) lastFeedback.open = false;
    feedback.dataset.kind = kind;
    feedback.append(element("summary", verdict), element("p", explanation));
    turn.append(
      chatMessage("You", question, "learner"),
      chatMessage(clinicalCase.patient, reply, "patient"),
      feedback
    );
    log.append(turn);
    log.scrollTop = log.scrollHeight;
    lastFeedback = feedback;
    interviewTurns.push({ question, reply });
  }

  function applyAnswer(question, items, kind) {
    if (kind === "off_topic") {
      addTurn(question, "I’m not sure how to answer that. Could you ask me another way?",
        "Try another question", "Ask one specific question about why Sarah came in or what she has noticed.", "review");
      return;
    }
    const review = kind === "review";
    const reply = items.map(item => item.reply).join(" ");
    const verdict = review ? "Reconsider this question"
      : items.some(item => item.requires) ? "Appropriate follow-up" : "Appropriate question";
    const explanation = review && items.every(item => item.kind !== "review")
      ? "Ask what Sarah has noticed and give her room to answer before drawing a conclusion."
      : items.map(item => item.feedback).join(" ");
    addTurn(question, reply, verdict, explanation, kind);
    if (!review) {
      for (const item of items) seenHistory.set(item.id, item);
    } else {
      for (const item of items.filter(item => item.kind === "review")) seenHistory.set(item.id, item);
    }
    showSuggestions(items.map(item => item.id));
    renderNotes();
  }

  composer.addEventListener("submit", async event => {
    event.preventDefault();
    const question = draft.value.trim();
    if (!question || pending || !chatKey) return;
    if (selected) {
      applyAnswer(question, [selected], selected.kind || "appropriate");
    } else {
      pending = true;
      send.disabled = true;
      proceed.disabled = true;
      draft.readOnly = true;
      turnStatus.textContent = "Waiting for Sarah’s reply…";
      try {
        const result = await interpretPatientQuestion(chatKey, question, options, interviewTurns, steps[0].objective);
        const items = result.ids.map(id => options.find(item => item.id === id));
        const kind = items.some(item => item.kind === "review") ? "review" : result.kind;
        applyAnswer(question, items, kind);
        turnStatus.textContent = "";
      } catch (error) {
        turnStatus.textContent = error.message;
        send.disabled = false;
        draft.focus();
        return;
      } finally {
        pending = false;
        draft.readOnly = false;
        proceed.disabled = ![...seenHistory.values()].some(answer => answer.kind !== "review");
      }
    }
    selected = undefined;
    draft.value = "";
    send.disabled = true;
    proceed.disabled = ![...seenHistory.values()].some(answer => answer.kind !== "review");
    end.hidden = proceed.disabled;
    draft.focus();
  });

  composer.append(draft, send);
  scene.append(header, stageObjective(), log, composer, turnStatus, end);
  showSuggestions();
}

function enterToSend(input, form) {
  input.addEventListener("keydown", event => {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
    event.preventDefault();
    form.requestSubmit();
  });
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
  scene.append(stageObjective(), element("p", "Select each exam component. For the lids, inspect the reference photos before revealing the findings."));
  const actions = element("div", "", "actions");
  const panel = element("div");
  const proceed = button("Talk to preceptor", "primary", next);
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
  const hints = element("p", "Start with vision in each eye. Inspect the lid contour and lash bases, then check whether the redness involves the cornea or anterior chamber.");
  activeHints = hints;
  scene.append(actions, panel, proceed);
}

function discussion(phase) {
  const isPreceptor = phase === "preceptor";
  const speaker = isPreceptor ? "Preceptor" : clinicalCase.patient;
  const opening = isPreceptor
    ? "Tell me what you found, what you think is going on, and what else you considered."
    : "What do you think the bump is? What should I do about it?";
  const header = element("div", "", "chat-header");
  heading(speaker);
  const identity = element("div", "", "chat-identity");
  identity.append(scene.lastElementChild);
  const notesLink = element("a", "Clinical notes", "chat-notes-link");
  notesLink.href = "#notes";
  header.append(identity, notesLink);
  const log = element("div", "", "chat-log");
  log.setAttribute("role", "log");
  log.setAttribute("aria-label", "Conversation with " + speaker);
  log.append(chatMessage(speaker, opening, "patient"));
  const composer = element("form", "", "chat-composer");
  const draft = element("textarea");
  draft.rows = 1;
  draft.setAttribute("aria-label", "Message to " + speaker);
  draft.placeholder = "Message to " + speaker;
  const send = element("button", "Send", "primary");
  send.type = "submit";
  send.disabled = true;
  const status = element("p", "", "chat-status");
  status.setAttribute("role", "status");
  const proceed = button(isPreceptor ? "Return to Sarah" : "View feedback", "secondary", next);
  const end = element("div", "", "stage-end");
  end.hidden = true;
  end.append(proceed);
  let pending = false;
  draft.addEventListener("input", () => { send.disabled = pending || !draft.value.trim(); });
  enterToSend(draft, composer);
  composer.addEventListener("submit", async event => {
    event.preventDefault();
    const text = draft.value.trim();
    if (!text || pending || !chatKey) return;
    pending = true;
    proceed.disabled = true;
    send.disabled = true;
    draft.readOnly = true;
    status.textContent = "Reviewing your response…";
    try {
      const feedback = await assessLearner(chatKey, phase, text, {
        objective: steps[step].objective,
        history: [...seenHistory.values()].filter(item => item.kind !== "review").map(item => item.note),
        examination: [...seenExam.values()].map(([label, finding]) => ({ label, finding })),
        student_checklist: [...manualChecks],
        reference: isPreceptor ? {
          diagnosis: "Chalazion with associated blepharitis and meibomian gland dysfunction.",
          differential: "An external hordeolum is typically tender and located at the lash line. Conjunctivitis does not explain a discrete deep lid nodule.",
          urgency: "Use the red flags actually checked and exam findings actually observed."
        } : { plan: clinicalCase.checkpoints.plan.modelResponse }
      });
      assessments.set(phase, feedback);
      const turn = element("div", "", "chat-turn");
      turn.append(chatMessage("You", text, "learner"));
      turn.append(chatMessage(speaker, isPreceptor
        ? "Review the feedback below. You can send a revised presentation or go back to Sarah."
        : "Thanks for talking it through with me.", "patient"));
      turn.append(assessmentDisplay(phase, feedback));
      log.append(turn);
      log.scrollTop = log.scrollHeight;
      draft.value = "";
      status.textContent = "";
      end.hidden = false;
    } catch (error) {
      status.textContent = error.message;
    } finally {
      pending = false;
      proceed.disabled = false;
      draft.readOnly = false;
      send.disabled = !draft.value.trim();
      draft.focus();
    }
  });
  const hints = element("ul");
  for (const { label } of assessmentCriteria[phase]) hints.append(element("li", label));
  activeHints = hints;
  composer.append(draft, send);
  scene.append(header, stageObjective(), log, composer, status, end);
}

function assessmentDisplay(phase, feedback) {
  const section = element("div", "", "assessment-feedback");
  section.append(element("h3", "Assessor feedback"));
  const list = element("dl");
  const statuses = { met: "Met", partial: "Develop further", missing: "Missing" };
  for (const item of feedback) {
    const criterion = assessmentCriteria[phase].find(entry => entry.id === item.id);
    list.append(element("dt", criterion.label + " · " + statuses[item.status]), element("dd", item.feedback));
  }
  section.append(list);
  return section;
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

function checkItem(list, id, label, observation, status) {
  const item = element("li", "", "check-item");
  const task = element("label", "", "task-checkbox");
  const checkbox = element("input");
  checkbox.type = "checkbox";
  checkbox.checked = manualChecks.has(id);
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) manualChecks.add(id);
    else manualChecks.delete(id);
  });
  task.append(checkbox, element("span", label, "check-label"));
  item.append(task);
  if (status) item.append(element("span", status, "check-state"));
  if (observation) item.append(element("p", observation, "check-evidence"));
  list.append(item);
}

function renderNotes() {
  if (!notes.childElementCount) {
    const title = element("h2", "Clinical notes");
    title.id = "notes-title";
    const label = element("label", "Your notes", "composer-label");
    label.htmlFor = "student-notes";
    const entry = element("textarea", "", "student-notes");
    entry.id = "student-notes";
    entry.placeholder = "Write your observations and differential…";
    entry.value = studentNotes;
    entry.addEventListener("input", () => { studentNotes = entry.value; });
    notes.append(title, label, entry);
  }
  const history = element("ul", "", "checklist");
  for (const topic of [...clinicalCase.history.filter(item => item.priority), ...clinicalCase.history.filter(item => !item.priority)]) {
    const answers = topicAnswers(topic);
    const status = topicCovered(topic) ? "Asked" : answers.length ? "Partial" : "";
    checkItem(history, topic.id, topic.label, answers.map(item => item.note).join(" "), status);
  }
  notesSection("history", "History checklist", true).replaceChildren(history);
  const exam = element("ul", "", "checklist");
  for (const { id, label, purpose } of clinicalCase.exam) {
    const found = seenExam.get(id);
    checkItem(exam, "exam-" + id, label, found ? found[1] : purpose, found ? "Examined" : "");
  }
  notesSection("exam", "Examination checklist", step === 1).replaceChildren(exam);
  const transcript = notesSection("transcript", "Interview transcript", false);
  transcript.parentElement.hidden = step === 0;
  const entries = element("dl", "", "clinical-finding");
  entries.append(element("dt", clinicalCase.patient), element("dd", clinicalCase.opening));
  for (const { question, reply } of interviewTurns) {
    entries.append(element("dt", question), element("dd", reply));
  }
  transcript.replaceChildren(entries);
  const hints = notesSection("hints", "Hints", false);
  hints.parentElement.className = "learner-hints";
  hints.parentElement.hidden = !activeHints;
  if (activeHints && hints.lastElementChild !== activeHints) {
    hints.parentElement.open = false;
    hints.replaceChildren(activeHints);
  }
}

function debrief() {
  heading("Review your reasoning");
  const missed = clinicalCase.history.filter(item => !topicCovered(item)).map(item => item.label);
  if (missed.length) scene.append(element("p", "History topics to revisit: " + missed.join(", ") + "."));
  const review = element("div", "", "review");
  for (const [phase, feedback] of assessments) {
    review.append(element("h3", phase === "preceptor" ? "Preceptor presentation" : "Patient counselling"), assessmentDisplay(phase, feedback));
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
  const label = setting === "dark" ? "Light mode" : "Dark mode";
  theme.textContent = setting === "dark" ? "☀" : "☾";
  theme.setAttribute("aria-label", label);
  theme.title = label;
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

const app = document.querySelector("#case-app");
const dialog = document.querySelector("#unlock-dialog");
const unlockForm = document.querySelector("#unlock-form");
const password = document.querySelector("#chat-passphrase");
const unlockButton = document.querySelector("#unlock-button");
const unlockStatus = document.querySelector("#unlock-status");

dialog.addEventListener("cancel", event => event.preventDefault());
unlockForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (unlockButton.disabled || !password.value) return;
  unlockButton.disabled = true;
  unlockStatus.textContent = "Unlocking…";
  try {
    chatKey = await unlockOpenRouterKey(password.value);
    password.value = "";
    app.inert = false;
    app.classList.remove("locked");
    dialog.close();
    scene.querySelector("#draft").focus();
  } catch (error) {
    unlockStatus.textContent = error.message;
    password.select();
  } finally {
    unlockButton.disabled = false;
  }
});

start();
dialog.showModal();
