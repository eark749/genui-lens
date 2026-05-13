import { getViewSummary } from "@/lib/api";
import { TasksClient } from "@/components/TasksClient";

export const revalidate = 0;

export default async function TasksPage() {
  const intents = await getViewSummary();
  return <TasksClient intents={intents} />;
}
