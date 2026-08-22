import { redirect } from "next/navigation";

// Oude losse pagina → ecosysteem: /focus is nu /mindfulness/focus
export default function OldFocusPage() {
  redirect("/mindfulness/focus");
}
