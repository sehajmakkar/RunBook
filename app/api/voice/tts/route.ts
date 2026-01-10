import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";

// POST /api/voice/tts - Convert text to speech using Deepgram Aura
export async function POST(request: NextRequest) {
  console.log("[TTS API] Request received");
  
  try {
    // Verify user is authenticated
    const user = await getUser();
    if (!user) {
      console.log("[TTS API] Unauthorized - no user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { text, voice } = body;
    console.log("[TTS API] Text:", text?.substring(0, 50) + "...", "Voice:", voice);

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Limit text length to prevent abuse
    if (text.length > 1000) {
      return NextResponse.json(
        { error: "Text too long (max 1000 characters)" },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Deepgram API key not configured" },
        { status: 500 }
      );
    }

    const model = voice || "aura-asteria-en";

    // Call Deepgram TTS API directly with fetch
    const deepgramResponse = await fetch(
      `https://api.deepgram.com/v1/speak?model=${model}&encoding=mp3`,
      {
        method: "POST",
        headers: {
          "Authorization": `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!deepgramResponse.ok) {
      const errorText = await deepgramResponse.text();
      console.error("Deepgram TTS error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate speech" },
        { status: 500 }
      );
    }

    // Get audio as ArrayBuffer
    const audioBuffer = await deepgramResponse.arrayBuffer();
    console.log("[TTS API] Received audio from Deepgram:", audioBuffer.byteLength, "bytes");

    // Return MP3 audio data
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
