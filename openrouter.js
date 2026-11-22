"use strict";

const patientStandard = typeof module !== "undefined" && module.exports
  ? require("./clinical-standard.js") : clinicalStandard;

async function interpretPatientQuestion(key, question, options, recent, objective) {
  if (typeof key !== "string" || !key.trim()) throw new Error("An OpenRouter API key is required.");
  if (typeof question !== "string" || !question.trim()) throw new Error("A learner question is required.");
  if (!Array.isArray(options) || options.length === 0) throw new Error("Built-in question options are required.");

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
      name: "patient_question_classification",
      strict: true,
      schema: {
        type: "object",
        properties: {
          ids: { type: "array", items: { type: "string" } },
          kind: { type: "string", enum: ["appropriate", "review", "off_topic"] }
        },
        required: ["ids", "kind"],
        additionalProperties: false
      }
    }
  };

  const context = Array.isArray(recent)
    ? recent.filter(turn => turn && typeof turn.question === "string" && typeof turn.reply === "string")
      .map(turn => ({ question: turn.question, reply: turn.reply }))
    : [];
  const catalog = [...allowed.values()].map(({ id, question: text, kind }) => ({
    id,
    question: text,
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
          content: patientStandard.prompts.patient
        },
        {
          role: "user",
          content: JSON.stringify({ objective, question, options: catalog, recent: context })
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
    throw new Error("OpenRouter returned an empty or incomplete classification.");
  }

  let result;
  try {
    result = JSON.parse(content);
  } catch {
    throw new Error("OpenRouter returned invalid classification JSON.");
  }
  if (!result || typeof result !== "object" || Array.isArray(result) ||
      Object.keys(result).length !== 2 || !Array.isArray(result.ids) ||
      !["appropriate", "review", "off_topic"].includes(result.kind)) {
    throw new Error("OpenRouter returned an invalid classification shape.");
  }
  if (result.ids.length > allowed.size ||
      result.ids.some(id => typeof id !== "string" || !allowed.has(id)) ||
      new Set(result.ids).size !== result.ids.length ||
      (result.kind === "off_topic" ? result.ids.length !== 0 : result.ids.length === 0)) {
    throw new Error("OpenRouter returned invalid or unavailable question IDs.");
  }
  return { ids: result.ids, kind: result.kind };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { interpretPatientQuestion };
}
