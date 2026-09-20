import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";

export const metadata: Metadata = {
  title: "Relax & Unwind — LofiBuddha",
  description:
    "Guided relaxation and calming soundscapes to unwind and release stress.",
};

export default function RelaxCategoryPage() {
  return <CategoryPage category="relax" />;
}
