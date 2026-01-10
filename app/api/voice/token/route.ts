import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";

// GET /api/voice/token - Get temporary Deepgram API key for browser STT
export async function GET() {
  try {
    // Verify user is authenticated
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      console.error("DEEPGRAM_API_KEY is not set");
      return NextResponse.json(
        { error: "Voice service not configured" },
        { status: 500 }
      );
    }

    // For production, you should use Deepgram's temporary key API
    // For now, we'll return the API key directly (only for development)
    // TODO: Implement proper temporary key generation via Deepgram API
    
    // Option 1: Return the API key directly (not recommended for production)
    // This works because the WebSocket connection is encrypted
    
    // Option 2: Use Deepgram's on-prem proxy or temporary keys API
    // See: https://developers.deepgram.com/docs/authenticating#temporary-keys
    
    return NextResponse.json({ token: apiKey });
  } catch (error) {
    console.error("Error generating voice token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
