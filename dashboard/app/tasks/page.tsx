"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import { fetchViewSummary } from "@/lib/client-api";
import { TasksClient } from "@/components/TasksClient";
import { NoProject } from "@/components/NoProject";

export default function TasksPage() {
  const { data, loading, projectMissing } = useAnalytics(fetchViewSummary, []);
  if (projectMissing) return <NoProject />;
  if (loading) return <div className="h-64 rounded-lg bg-gray-200 dark:bg-[#1c1c1f] animate-pulse" />;
  return <TasksClient intents={data} />;
}
