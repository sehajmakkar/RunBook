/**
 * Chat API Route
 *
 * Handles AI conversation during meetings.
 * POST /api/chat - Generate AI response to user message
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import {
  generateMeetingResponse,
  generateOpeningMessage,
  type MeetingContext,
  type Commitment,
  type ConversationMessage,
  type MeetingPhase,
} from "@/lib/ai/meeting-agent";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ChatRequest {
  meetingId: string;
  message?: string;
  action?: "start" | "respond";
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      include: {
        goals: {
          where: { status: "ACTIVE" },
          orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body: ChatRequest = await request.json();
    const { meetingId, message, action = "respond" } = body;

    // Validate meeting exists and belongs to user
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        userId: user.id,
        status: "IN_PROGRESS",
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found or not in progress" },
        { status: 404 }
      );
    }

    // Get previous meeting for context (optional)
    const previousMeeting = await prisma.meeting.findFirst({
      where: {
        userId: user.id,
        status: "COMPLETED",
        id: { not: meetingId },
      },
      orderBy: { endedAt: "desc" },
      select: { summary: true },
    });

    // Convert goals to commitments format
    const commitments: Commitment[] = user.goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      type: goal.type as "DAILY" | "WEEKLY" | "MONTHLY",
      priority: goal.priority as "DEFAULT" | "LOW" | "HIGH" | "URGENT",
      status: goal.status as "ACTIVE" | "COMPLETED" | "ABANDONED",
      completedAt: goal.completedAt,
    }));

    // Parse existing transcript - handle Prisma JSON type
    const rawTranscript = meeting.transcript as unknown;
    const existingTranscript: ConversationMessage[] = Array.isArray(
      rawTranscript
    )
      ? rawTranscript.map((entry: Record<string, unknown>) => ({
          role: entry.role as "user" | "ai",
          content: entry.content as string,
          timestamp: (entry.timestamp as number) || Date.now(),
        }))
      : [];

    // Build meeting context
    const context: MeetingContext = {
      userName: user.name || user.email.split("@")[0],
      commitments,
      conversationHistory: existingTranscript,
      currentPhase: meeting.phase as MeetingPhase,
      meetingStartTime: meeting.startedAt.getTime(),
      previousMeetingSummary: previousMeeting?.summary,
    };

    let aiResponse: string;
    let nextPhase: MeetingPhase | undefined;
    let shouldEndMeeting = false;

    if (action === "start") {
      // Generate opening message
      aiResponse = await generateOpeningMessage(context);
      nextPhase = "PROGRESS_REVIEW";
    } else {
      // Generate response to user message
      if (!message) {
        return NextResponse.json(
          { error: "Message is required for respond action" },
          { status: 400 }
        );
      }

      const response = await generateMeetingResponse(message, context);
      aiResponse = response.content;
      nextPhase = response.nextPhase;
      shouldEndMeeting = response.shouldEndMeeting || false;

      // Add user message to transcript
      existingTranscript.push({
        role: "user",
        content: message,
        timestamp: Date.now(),
      });
    }

    // Add AI response to transcript
    existingTranscript.push({
      role: "ai",
      content: aiResponse,
      timestamp: Date.now(),
    });

    // Convert to JSON-serializable format for Prisma
    const transcriptForDb = existingTranscript.map((entry) => ({
      role: entry.role,
      content: entry.content,
      timestamp: entry.timestamp,
    }));

    // Update meeting in database
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        transcript: transcriptForDb,
        phase: nextPhase || meeting.phase,
      },
    });

    return NextResponse.json({
      response: aiResponse,
      phase: nextPhase || meeting.phase,
      shouldEndMeeting,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "AI service configuration error" },
          { status: 500 }
        );
      }
      if (
        error.message.includes("rate limit") ||
        error.message.includes("quota")
      ) {
        return NextResponse.json(
          { error: "AI service temporarily unavailable. Please try again." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
