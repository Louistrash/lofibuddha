import { join } from "path";

// Resolve the project root regardless of whether we run in dev (cwd = project root)
// or in production standalone mode (cwd = <root>/.next/standalone).
export function getProjectRoot(): string {
  const cwd = process.cwd();
  const normalized = cwd.replace(/\\/g, "/");
  if (normalized.endsWith("/.next/standalone")) {
    return join(cwd, "..", "..");
  }
  return cwd;
}

// Persistent audio file storage (survives redeploys).
export function getMusicFilesDir(): string {
  return join(getProjectRoot(), "data", "music", "files");
}

// Persistent track metadata storage.
export function getMusicDataDir(): string {
  return join(getProjectRoot(), "data", "music");
}
