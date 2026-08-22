import { redirect } from "next/navigation";

// De landing is nu de home-pagina (/) — /landing verwijst door.
export default function LandingRedirect() {
  redirect("/");
}
