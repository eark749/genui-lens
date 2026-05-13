"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { listProjects, createProject } from "@/lib/lens-api";
import { useProject } from "@/context/ProjectContext";
import type { Project } from "@/lib/lens-api";

export default function ProjectsPage() {
  const router = useRouter();
  const { setProject } = useProject();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [newKeyInfo, setNewKeyInfo] = useState<{ key: string; name: string } | null>(null);

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  async function load() {
    const token = await getToken();
    if (!token) { router.push("/login"); return; }
    try {
      setProjects(await listProjects(token));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) { router.push("/login"); return; }
      const result = await createProject(token, newName.trim());
      setProjects((p) => [...p, result.project]);
      setNewKeyInfo({ key: result.api_key.key, name: result.project.name });
      setNewName("");
      setShowCreate(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b]">
      {/* Header */}
      <nav className="bg-white dark:bg-[#111113] border-b border-gray-200 dark:border-[#27272a] px-6 py-3 flex items-center gap-4">
        <span className="font-semibold text-gray-900 dark:text-zinc-100 mr-auto">⬡ GenUI Lens</span>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-500 dark:text-zinc-500 hover:text-gray-800 dark:hover:text-zinc-200 transition-colors"
        >
          Sign out
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Projects</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">Each project gets its own API key for the SDK.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            New project
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* New key reveal modal */}
        {newKeyInfo && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-[#111113] rounded-xl border border-gray-200 dark:border-[#27272a] p-6 w-full max-w-md shadow-xl">
              <h2 className="font-semibold text-gray-900 dark:text-zinc-100 mb-1">Project created!</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-500 mb-4">
                Save this API key — it won&apos;t be shown again.
              </p>
              <div className="bg-gray-50 dark:bg-[#09090b] rounded-lg border border-gray-200 dark:border-[#27272a] p-3 mb-4">
                <p className="text-xs text-gray-500 dark:text-zinc-500 mb-1">API Key for &ldquo;{newKeyInfo.name}&rdquo;</p>
                <code className="text-sm font-mono text-gray-900 dark:text-zinc-100 break-all">{newKeyInfo.key}</code>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(newKeyInfo.key); }}
                className="w-full mb-2 py-2 rounded-lg border border-gray-300 dark:border-[#27272a] text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-[#1c1c1f] transition-colors"
              >
                Copy to clipboard
              </button>
              <button
                onClick={() => setNewKeyInfo(null)}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Create project modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-[#111113] rounded-xl border border-gray-200 dark:border-[#27272a] p-6 w-full max-w-sm shadow-xl">
              <h2 className="font-semibold text-gray-900 dark:text-zinc-100 mb-4">New project</h2>
              <form onSubmit={handleCreate} className="space-y-3">
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Project name"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-[#27272a] bg-white dark:bg-[#09090b] text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowCreate(false); setNewName(""); }}
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

        {/* Projects list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-gray-200 dark:bg-[#1c1c1f] animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-zinc-600">
            <p className="text-4xl mb-3">⬡</p>
            <p className="text-sm">No projects yet. Create one to get your first API key.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-[#111113] rounded-xl border border-gray-200 dark:border-[#27272a] p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-zinc-100">{p.name}</h3>
                    <p className="text-xs text-gray-400 dark:text-zinc-600 mt-0.5">
                      {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/projects/${p.id}`}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#27272a] text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-[#1c1c1f] transition-colors"
                    >
                      API Keys
                    </Link>
                    <button
                      onClick={() => { setProject({ id: p.id, name: p.name }); router.push("/"); }}
                      className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                    >
                      Open dashboard →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
