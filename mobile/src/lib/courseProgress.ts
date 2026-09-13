import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "lofibuddha_course_progress";

// Progress map: { [courseSlug]: number[] } — de voltooide les-dagen per course.
type ProgressMap = Record<string, number[]>;

async function readMap(): Promise<ProgressMap> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function getCourseProgress(courseSlug: string): Promise<number[]> {
  const map = await readMap();
  return map[courseSlug] || [];
}

export async function toggleModuleComplete(courseSlug: string, day: number): Promise<number[]> {
  const map = await readMap();
  const current = map[courseSlug] || [];
  const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
  map[courseSlug] = next;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // Voortgang verliezen is niet erg genoeg om playback te onderbreken.
  }
  return next;
}
