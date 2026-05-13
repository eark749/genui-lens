// Authenticated calls to GenUI Lens backend (JWT auth — dashboard users)
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

async function request(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`${BACKEND}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Backend ${res.status} on ${path}`);
  }
  return res.json();
}

export interface Project {
  id: string;
  name: string;
  created_at: string;
}

export interface ApiKeyMeta {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
}

// ── Projects ──────────────────────────────────────────────────────────────────

export async function listProjects(token: string): Promise<Project[]> {
  const data = await request("/v1/projects", token);
  return data.projects ?? [];
}

export async function createProject(token: string, name: string): Promise<{ project: Project; api_key: ApiKeyMeta & { key: string } }> {
  return request("/v1/projects", token, { method: "POST", body: JSON.stringify({ name }) });
}

export async function getProject(token: string, projectId: string): Promise<{ project: Project; api_keys: ApiKeyMeta[] }> {
  return request(`/v1/projects/${projectId}`, token);
}

// ── API Keys ──────────────────────────────────────────────────────────────────

export async function createApiKey(token: string, projectId: string, name: string): Promise<ApiKeyMeta & { key: string }> {
  return request(`/v1/projects/${projectId}/api-keys`, token, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function revokeApiKey(token: string, projectId: string, keyId: string): Promise<void> {
  await request(`/v1/projects/${projectId}/api-keys/${keyId}`, token, { method: "DELETE" });
}

// ── Register ──────────────────────────────────────────────────────────────────

export async function register(token: string, name?: string): Promise<void> {
  await request("/v1/auth/register", token, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}
