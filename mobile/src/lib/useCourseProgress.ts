import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getCourseProgress, toggleModuleComplete } from "@/src/lib/courseProgress";

export function useCourseProgress(courseSlug: string) {
  const [completed, setCompleted] = useState<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getCourseProgress(courseSlug).then((c) => active && setCompleted(c));
      return () => {
        active = false;
      };
    }, [courseSlug])
  );

  const toggle = useCallback(
    async (day: number) => {
      setCompleted(await toggleModuleComplete(courseSlug, day));
    },
    [courseSlug]
  );

  return {
    completed,
    toggle,
    isComplete: (day: number) => completed.includes(day),
  };
}
