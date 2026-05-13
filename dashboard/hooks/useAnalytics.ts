"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useProject } from "@/context/ProjectContext";

export function useToken() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setToken(session?.access_token ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  return token;
}

export function useAnalytics<T>(
  fetcher: (token: string, projectId: string) => Promise<T>,
  defaultValue: T,
): { data: T; loading: boolean; error: string | null; projectMissing: boolean } {
  const { project } = useProject();
  const token = useToken();
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!project || !token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetcher(token, project.id)
      .then((result) => { setData(result); setLoading(false); })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load");
        setLoading(false);
      });
  }, [project, token]);

  return { data, loading, error, projectMissing: !project };
}
