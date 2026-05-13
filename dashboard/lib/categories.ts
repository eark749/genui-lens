export type Category = "Action" | "Input" | "Display";

const MAP: Record<string, Category> = {
  button: "Action",
  buttongroup: "Action",
  submitbutton: "Action",
  iconbutton: "Action",
  form: "Input",
  formcontrol: "Input",
  datepicker: "Input",
  textinput: "Input",
  select: "Input",
  checkbox: "Input",
  radio: "Input",
  toggle: "Input",
  slider: "Input",
  textarea: "Input",
  searchinput: "Input",
};

export function getCategory(componentId: string): Category {
  return MAP[componentId.toLowerCase()] ?? "Display";
}

export function cleanIntent(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/\[&quot;.*$/i, "")
    .replace(/\[".*$/i, "")
    .trim()
    .slice(0, 120) || "—";
}

export function isDirtyIntent(raw: string): boolean {
  return raw.startsWith("<") || raw.includes("&quot;") || raw.includes('["');
}
