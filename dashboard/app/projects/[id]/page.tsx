"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getProject, createApiKey, revokeApiKey } from "@/lib/lens-api";
import type { Project, ApiKeyMeta } from "@/lib/lens-api";

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeyMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<{ key: string; name: string } | null>(null);

  const [revoking, setRevoking] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<ApiKeyMeta | null>(null);

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  async function load() {
    const token = await getToken();
    if (!token) { router.push("/login"); return; }
    try {
      const data = await getProject(token, id);
      setProject(data.project);
      setApiKeys(data.api_keys);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) { router.push("/login"); return; }
      const result = await createApiKey(token, id, newKeyName.trim());
      setApiKeys((k) => [...k, { id: result.id, name: result.name, prefix: result.prefix, created_at: result.created_at }]);
      setRevealedKey({ key: result.key, name: result.name });
      setNewKeyName("");
      setShowCreate(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(keyMeta: ApiKeyMeta) {
    setRevoking(keyMeta.id);
    setError(null);
    try {
      const token = await getToken();
      if (!token) { router.push("/login"); return; }
      await revokeApiKey(token, id, keyMeta.id);
      setApiKeys((k) => k.filter((x) => x.id !== keyMeta.id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to revoke key");
    } finally {
      setRevoking(null);
      setConfirmRevoke(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b]">
      {/* Header */}
      <nav className="bg-white dark:bg-[#111113] border-b border-gray-200 dark:border-[#27272a] px-6 py-3 flex items-center gap-4">
        <Link href="/projects" className="text-sm text-gray-500 dark:text-zinc-500 hover:text-gray-800 dark:hover:text-zinc-200 transition-colors flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Projects
        </Link>
        <span className="text-gray-300 dark:text-zinc-700">/</span>
        <span className="text-sm text-gray-900 dark:text-zinc-100 font-medium">
          {project?.name ?? "..."}
        </span>
        <span className="ml-auto font-semibold text-gray-900 dark:text-zinc-100">⬡ GenUI Lens</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-200 dark:bg-[#1c1c1f] animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Project info */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{project?.name}</h1>
              <p className="text-xs text-gray-400 dark:text-zinc-600 mt-1">ID: {project?.id}</p>
            </div>

            {/* API Keys section */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">API Keys</h2>
                <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">Use these keys in the SDK <code className="bg-gray-100 dark:bg-[#1c1c1f] px-1 rounded">init({"{"} apiKey {"}"}).</code></p>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                New key
              </button>
            </div>

            {apiKeys.length === 0 ? (
              <div className="text-center py-10 text-gray-400 dark:text-zinc-600 bg-white dark:bg-[#111113] rounded-xl border border-gray-200 dark:border-[#27272a]">
                <p className="text-sm">No active API keys.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {apiKeys.map((k) => (
                  <div
                    key={k.id}
                    className="bg-white dark:bg-[#111113] rounded-xl border border-gray-200 dark:border-[#27272a] px-5 py-4 flex items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{k.name}</p>
                      <p className="text-xs text-gray-400 dark:text-zinc-600 mt-0.5 font-mono">
                        {k.prefix}••••••••••••••••••••••
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-zinc-600 shrink-0">
                      {new Date(k.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <button
                      onClick={() => setConfirmRevoke(k)}
                      disabled={revoking === k.id}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-40 shrink-0"
                    >
                      {revoking === k.id ? "Revoking..." : "Revoke"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Docs hint */}
            <div className="mt-8 p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10">
              <p className="text-sm text-blue-700 dark:text-blue-400 font-medium mb-1">Quick start</p>
              <pre className="text-xs text-blue-600 dark:text-blue-300 font-mono whitespace-pre-wrap">
{`npm install @genui-lens/sdk

import { init } from '@genui-lens/sdk';
init({ apiKey: 'lens_...' });`}
              </pre>
            </div>
          </>
        )}
      </div>

      {/* Create key modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-[#111113] rounded-xl border border-gray-200 dark:border-[#27272a] p-6 w-full max-w-sm shadow-xl">
            <h2 className="font-semibold text-gray-900 dark:text-zinc-100 mb-4">New API key</h2>
            <form onSubmit={handleCreateKey} className="space-y-3">
              <input
                autoFocus
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key name (e.g. Production)"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-[#27272a] bg-white dark:bg-[#09090b] text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setNewKeyName(""); }}
                  className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-[#27272a] text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-[#1c1c1f] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reveal key modal */}
      {revealedKey && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-[#111113] rounded-xl border border-gray-200 dark:border-[#27272a] p-6 w-full max-w-md shadow-xl">
            <h2 className="font-semibold text-gray-900 dark:text-zinc-100 mb-1">API key created</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-500 mb-4">
              Save this now — it won&apos;t be shown again.
            </p>
            <div className="bg-gray-50 dark:bg-[#09090b] rounded-lg border border-gray-200 dark:border-[#27272a] p-3 mb-4">
              <p className="text-xs text-gray-500 dark:text-zinc-500 mb-1">{revealedKey.name}</p>
              <code className="text-sm font-mono text-gray-900 dark:text-zinc-100 break-all">{revealedKey.key}</code>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(revealedKey.key)}
              className="w-full mb-2 py-2 rounded-lg border border-gray-300 dark:border-[#27272a] text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-[#1c1c1f] transition-colors"
            >
              Copy to clipboard
            </button>
            <button
              onClick={() => setRevealedKey(null)}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Confirm revoke modal */}
      {confirmRevoke && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-[#111113] rounded-xl border border-gray-200 dark:border-[#27272a] p-6 w-full max-w-sm shadow-xl">
            <h2 className="font-semibold text-gray-900 dark:text-zinc-100 mb-2">Revoke key?</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-500 mb-4">
              <strong className="text-gray-800 dark:text-zinc-200">{confirmRevoke.name}</strong> ({confirmRevoke.prefix}••••) will stop working immediately. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmRevoke(null)}
                className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-[#27272a] text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-[#1c1c1f] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRevoke(confirmRevoke)}
                disabled={!!revoking}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {revoking ? "Revoking..." : "Revoke"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
