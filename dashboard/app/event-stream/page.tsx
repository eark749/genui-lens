"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import { fetchEvents } from "@/lib/client-api";
import { EventStreamClient } from "@/components/EventStreamClient";
import { NoProject } from "@/components/NoProject";

export default function EventStreamPage() {
  const { data, loading, projectMissing } = useAnalytics(
    (token, projectId) => fetchEvents(token, projectId, 100),
    []
  );
  if (projectMissing) return <NoProject />;
  if (loading) return <div className="h-64 rounded-lg bg-gray-200 dark:bg-[#1c1c1f] animate-pulse" />;
  return <EventStreamClient initialEvents={data} />;
}
