export type AnalyticsEvent = "page_view" | "simulado_started" | "simulado_completed";

function sessionId() {
  const key = "domina_session_id_v1";
  const current = window.localStorage.getItem(key);
  if (current) return current;
  const created = crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}

export function trackAnalytics(eventType: AnalyticsEvent, path = window.location.pathname) {
  const params = new URLSearchParams(window.location.search);
  const payload = JSON.stringify({
    eventType,
    path,
    sessionId: sessionId(),
    referrer: document.referrer,
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
    return;
  }
  void fetch("/api/analytics", { method:"POST", headers:{"content-type":"application/json"}, body:payload, keepalive:true });
}
