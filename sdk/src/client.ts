import type { LensConfig } from "./types";

let _config: LensConfig | null = null;

export function setConfig(config: LensConfig): void {
  _config = config;
}

export function getConfig(): LensConfig {
  if (!_config) throw new Error("[GenUI Lens] Call init() before using the SDK");
  return _config;
}

export async function post(path: string, body: unknown): Promise<unknown> {
  const config = getConfig();
  try {
    const res = await fetch(`${config.endpoint}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`[GenUI Lens] ${path} → ${res.status} ${res.statusText}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error("[GenUI Lens] Network error:", err);
    return null;
  }
}
