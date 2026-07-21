import { Router } from "express";

const router = Router();

async function postWithRetry(
  url: string,
  headers: Record<string, string>,
  body: string,
  retries = 2
): Promise<void> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { method: "POST", headers, body });
      if (res.ok) return;
      const text = await res.text().catch(() => "");
      console.error(`[foco360] webhook attempt ${attempt + 1} failed — HTTP ${res.status}: ${text}`);
    } catch (err) {
      console.error(`[foco360] webhook attempt ${attempt + 1} error:`, err);
    }
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  console.error("[foco360] all webhook retries exhausted — giving up (UI not affected)");
}

router.post("/foco360/complete", async (req, res) => {
  const baseUrl = process.env.FOCO360_BASE_URL;
  const apiKey = process.env.FOCO360_API_KEY;
  const stepId = process.env.FOCO360_STEP_ID;

  if (!baseUrl || !apiKey || !stepId) {
    console.warn("[foco360] missing env vars — skipping webhook");
    return res.status(200).json({ ok: true, skipped: true });
  }

  const { ssoToken, report, strategies, resultUrl, extraData } = req.body as {
    ssoToken?: string;
    report?: string;
    strategies?: string[];
    resultUrl?: string;
    extraData?: Record<string, unknown>;
  };

  if (!ssoToken) {
    return res.status(400).json({ error: "ssoToken is required" });
  }

  const payload = {
    sso_token: ssoToken,
    stepId,
    ...(report ? { report } : {}),
    ...(strategies?.length ? { strategies } : {}),
    ...(resultUrl ? { resultUrl } : {}),
    ...(extraData ? { extraData } : {}),
    completed_at: new Date().toISOString(),
  };

  res.status(202).json({ ok: true });

  postWithRetry(
    `${baseUrl}/api/webhook/step-tool-result`,
    {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    JSON.stringify(payload)
  ).catch((err) => console.error("[foco360] unexpected error:", err));
});

export default router;
