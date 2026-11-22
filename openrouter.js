"use strict";

const patientStandard = typeof module !== "undefined" && module.exports
  ? require("./clinical-standard.js") : clinicalStandard;

async function respondAsPatient(key, question, options, recent, phase = "history", retryDuplicate = false) {
  if (typeof key !== "string" || !key.trim()) throw new Error("An OpenRouter API key is required.");
  if (typeof question !== "string" || (!question.trim() && phase !== "counselling")) throw new Error("A learner question is required.");
  if (!Array.isArray(options)) throw new Error("Case facts must be an array.");

  const allowed = new Map();
  for (const option of options) {
    if (!option || typeof option.id !== "string" || !option.id.trim() ||
        typeof option.question !== "string" || !option.question.trim() || allowed.has(option.id)) {
      throw new Error("Built-in options must have unique IDs and question text.");
    }
    allowed.set(option.id, option);
  }

  const responseSchema = {
    type: "json_schema",
    json_schema: {
      name: "patient_dialogue",
      strict: true,
      schema: {
        type: "object",
        properties: {
          reply: { type: "string" },
          ids: { type: "array", items: { type: "string" } },
          kind: { type: "string", enum: ["appropriate", "review", "off_topic"] }
        },
        required: ["reply", "ids", "kind"],
        additionalProperties: false
      }
    }
  };

  const context = Array.isArray(recent)
    ? recent.filter(turn => turn && typeof turn.question === "string" && typeof turn.reply === "string")
      .map(turn => ({ question: turn.question, reply: turn.reply }))
    : [];
  const catalog = [...allowed.values()].map(({ id, question: text, note, kind }) => ({
    id,
    question: text,
    ...(note && kind !== "review" ? { fact: note } : {}),
    ...(typeof kind === "string" ? { kind } : {})
  }));

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key.trim()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: patientStandard.model,
      provider: { require_parameters: true },
      response_format: responseSchema,
      messages: [
        {
          role: "system",
          content: patientStandard.prompts.patient + (retryDuplicate ? " The previous attempt repeated an earlier reply. Give a fresh, targeted answer to the latest question." : "")
        },
        {
          role: "user",
          content: JSON.stringify({
            phase,
            latest_message: question,
            facts: catalog,
            conversation: context,
            ...(phase === "counselling" ? { patient_agenda: patientStandard.patientAgenda } : {})
          })
        }
      ]
    })
  });

  if (!response.ok) throw new Error(`OpenRouter request failed (${response.status}).`);
  const payload = await response.json();
  if (!payload || payload.error) throw new Error("OpenRouter returned a failed response.");
  const choice = payload && Array.isArray(payload.choices) ? payload.choices[0] : null;
  const message = choice && choice.message;
  const content = message && message.content;
  if (!choice || message?.refusal ||
      (choice.finish_reason && choice.finish_reason !== "stop") ||
      typeof content !== "string" || !content.trim()) {
    throw new Error("OpenRouter returned an empty or incomplete patient dialogue.");
  }

  let result;
  try {
    result = JSON.parse(content);
  } catch {
    throw new Error("OpenRouter returned invalid patient dialogue JSON.");
  }
  if (!result || typeof result !== "object" || Array.isArray(result) ||
      Object.keys(result).length !== 3 || typeof result.reply !== "string" || !result.reply.trim() || !Array.isArray(result.ids) ||
      !["appropriate", "review", "off_topic"].includes(result.kind)) {
    throw new Error("OpenRouter returned an invalid patient dialogue shape.");
  }
  if (result.ids.length > allowed.size ||
      result.ids.some(id => typeof id !== "string" || !allowed.has(id)) ||
      new Set(result.ids).size !== result.ids.length ||
      (result.kind === "off_topic" && result.ids.length !== 0)) {
    throw new Error("OpenRouter returned invalid or unavailable question IDs.");
  }
  const normalize = value => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const reply = result.reply.trim();
  const repeatsReply = context.some(turn => normalize(turn.reply) === normalize(reply));
  const askedToRepeat = /\b(?:repeat|restate|again|confirm)\b/i.test(question)
    || context.some(turn => normalize(turn.question) === normalize(question));
  if (repeatsReply && !askedToRepeat) {
    if (!retryDuplicate) return respondAsPatient(key, question, options, recent, phase, true);
    throw new Error("Sarah’s reply repeated an earlier message. Please send your question again.");
  }
  return { reply, ids: result.ids, kind: result.kind };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { respondAsPatient };
}
