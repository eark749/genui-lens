import { getComponentSummary } from "@/lib/api";
import { UIElementsClient } from "@/components/UIElementsClient";

export const revalidate = 0;

export default async function UIElementsPage() {
  const components = await getComponentSummary();
  return <UIElementsClient components={components} />;
}
