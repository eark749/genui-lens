"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import { fetchComponentSummary } from "@/lib/client-api";
import { UIElementsClient } from "@/components/UIElementsClient";
import { NoProject } from "@/components/NoProject";

export default function UIElementsPage() {
  const { data, loading, projectMissing } = useAnalytics(fetchComponentSummary, []);
  if (projectMissing) return <NoProject />;
  if (loading) return <div className="h-64 rounded-lg bg-gray-200 dark:bg-[#1c1c1f] animate-pulse" />;
  return <UIElementsClient components={data} />;
}
