import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";

export const metadata: Metadata = {
  title: "Focus & Concentration — LofiBuddha",
  description:
    "Guided meditations and lofi soundscapes to sharpen focus and concentration.",
};

export default function FocusCategoryPage() {
  return <CategoryPage category="focus" />;
}
