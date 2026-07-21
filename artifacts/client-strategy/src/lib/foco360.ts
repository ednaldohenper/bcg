const SSO_TOKEN_KEY = "foco_sso_token";
const SSO_META_KEY = "foco_sso_meta";

export type FocoMeta = {
  clientId?: string;
  stepId?: string;
  productId?: string;
};

export function captureFocoToken(): void {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("sso_token");
  if (!token) return;

  sessionStorage.setItem(SSO_TOKEN_KEY, token);

  const meta: FocoMeta = {};
  const clientId = params.get("client_id");
  const stepId = params.get("step_id");
  const productId = params.get("product_id");
  if (clientId) meta.clientId = clientId;
  if (stepId) meta.stepId = stepId;
  if (productId) meta.productId = productId;
  sessionStorage.setItem(SSO_META_KEY, JSON.stringify(meta));
}

export function getFocoToken(): string | null {
  return sessionStorage.getItem(SSO_TOKEN_KEY);
}

export function getFocoMeta(): FocoMeta {
  try {
    return JSON.parse(sessionStorage.getItem(SSO_META_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function isFocoSession(): boolean {
  return !!getFocoToken();
}

export type FocoWebhookPayload = {
  report?: string;
  strategies?: string[];
  resultUrl?: string;
  extraData?: Record<string, unknown>;
};

export async function notifyFoco(payload: FocoWebhookPayload): Promise<void> {
  const ssoToken = getFocoToken();
  if (!ssoToken) return;

  await fetch("/api/foco360/complete", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ssoToken, ...payload }),
  });
}
