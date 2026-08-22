import { redirect } from "next/navigation";

// Oude losse pagina → ecosysteem: /breathe is nu /mindfulness/breathe
export default function OldBreathePage() {
  redirect("/mindfulness/breathe");
}
