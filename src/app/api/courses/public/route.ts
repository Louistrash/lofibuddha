import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

const DB = join(process.cwd(), "public", "data", "courses.json");

export async function GET(request: NextRequest) {
  try {
    const raw = await readFile(DB, "utf-8");
    const data = JSON.parse(raw);
    
    // Get language from query param, default to "en"
    const url = new URL(request.url);
    const lang = url.searchParams.get("lang") || "en";
    const slug = url.searchParams.get("slug");

    // If a specific course is requested
    if (slug) {
      const course = data.courses.find((c: any) => c.slug === slug);
      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
      
      // Get translation for requested language, fall back to English
      const translation = course.translations[lang] || course.translations["en"];
      
      return NextResponse.json({
        ...course,
        ...translation,
        availableLanguages: Object.keys(course.translations),
      });
    }

    // Return all courses with language-specific content
    const courses = data.courses.map((c: any) => {
      const t = c.translations[lang] || c.translations["en"];
      return {
        id: c.id,
        slug: c.slug,
        level: c.level,
        duration: c.duration,
        image: c.image,
        title: t.title,
        subtitle: t.subtitle,
        description: t.description,
        moduleCount: t.modules?.length || 0,
        availableLanguages: Object.keys(c.translations),
      };
    });

    return NextResponse.json({ courses, language: lang });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
