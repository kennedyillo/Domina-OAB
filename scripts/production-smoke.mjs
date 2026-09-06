import assert from "node:assert/strict";

const base = (process.env.SMOKE_BASE_URL || "https://www.dominaoab.com.br").replace(/\/$/, "");
const marker = `MARCO_A_CI_${Date.now()}`;
const sessionId = `marco-a-ci-${Date.now()}`;

async function request(path, init = {}) {
  const response = await fetch(`${base}${path}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(20_000),
    ...init,
    headers: {
      "user-agent": "Domina-OAB-Marco-A-CI/1.0",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;
  if (text) {
    try { body = JSON.parse(text); } catch { body = text; }
  }
  return { response, body };
}

function json(body) {
  return {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

console.log(`Production smoke: ${base}`);
console.log(`Marker: ${marker}`);

// 1. Public simulation must be reachable and must not leak answers before verification.
const simulation = await request("/api/simulations?slug=simulado-etica");
assert.equal(simulation.response.status, 200, "simulation catalog must return 200");
assert.ok(Array.isArray(simulation.body?.questions) && simulation.body.questions.length > 0, "simulation must return questions");
const question = simulation.body.questions[0];
assert.ok(Number.isInteger(question.id), "question id must be present");
assert.equal("correct_index" in question, false, "catalog must not leak correct_index");
assert.equal("explanation" in question, false, "catalog must not leak explanation");
console.log(`✓ simulation public payload safe (question ${question.id})`);

// 2. Verify endpoint through the real external edge.
const validVerify = await request("/api/questions/verify", json({ question_id: question.id, option: 0 }));
assert.equal(validVerify.response.status, 200, `valid verify expected 200, got ${validVerify.response.status}`);
assert.equal(typeof validVerify.body?.correct, "boolean", "verify must return correctness");
assert.ok(Number.isInteger(validVerify.body?.correct_index), "verify must return correct_index only after answer");
assert.equal(typeof validVerify.body?.explanation, "string", "verify must return explanation after answer");
console.log("✓ verify valid → 200");

const invalidVerify = await request("/api/questions/verify", json({ question_id: question.id, option: 9 }));
assert.equal(invalidVerify.response.status, 400, `invalid verify expected 400, got ${invalidVerify.response.status}`);
console.log("✓ verify invalid → 400");

// 3. Report endpoint through the real external edge. The marker allows cleanup after evidence is recorded.
const validReport = await request("/api/questions/report", json({
  question_id: question.id,
  reason: "outro",
  message: `${marker} - reporte automatizado de QA do Marco A`,
}));
assert.equal(validReport.response.status, 201, `valid report expected 201, got ${validReport.response.status}`);
assert.equal(validReport.body?.ok, true, "report must return ok=true");
assert.ok(Number.isInteger(validReport.body?.report_id), "report must return report_id");
console.log(`✓ report valid → 201 (report_id=${validReport.body.report_id})`);

const invalidReport = await request("/api/questions/report", json({
  question_id: question.id,
  reason: "invalid_reason",
  message: marker,
}));
assert.equal(invalidReport.response.status, 400, `invalid report expected 400, got ${invalidReport.response.status}`);
console.log("✓ report invalid → 400");

// 4. Analytics through the real external edge with deterministic QA UTM markers.
const analyticsPayload = {
  eventType: "page_view",
  sessionId,
  path: "/__qa__/marco-a",
  referrer: "https://github.com/kennedyillo/Domina-OAB/actions",
  utmSource: "github-actions",
  utmMedium: "qa",
  utmCampaign: "marco-a-ci",
};
const analytics = await request("/api/analytics", json(analyticsPayload));
assert.equal(analytics.response.status, 204, `analytics expected 204, got ${analytics.response.status}`);
console.log("✓ analytics external → 204");

// 5. Optionally prove external rate limiting. This uses a dedicated QA session/path and stops immediately on 429.
if (process.env.SMOKE_RATE_LIMIT === "1") {
  let limitedAt = null;
  for (let i = 0; i < 80; i += 1) {
    const result = await request("/api/analytics", json({
      ...analyticsPayload,
      sessionId: `${sessionId}-rate`,
      path: "/__qa__/rate-limit",
    }));
    if (result.response.status === 429) {
      limitedAt = i + 1;
      break;
    }
    assert.equal(result.response.status, 204, `analytics burst expected 204/429, got ${result.response.status}`);
  }
  assert.ok(limitedAt, "analytics rate limit did not return 429 within 80 requests");
  console.log(`✓ analytics external rate limit → 429 at request ${limitedAt}`);
}

// 6. Private guards without authentication.
const diagnostics = await request("/api/account/diagnostics");
assert.equal(diagnostics.response.status, 401, "private diagnostics must return 401 without session");
assert.equal(diagnostics.response.headers.get("cache-control"), "no-store", "private diagnostics must be no-store");
console.log("✓ diagnostics guard → 401/no-store");

const preferences = await request("/api/account/communication-preferences");
assert.equal(preferences.response.status, 401, "private preferences must return 401 without session");
assert.equal(preferences.response.headers.get("cache-control"), "no-store", "private preferences must be no-store");
console.log("✓ preferences guard → 401/no-store");

console.log(JSON.stringify({ marker, sessionId, reportId: validReport.body.report_id }));
console.log("Production smoke passed.");
