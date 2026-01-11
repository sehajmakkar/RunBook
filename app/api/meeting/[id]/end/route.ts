import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import {
  generateMeetingSummary,
  type ConversationMessage,
} from "@/lib/ai/meeting-agent";

// POST /api/meeting/[id]/end - End a meeting and generate summary
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseUser = await getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      include: {
        goals: {
          where: { status: "ACTIVE" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Verify ownership
    if (meeting.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if meeting is already completed
    if (meeting.status === "COMPLETED") {
      return NextResponse.json(meeting);
    }

    const body = await request.json();
    const { transcript } = body;

    // Calculate duration
    const endedAt = new Date();
    const durationMs = endedAt.getTime() - meeting.startedAt.getTime();

    // Convert transcript to ConversationMessage format
    const conversationHistory: ConversationMessage[] = (transcript || []).map(
      (entry: { role: string; content: string; timestamp?: number }) => ({
        role: entry.role as "user" | "ai",
        content: entry.content,
        timestamp: entry.timestamp || Date.now(),
      })
    );

    // Generate AI summary
    let summary: string;
    let observations: {
      patterns: string[];
      risks: string[];
      improvements: string[];
    };

    try {
      const summaryResult = await generateMeetingSummary({
        userName: user.name || user.email.split("@")[0],
        commitments: user.goals.map((g) => ({
          id: g.id,
          title: g.title,
          type: g.type as "DAILY" | "WEEKLY" | "MONTHLY",
          priority: g.priority as "DEFAULT" | "LOW" | "HIGH" | "URGENT",
          status: g.status as "ACTIVE" | "COMPLETED" | "ABANDONED",
          completedAt: g.completedAt,
        })),
        conversationHistory,
        currentPhase: "CLOSING",
        meetingStartTime: meeting.startedAt.getTime(),
      });

      summary = summaryResult.summary;
      observations = summaryResult.observations;
    } catch (err) {
      console.error("Error generating AI summary:", err);
      // Fallback to placeholder
      summary = generatePlaceholderSummary(transcript, user.name);
      observations = { patterns: [], risks: [], improvements: [] };
    }

    // Update meeting with completion data
    const completedMeeting = await prisma.meeting.update({
      where: { id },
      data: {
        status: "COMPLETED",
        phase: "CLOSING",
        endedAt,
        durationMs,
        transcript: transcript || meeting.transcript,
        summary,
        observations,
      },
    });

    return NextResponse.json(completedMeeting);
  } catch (error) {
    console.error("Error ending meeting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Placeholder summary generator (fallback if AI fails)
function generatePlaceholderSummary(
  transcript: Array<{ role: string; content: string }> | null,
  userName: string | null
): string {
  const entryCount = transcript?.length || 0;
  const name = userName?.split(" ")[0] || "User";

  if (entryCount === 0) {
    return `Meeting with ${name} completed. No transcript available.`;
  }

  return `Accountability check-in with ${name} completed. ${entryCount} exchanges recorded. Review your commitments and follow through on discussed action items.`;
}
