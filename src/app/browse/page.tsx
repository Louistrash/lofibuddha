import { redirect } from "next/navigation";

// Browse bestond niet — alle bestaande links (landing, zen-tier, drip-emails)
// wijzen nu naar het mindfulness ecosysteem.
export default function BrowseRedirect() {
  redirect("/mindfulness");
}
