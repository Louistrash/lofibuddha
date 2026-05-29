import { NextRequest, NextResponse } from "next/server";

// ── Types ──

export interface Lesson {
  id: string;
  title: string;
  content?: string;
  duration: string;
  type: "video" | "text" | "quiz" | "worksheet";
  status: "draft" | "generated";
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  topic: string;
  audience: string;
  level: "beginner" | "intermediate" | "advanced";
  goal: string;
  moduleCount: number;
  tone: string;
  language: string;
  modules: Module[];
  createdAt: string;
  updatedAt: string;
}

// In-memory store (replace with DB later)
const store = new Map<string, Course>();

// ── Utility ──

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateModuleLessons(moduleTitle: string, moduleIndex: number): Lesson[] {
  const lessonTypes: Lesson["type"][] = ["video", "text", "quiz", "worksheet"];
  return [
    {
      id: generateId(),
      title: `${moduleTitle} — Introduction & Overview`,
      duration: "10 min",
      type: "video",
      status: "draft",
    },
    {
      id: generateId(),
      title: `${moduleTitle} — Core Concepts & Theory`,
      duration: "20 min",
      type: "text",
      status: "draft",
    },
    {
      id: generateId(),
      title: `${moduleTitle} — Practical Exercise`,
      duration: "15 min",
      type: "worksheet",
      status: "draft",
    },
    {
      id: generateId(),
      title: `${moduleTitle} — Knowledge Check`,
      duration: "10 min",
      type: "quiz",
      status: "draft",
    },
  ];
}

// ── API Handlers ──

export async function GET() {
  const courses = Array.from(store.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ courses });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { topic, audience, level, goal, moduleCount, tone, language } = body;

  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  const courseId = generateId();
  const numModules = Math.min(Math.max(moduleCount || 4, 2), 12);
  const now = new Date().toISOString();

  // Generate module names based on topic
  const moduleTemplates = [
    "Foundations & Core Principles",
    "Essential Techniques & Methods",
    "Practical Applications",
    "Advanced Strategies",
    "Common Challenges & Solutions",
    "Integration & Practice",
    "Real-World Case Studies",
    "Building Your Practice",
    "Mastery & Next Steps",
    "Tools & Resources",
    "Mindset & Philosophy",
    "Review & Certification Prep",
  ];

  const modules: Module[] = [];
  for (let i = 0; i < numModules; i++) {
    const title = `Module ${i + 1}: ${moduleTemplates[i % moduleTemplates.length]}`;
    modules.push({
      id: generateId(),
      title,
      description: `Deep dive into ${topic} — ${title.toLowerCase()}`,
      lessons: generateModuleLessons(title, i),
      order: i + 1,
    });
  }

  const course: Course = {
    id: courseId,
    title: `${topic}: Complete ${level} Course`,
    description: `A comprehensive ${level}-level course on ${topic} for ${audience}. ${goal}`,
    topic,
    audience,
    level: level || "beginner",
    goal: goal || `Master ${topic}`,
    moduleCount: numModules,
    tone: tone || "professional",
    language: language || "en",
    modules,
    createdAt: now,
    updatedAt: now,
  };

  store.set(courseId, course);

  return NextResponse.json({ course }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id || !store.has(id)) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const existing = store.get(id)!;
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  store.set(id, updated);

  return NextResponse.json({ course: updated });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id || !store.has(id)) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }
  store.delete(id);
  return NextResponse.json({ success: true });
}
