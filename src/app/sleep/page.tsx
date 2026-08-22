import { redirect } from "next/navigation";

// Oude losse pagina → ecosysteem: /sleep is nu /mindfulness/sleep
export default function OldSleepPage() {
  redirect("/mindfulness/sleep");
}
