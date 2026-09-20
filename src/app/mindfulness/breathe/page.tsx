import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";

export const metadata: Metadata = {
  title: "Breathing Exercises — LofiBuddha",
  description:
    "Guided breathing exercises and breathwork to calm your mind and body.",
};

export default function BreatheCategoryPage() {
  return <CategoryPage category="breathe" />;
}
