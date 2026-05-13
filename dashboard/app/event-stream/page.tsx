import { getEvents } from "@/lib/api";
import { EventStreamClient } from "@/components/EventStreamClient";

export const revalidate = 0;

export default async function EventStreamPage() {
  const events = await getEvents(100);
  return <EventStreamClient initialEvents={events} />;
}
