import { NextRequest, NextResponse } from 'next/server';
import { uploadToYouTube } from '@/lib/youtube-upload';

export async function POST(request: NextRequest) {
  try {
    const { videoPath, title, description, tags } = await request.json();
    const result = await uploadToYouTube({ videoPath, title, description, tags });
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      videoId: result.videoId,
      url: result.url,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
