import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate type
    const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: PNG, JPEG, GIF, WebP, SVG" }, { status: 400 });
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 10MB" }, { status: 400 });
    }

    // Sanitize folder name
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
    const uploadDir = join(process.cwd(), "public", "images", safeFolder);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const ext = file.name.split(".").pop() || "png";
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${timestamp}-${safeName}`;
    const filePath = join(uploadDir, filename);

    // Write file
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const url = `/images/${safeFolder}/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      name: filename,
      size: file.size,
      type: file.type,
    });
  } catch (err: any) {
    console.error("[Image Upload]", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
