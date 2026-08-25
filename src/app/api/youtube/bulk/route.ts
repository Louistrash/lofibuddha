import { NextRequest, NextResponse } from 'next/server';
import { uploadToYouTube, UploadInput } from '@/lib/youtube-upload';

// Mini-bulk upload: ontvangt een array van { videoPath, title, description, tags }
// en uploadt ze sequentieel. Retourneert per video het resultaat (incl. url of error).
export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items array required' }, { status: 400 });
    }

    const results = [];
    for (const item of items as UploadInput[]) {
      const r = await uploadToYouTube(item);
      results.push({ videoPath: item.videoPath, ...r });
    }

    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
