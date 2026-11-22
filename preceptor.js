"use strict";

const preceptorStandard = typeof module !== "undefined" && module.exports
  ? require("./clinical-standard.js") : clinicalStandard;

async function respondAsPreceptor(key, transcript, evidence) {
  if (typeof key !== "string" || !key.trim()) throw new Error("An OpenRouter API key is required.");
  if (!Array.isArray(transcript)) throw new Error("A preceptor transcript is required.");
  const turns = transcript.map(turn => {
    if (!turn || typeof turn !== "object" ||
        typeof turn.question !== "string" || typeof turn.reply !== "string") {
      throw new Error("Transcript turns must contain question and reply text.");
    }
    return { learner: turn.question, reply: turn.reply };
  });

  const responseSchema = {
    type: "json_schema",
    json_schema: {
      name: "preceptor_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          reply: { type: "string" },
          ready: { type: "boolean" }
        },
        required: ["reply", "ready"],
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
      model: preceptorStandard.model,
      provider: { require_parameters: true },
      response_format: responseSchema,
      messages: [
        {
          role: "system",
          content: preceptorStandard.prompts.preceptor
        },
        {
          role: "user",
          content: JSON.stringify({ transcript: turns, case_evidence: evidence ?? null })
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
    throw new Error("OpenRouter returned an empty or incomplete preceptor response.");
  }

  let result;
  try {
    result = JSON.parse(content);
  } catch {
    throw new Error("OpenRouter returned invalid preceptor JSON.");
  }
  if (!result || typeof result !== "object" || Array.isArray(result) ||
      Object.keys(result).length !== 2 || typeof result.reply !== "string" ||
      !result.reply.trim() || typeof result.ready !== "boolean") {
    throw new Error("OpenRouter returned an invalid preceptor response.");
  }
  return { reply: result.reply, ready: result.ready };
}

if (typeof globalThis !== "undefined") globalThis.respondAsPreceptor = respondAsPreceptor;
if (typeof module !== "undefined" && module.exports) module.exports = { respondAsPreceptor };
