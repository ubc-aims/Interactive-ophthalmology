"use strict";

const assessorStandard = typeof module !== "undefined" && module.exports
  ? require("./clinical-standard.js") : clinicalStandard;
const assessmentCriteria = assessorStandard.criteria;

async function assessLearner(key, phase, text, evidence) {
  if (typeof key !== "string" || !key.trim()) throw new Error("An OpenRouter API key is required.");
  if (!Object.prototype.hasOwnProperty.call(assessmentCriteria, phase)) {
    throw new Error("Assessment phase is unavailable.");
  }
  if (typeof text !== "string" || !text.trim()) throw new Error("Learner text is required.");

  const criteria = assessmentCriteria[phase];
  const responseSchema = {
    type: "json_schema",
    json_schema: {
      name: "learner_assessment",
      strict: true,
      schema: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", enum: criteria.map(item => item.id) },
                status: { type: "string", enum: ["met", "partial", "missing"] },
                feedback: { type: "string" }
              },
              required: ["id", "status", "feedback"],
              additionalProperties: false
            }
          }
        },
        required: ["results"],
        additionalProperties: false
      }
    }
  };

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key.trim()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: assessorStandard.model,
      provider: { require_parameters: true },
      response_format: responseSchema,
      messages: [
        {
          role: "system",
          content: assessorStandard.prompts.assessor
        },
        {
          role: "user",
          content: JSON.stringify({ phase, criteria, learner_text: text, case_evidence: evidence ?? null })
        }
      ]
    })
  });

  if (!response.ok) throw new Error(`OpenRouter request failed (${response.status}).`);
  const payload = await response.json();
  if (!payload || payload.error) throw new Error("OpenRouter returned a failed response.");
  const choice = Array.isArray(payload.choices) ? payload.choices[0] : null;
  const message = choice && choice.message;
  const content = message && message.content;
  if (!choice || message?.refusal ||
      (choice.finish_reason && choice.finish_reason !== "stop") ||
      typeof content !== "string" || !content.trim()) {
    throw new Error("OpenRouter returned an empty or incomplete assessment.");
  }

  let result;
  try {
    result = JSON.parse(content);
  } catch {
    throw new Error("OpenRouter returned invalid assessment JSON.");
  }
  if (!result || typeof result !== "object" || Array.isArray(result) ||
      Object.keys(result).length !== 1 || !Array.isArray(result.results) ||
      result.results.length !== criteria.length) {
    throw new Error("OpenRouter returned an invalid assessment shape.");
  }
  const allowed = new Set(criteria.map(item => item.id));
  const seen = new Set();
  for (const item of result.results) {
    if (!item || typeof item !== "object" || Array.isArray(item) ||
        Object.keys(item).length !== 3 || !allowed.has(item.id) || seen.has(item.id) ||
        !["met", "partial", "missing"].includes(item.status) ||
        typeof item.feedback !== "string") {
      throw new Error("OpenRouter returned an invalid criterion assessment.");
    }
    seen.add(item.id);
  }
  if (criteria.some((item, index) => result.results[index].id !== item.id)) {
    throw new Error("OpenRouter returned criteria in an invalid order.");
  }
  return result.results;
}

if (typeof globalThis !== "undefined") globalThis.assessmentCriteria = assessmentCriteria;
if (typeof module !== "undefined" && module.exports) {
  module.exports = { assessLearner, assessmentCriteria };
}
