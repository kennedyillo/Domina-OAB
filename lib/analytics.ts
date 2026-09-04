export type AnalyticsEvent = "page_view" | "simulado_started" | "simulado_completed";

type Attribution = {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
};

function sessionId() {
  const key = "domina_session_id_v1";
  const current = window.localStorage.getItem(key);
  if (current) return current;
  const created = crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}

function sessionAttribution(): Attribution {
  const key = "domina_session_attribution_v1";
  const params = new URLSearchParams(window.location.search);
  const current: Attribution = {
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
  };

  if (current.utmSource || current.utmMedium || current.utmCampaign) {
    window.sessionStorage.setItem(key, JSON.stringify(current));
    return current;
  }

  const stored = window.sessionStorage.getItem(key);
  if (!stored) return current;

  try {
    const parsed = JSON.parse(stored) as Partial<Attribution>;
    return {
      utmSource: typeof parsed.utmSource === "string" ? parsed.utmSource : "",
      utmMedium: typeof parsed.utmMedium === "string" ? parsed.utmMedium : "",
      utmCampaign: typeof parsed.utmCampaign === "string" ? parsed.utmCampaign : "",
    };
  } catch {
    window.sessionStorage.removeItem(key);
    return current;
  }
}

export function trackAnalytics(eventType: AnalyticsEvent, path = window.location.pathname) {
  const attribution = sessionAttribution();
  const payload = JSON.stringify({
    eventType,
    path,
    sessionId: sessionId(),
    referrer: document.referrer,
    ...attribution,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
    return;
  }
  void fetch("/api/analytics", { method:"POST", headers:{"content-type":"application/json"}, body:payload, keepalive:true });
}
