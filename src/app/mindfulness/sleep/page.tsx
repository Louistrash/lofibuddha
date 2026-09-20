import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";

export const metadata: Metadata = {
  title: "Sleep & Rest — LofiBuddha",
  description:
    "Guided sleep meditations and soothing soundscapes for deep, restful sleep.",
};

export default function SleepCategoryPage() {
  return <CategoryPage category="sleep" />;
}
