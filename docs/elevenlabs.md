# ElevenLabs: what we verified

Facts about ElevenLabs that this project depends on, each checked against the docs or a live result on 14 Nov 2026. Read this before changing Laura's voice, guardrails or call script, and re-check the linked page when a fact matters: the platform changes weekly (see the [changelog](https://elevenlabs.io/docs/changelog/llms.txt)).

Reading the docs: [llms.txt](https://elevenlabs.io/docs/llms.txt) indexes every page, and adding `.md` to a page's URL returns it as Markdown. The API schema is at `https://api.elevenlabs.io/openapi.json`. Read whole pages; summaries have missed caveats here more than once.

## Commands

| Command | What it does |
|---|---|
| `npm run laura-agent` | Pushes `agent/` (instructions, tools, voice, guardrails) to the Laura agent and attaches the phone number. No call. |
| `npm run laura-agent:test` | Runs the tests in `agent/tests.json` against Laura's live configuration. No call; about 50–150 credits per test run. Add `-- 3` to run each 3 times: guardrail misfires are intermittent. |
| `npm run last-call` | Prints the latest call (lines, tool calls and results, guardrails that fired with their reason, end reason, cost) and what the database recorded. Read-only. |

## The API key

The key has ElevenAgents Write, Voices Read and User Access. Without Voices Write it cannot add a voice to My Voices; without Text to Speech it cannot render audio (`missing the permission text_to_speech`). `GET /v1/user` returns no email address.

## Voice

- An agent can only use a voice that is in **My Voices**. Pushing an agent with a Voice Library voice that is not saved fails with `400 voice_not_found`. Add it with the **+** in the [Voice Library](https://elevenlabs.io/docs/eleven-creative/voices/voice-library), then push.
- In the Voice Library a yellow tick is a Professional Voice Clone and a black (grey in dark mode) tick is **Studio Quality**, recorded and QA-checked; the API calls that category `high_quality`.
- `verified_languages[].model_id` lists every model a voice is tested on; check the whole list, not the first entry. Laura uses `eleven_v4_turbo`.

## Speech on Eleven v4 Turbo

- **No speed setting.** [Speed control](https://elevenlabs.io/docs/eleven-agents/customization/voice/speed-control) "is not available for Eleven v3, Eleven v4, or Eleven v4 Turbo models".
- **No SSML `<break>` tags.** [Pauses](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices) come from punctuation and structure: "Ellipses (...) add pauses and weight". Measured on a call recording: about 0.5 s at each "..." (the same as a full stop) and 0.7 s before a new question.
- **Expressive mode** is on with v4 Turbo: the language model writes tags such as `[warm]` or `[slow]` that shape delivery and are not spoken. Each tag affects about the next 4–5 words. `suggested_audio_tags`: at most 20, tag 1–30 characters, description up to 200. See [Expressive mode](https://elevenlabs.io/docs/eleven-agents/customization/voice/expressive-mode).
- Phone audio is the main limit on how a voice sounds: compare a voice in the dashboard's Test AI agent before blaming it. The Peoplefone trunk offers G.722 first, but calls to a mobile usually end up narrowband.

## Guardrails

See [Guardrails](https://elevenlabs.io/docs/eleven-agents/best-practices/guardrails) and `platform_settings.guardrails` in `agent/agent.json`.

- **Focus** and **prompt injection** are free; prompt injection reads the caller's words and always ends the call.
- **Content** categories judge Laura's replies. `medical_and_legal_information`, `violence` and `self_harm` stay off: tablet names, Readings and the 112 line would trip them.
- **Custom** guardrails send each reply to a small model with your rule. In **streaming** mode (the default, and the only one where the action can be `end_call` without extra latency) the judge sees the reply *while it is being spoken*, so it can block a correct answer it has only half heard: "the current snippet is incomplete, it is about to address a request to change a medication dose". `evaluate_full_response_only` judges the whole reply once but requires `blocking` mode, which adds about 200–500 ms per reply. `retry` also requires blocking, and the docs warn it is less predictable on voice.
- A custom rule's judge knows nothing about Laura. Without context, "Hi Lidia, it's Laura" was blocked as a person introducing herself. Every custom prompt therefore starts with what Laura is.
- `history_message_count`: 0 shows the judge only the reply; 1 adds the caller's latest message.
- Laura's own wording can trip a rule: "So you know it's really me" tripped "Never claims to be human".
- A guardrail that ends the call leaves the Call live with no summary until the next Call now.
- `synthetic_voice` and `human_voice` exist on the agent but are not in the docs or the API schema; they stay off.

## Agent tests

- `POST /v1/convai/agent-testing/create` (type `llm`: chat history plus a success condition), `POST /v1/convai/agents/{agent_id}/run-tests`, then poll `GET /v1/convai/test-invocations/{id}`. Each run reports `triggered_guardrails` with the judge's rationale.
- Tests judge Laura's **text**, not her audio. A guardrail block fails the test with "Agent response blocked by guardrail".
- The evaluator reads the whole turn, including the tool calls: a condition that says "does not list what she noted" failed because the `end_call_summary` text listed it. Word conditions about what she says out loud.

## Calls and conversations

- Outbound calls: `POST /v1/convai/sip-trunk/outbound-call` with the agent, the phone number id, the number to dial and the per-call `dynamic_variables` (all strings).
- A busy line comes back as SIP 486 (`line_busy`); Call now then deletes the Call, so a retry is allowed at once.
- `GET /v1/convai/conversations?agent_id=…` lists calls; `GET /v1/convai/conversations/{id}` has the transcript, `tool_calls`, `tool_results`, `triggered_guardrails`, `metadata.termination_reason` and the cost; `…/{id}/audio` is the recording.
- Cost on this account: about 480–510 credits a minute of call.
