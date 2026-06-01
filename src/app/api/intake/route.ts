import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json");
const INTAKE_FILE = path.join(process.cwd(), "data", "intake-responses.json");

interface IntakeResponse {
  email: string;
  submittedAt: string;
  // Core questions
  spiritualGoal: string;       // What brings you to this path?
  currentPractice: string;     // Current meditation/mindfulness experience
  emotionalState: string;      // How are you feeling lately?
  challenges: string;          // What challenges are you facing?
  intentions: string;          // What do you hope to cultivate?
  // Preferences
  meditationStyle: string;     // guided | silent | breathwork | body-scan | mixed
  timeOfDay: string;           // morning | afternoon | evening | flexible
  sessionLength: string;       // 5min | 10min | 20min | 30min+
  focusAreas: string[];        // stress | sleep | focus | creativity | grief | purpose | connection
  language: string;            // en | nl
  // AI-generated (filled after submission)
  roadmapGenerated?: boolean;
  roadmapUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    // Verify subscriber exists and is on Enlightened tier
    let subscribers: any[] = [];
    try {
      if (fs.existsSync(SUBSCRIBERS_FILE)) {
        subscribers = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf-8"));
      }
    } catch {}

    const subscriber = subscribers.find((s: any) => s.email === email);
    if (!subscriber) {
      return NextResponse.json(
        { error: "No subscription found for this email" },
        { status: 404 }
      );
    }

    if (subscriber.tier !== "enlightened") {
      return NextResponse.json(
        { error: "Intake form is only available for Enlightened Path subscribers" },
        { status: 403 }
      );
    }

    // Build intake response
    const intake: IntakeResponse = {
      email,
      submittedAt: new Date().toISOString(),
      spiritualGoal: body.spiritualGoal || "",
      currentPractice: body.currentPractice || "",
      emotionalState: body.emotionalState || "",
      challenges: body.challenges || "",
      intentions: body.intentions || "",
      meditationStyle: body.meditationStyle || "mixed",
      timeOfDay: body.timeOfDay || "flexible",
      sessionLength: body.sessionLength || "10min",
      focusAreas: body.focusAreas || [],
      language: body.language || subscriber.language || "en",
    };

    // Save intake
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let intakes: IntakeResponse[] = [];
    try {
      if (fs.existsSync(INTAKE_FILE)) {
        intakes = JSON.parse(fs.readFileSync(INTAKE_FILE, "utf-8"));
      }
    } catch {}

    // Upsert
    const idx = intakes.findIndex((i) => i.email === email);
    if (idx >= 0) {
      intakes[idx] = intake;
    } else {
      intakes.push(intake);
    }

    fs.writeFileSync(INTAKE_FILE, JSON.stringify(intakes, null, 2));

    // Update subscriber record
    subscriber.intakeCompleted = true;
    subscriber.meditationStyle = intake.meditationStyle;
    subscriber.focusAreas = intake.focusAreas;
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));

    return NextResponse.json({
      success: true,
      message: "Intake submitted. Your personalized roadmap is being generated.",
      intake,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET — retrieve existing intake
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "email parameter required" }, { status: 400 });
  }

  try {
    if (!fs.existsSync(INTAKE_FILE)) {
      return NextResponse.json({ intake: null });
    }

    const intakes: IntakeResponse[] = JSON.parse(
      fs.readFileSync(INTAKE_FILE, "utf-8")
    );
    const intake = intakes.find((i) => i.email === email);

    return NextResponse.json({ intake: intake || null });
  } catch {
    return NextResponse.json({ intake: null });
  }
}
