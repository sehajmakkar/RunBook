/**
 * AI Meeting Agent
 *
 * Core conversation logic for the AI Manager Meeting.
 * Implements meeting phases, behavioral rules, and response generation.
 */

import { generateResponse, generateExtendedResponse } from "./gemini";

// ===========================================
// Types
// ===========================================

export type MeetingPhase =
  | "OPENING"
  | "PROGRESS_REVIEW"
  | "BLOCKER_DISCUSSION"
  | "CONFRONTATION"
  | "COMMITMENT_LOCK_IN"
  | "CLOSING";

export interface Commitment {
  id: string;
  title: string;
  type: "DAILY" | "WEEKLY" | "MONTHLY";
  priority: "DEFAULT" | "LOW" | "HIGH" | "URGENT";
  status: "ACTIVE" | "COMPLETED" | "ABANDONED";
  completedAt?: Date | null;
}

export interface ConversationMessage {
  role: "user" | "ai";
  content: string;
  timestamp: number;
}

export interface MeetingContext {
  userName: string;
  commitments: Commitment[];
  conversationHistory: ConversationMessage[];
  currentPhase: MeetingPhase;
  meetingStartTime: number;
  previousMeetingSummary?: string | null;
  detectedPatterns?: string[];
}

export interface AgentResponse {
  content: string;
  nextPhase?: MeetingPhase;
  shouldEndMeeting?: boolean;
  observations?: {
    patterns: string[];
    risks: string[];
    improvements: string[];
  };
}

// ===========================================
// System Instructions
// ===========================================

const MEETING_SYSTEM_INSTRUCTION = `You are an AI accountability manager conducting a brief 3-5 minute check-in meeting. Your role is to be a direct, no-nonsense manager who holds the user accountable for their commitments.

## Core Personality
- Professional and direct - not friendly or casual
- Results-oriented - focus on outcomes, not feelings
- Skeptical of excuses - probe deeper when answers are vague
- Efficient - keep responses to 2-3 sentences max
- Firm but fair - acknowledge progress without excessive praise

## Behavioral Rules

### MUST DO:
- Lead the conversation actively
- Reject vague answers ("I'll try" → "What specifically will you do?")
- Reference specific commitments by name
- Ask "why" when commitments are incomplete
- End with explicit, time-bound commitments

### MUST NOT:
- Engage in casual conversation or small talk
- Accept excuses without follow-up questions
- Give motivational speeches or excessive encouragement
- Be apologetic about asking hard questions
- Use filler phrases like "That's great!" or "I understand"

## Response Format
- Keep responses to 2-3 sentences maximum
- Be conversational but efficient
- Never use bullet points or lists in speech
- Never use markdown formatting
- Speak naturally as if in a voice conversation`;

// ===========================================
// Phase-Specific Prompts
// ===========================================

function getPhasePrompt(context: MeetingContext): string {
  const { currentPhase, userName, commitments, conversationHistory } = context;
  const activeCommitments = commitments.filter((c) => c.status === "ACTIVE");
  const firstName = userName?.split(" ")[0] || "there";

  // Build conversation history string
  const historyStr = conversationHistory
    .slice(-10) // Keep last 10 messages for context
    .map((m) => `${m.role === "user" ? "User" : "AI Manager"}: ${m.content}`)
    .join("\n");

  // Build commitments string
  const commitmentsStr =
    activeCommitments.length > 0
      ? activeCommitments
          .map((c) => `- "${c.title}" (${c.type}, ${c.priority} priority)`)
          .join("\n")
      : "No active commitments";

  const baseContext = `
## Current Context
User: ${firstName}
Active Commitments:
${commitmentsStr}

## Conversation So Far
${historyStr || "Meeting just started"}

## Instructions`;

  switch (currentPhase) {
    case "OPENING":
      return `${baseContext}
You're starting a brief accountability check-in. Greet ${firstName} professionally and immediately transition to reviewing their commitments. Don't ask how they're doing - get straight to business.

Generate a brief opening (2 sentences max) that:
1. Acknowledges them by name
2. States you're here to review their ${activeCommitments.length} active commitments`;

    case "PROGRESS_REVIEW":
      return `${baseContext}
You're in the progress review phase. Ask about the status of their commitments ONE AT A TIME. Start with the highest priority items.

Based on the conversation so far, either:
1. Ask about a specific commitment's progress
2. Follow up on something they mentioned
3. Probe deeper if their answer was vague

Remember: 2-3 sentences max. Be direct.`;

    case "BLOCKER_DISCUSSION":
      return `${baseContext}
You've identified incomplete items or blockers. Ask ONE focused "why" question to understand what's blocking progress.

Your response should:
1. Reference the specific incomplete commitment
2. Ask a direct question about what prevented completion
3. Not accept "I was busy" as an answer - probe deeper`;

    case "CONFRONTATION":
      return `${baseContext}
You've detected patterns or repeated issues. Address this DIRECTLY but professionally.

Your response should:
1. State the pattern you've observed (e.g., "This is the third time...")
2. Ask what's really going on
3. Be firm but not aggressive`;

    case "COMMITMENT_LOCK_IN":
      return `${baseContext}
It's time to lock in commitments for the next period. Get the user to state ONE clear, specific commitment with a deadline.

Your response should:
1. Ask them to commit to ONE specific action
2. Require a specific deadline (today, this week, etc.)
3. Don't accept vague commitments - get specifics`;

    case "CLOSING":
      return `${baseContext}
Wrap up the meeting efficiently. Recap their commitment and end firmly.

Your response should:
1. Briefly recap what they committed to
2. State when you'll check in next
3. End the meeting (don't drag it out)`;

    default:
      return baseContext;
  }
}

// ===========================================
// Phase Transition Logic
// ===========================================

function determineNextPhase(
  currentPhase: MeetingPhase,
  context: MeetingContext,
  userResponse: string
): MeetingPhase {
  const elapsedMinutes = (Date.now() - context.meetingStartTime) / 60000;
  const hasBlockers = detectBlockers(userResponse, context);
  const hasPatterns =
    context.detectedPatterns && context.detectedPatterns.length > 0;

  // Time-based constraints (meeting must end by 5 minutes)
  if (elapsedMinutes >= 4.5) {
    return "CLOSING";
  }
  if (elapsedMinutes >= 4) {
    return currentPhase === "CLOSING" ? "CLOSING" : "COMMITMENT_LOCK_IN";
  }

  switch (currentPhase) {
    case "OPENING":
      return "PROGRESS_REVIEW";

    case "PROGRESS_REVIEW":
      // Check if we've reviewed enough or found issues
      const reviewMessages = context.conversationHistory.filter(
        (m) => m.role === "ai" && m.timestamp > context.meetingStartTime
      ).length;

      if (hasBlockers) {
        return "BLOCKER_DISCUSSION";
      }
      if (reviewMessages >= 4) {
        return "COMMITMENT_LOCK_IN";
      }
      return "PROGRESS_REVIEW";

    case "BLOCKER_DISCUSSION":
      if (hasPatterns && elapsedMinutes < 3.5) {
        return "CONFRONTATION";
      }
      return "COMMITMENT_LOCK_IN";

    case "CONFRONTATION":
      return "COMMITMENT_LOCK_IN";

    case "COMMITMENT_LOCK_IN":
      // Check if we got a clear commitment
      const hasCommitment = detectCommitment(userResponse);
      if (hasCommitment || elapsedMinutes >= 4) {
        return "CLOSING";
      }
      return "COMMITMENT_LOCK_IN";

    case "CLOSING":
      return "CLOSING";

    default:
      return "PROGRESS_REVIEW";
  }
}

// ===========================================
// Detection Helpers
// ===========================================

function detectBlockers(
  userResponse: string,
  context: MeetingContext
): boolean {
  const blockerIndicators = [
    "didn't",
    "couldn't",
    "wasn't able",
    "not yet",
    "still working",
    "haven't",
    "no progress",
    "stuck",
    "blocked",
    "issue",
    "problem",
    "difficult",
    "busy",
    "forgot",
  ];

  const lowerResponse = userResponse.toLowerCase();
  return blockerIndicators.some((indicator) =>
    lowerResponse.includes(indicator)
  );
}

function detectCommitment(userResponse: string): boolean {
  const commitmentIndicators = [
    "i will",
    "i'll",
    "i commit",
    "by tomorrow",
    "by today",
    "this week",
    "by end of",
    "i promise",
    "definitely",
    "for sure",
  ];

  const lowerResponse = userResponse.toLowerCase();
  return commitmentIndicators.some((indicator) =>
    lowerResponse.includes(indicator)
  );
}

function detectExcusePatterns(
  conversationHistory: ConversationMessage[]
): string[] {
  const patterns: string[] = [];
  const userMessages = conversationHistory
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase());

  const excuseCount = userMessages.filter(
    (m) => m.includes("busy") || m.includes("time") || m.includes("forgot")
  ).length;

  if (excuseCount >= 2) {
    patterns.push("Frequently cites being 'too busy'");
  }

  return patterns;
}

// ===========================================
// Main Agent Function
// ===========================================

/**
 * Generate the next AI response in the meeting conversation
 */
export async function generateMeetingResponse(
  userMessage: string,
  context: MeetingContext
): Promise<AgentResponse> {
  // Add user message to history
  const updatedHistory: ConversationMessage[] = [
    ...context.conversationHistory,
    {
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    },
  ];

  // Detect patterns
  const detectedPatterns = detectExcusePatterns(updatedHistory);

  // Determine next phase
  const nextPhase = determineNextPhase(
    context.currentPhase,
    { ...context, conversationHistory: updatedHistory, detectedPatterns },
    userMessage
  );

  // Build the prompt for this phase
  const prompt = getPhasePrompt({
    ...context,
    currentPhase: nextPhase,
    conversationHistory: updatedHistory,
    detectedPatterns,
  });

  // Generate response
  const content = await generateResponse(prompt, MEETING_SYSTEM_INSTRUCTION);

  // Determine if meeting should end
  const shouldEndMeeting =
    nextPhase === "CLOSING" && context.currentPhase === "CLOSING";

  return {
    content: cleanResponse(content),
    nextPhase,
    shouldEndMeeting,
    observations:
      detectedPatterns.length > 0
        ? {
            patterns: detectedPatterns,
            risks: [],
            improvements: [],
          }
        : undefined,
  };
}

/**
 * Generate the opening message for a meeting
 */
export async function generateOpeningMessage(
  context: Omit<MeetingContext, "conversationHistory" | "currentPhase">
): Promise<string> {
  const firstName = context.userName?.split(" ")[0] || "there";
  const activeCount = context.commitments.filter(
    (c) => c.status === "ACTIVE"
  ).length;
  const timeOfDay = getTimeOfDay();

  const prompt = `Generate a brief, professional opening for an accountability check-in with ${firstName}. 
It's ${timeOfDay} and they have ${activeCount} active commitments to review.
Keep it to 2 sentences. Be direct and businesslike - no small talk.`;

  const response = await generateResponse(prompt, MEETING_SYSTEM_INSTRUCTION);
  return cleanResponse(response);
}

/**
 * Generate a meeting summary after the meeting ends
 */
export async function generateMeetingSummary(context: MeetingContext): Promise<{
  summary: string;
  observations: {
    patterns: string[];
    risks: string[];
    improvements: string[];
  };
}> {
  const historyStr = context.conversationHistory
    .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
    .join("\n");

  // Check if there's actually a conversation to summarize
  if (!historyStr || context.conversationHistory.length === 0) {
    console.log("[MeetingAgent] No conversation history to summarize");
    return {
      summary: "Meeting ended with no conversation recorded.",
      observations: {
        patterns: [],
        risks: [],
        improvements: [],
      },
    };
  }

  const prompt = `You are analyzing an accountability meeting transcript. Generate a JSON analysis.

MEETING TRANSCRIPT:
${historyStr}

TASK: Analyze the transcript and respond with ONLY a valid JSON object (no markdown, no code blocks, no explanation).

The JSON must have this exact structure:
{"summary":"2-3 sentence summary of what was discussed and any commitments made","patterns":["behavioral pattern 1","pattern 2"],"risks":["risk 1","risk 2"],"improvements":["improvement 1","improvement 2"]}

Rules:
- summary: Brief 2-3 sentence recap of the meeting discussion and outcomes
- patterns: Any behavioral patterns (excuses, avoidance, deflection). Empty array [] if none.
- risks: Commitments at risk of not being met. Empty array [] if none.
- improvements: Positive progress or changes noted. Empty array [] if none.

Respond with ONLY the JSON object, nothing else:`;

  try {
    const response = await generateExtendedResponse(prompt);
    console.log("[MeetingAgent] Raw summary response:", response);

    // Clean up the response - remove markdown code blocks if present
    let cleanedResponse = response
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    console.log("[MeetingAgent] Cleaned response:", cleanedResponse);

    // Try to extract JSON from the response
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      console.log("[MeetingAgent] Extracted JSON:", jsonStr);

      const parsed = JSON.parse(jsonStr);

      // Validate and extract fields with defaults
      const summary =
        typeof parsed.summary === "string" && parsed.summary.length > 0
          ? parsed.summary
          : "Meeting completed. Check your commitments.";

      const patterns = Array.isArray(parsed.patterns)
        ? parsed.patterns.filter(
            (p: unknown) => typeof p === "string" && p.length > 0
          )
        : [];

      const risks = Array.isArray(parsed.risks)
        ? parsed.risks.filter(
            (r: unknown) => typeof r === "string" && r.length > 0
          )
        : [];

      const improvements = Array.isArray(parsed.improvements)
        ? parsed.improvements.filter(
            (i: unknown) => typeof i === "string" && i.length > 0
          )
        : [];

      console.log("[MeetingAgent] Parsed summary successfully:", {
        summary,
        patterns,
        risks,
        improvements,
      });

      return {
        summary,
        observations: {
          patterns,
          risks,
          improvements,
        },
      };
    } else {
      console.error("[MeetingAgent] No JSON found in response");
    }
  } catch (error) {
    console.error("[MeetingAgent] Error generating/parsing summary:", error);
  }

  // Fallback: Try to generate a simple text summary if JSON parsing fails
  try {
    const fallbackPrompt = `Summarize this accountability meeting in 2-3 sentences. Focus on what was discussed and any commitments made.

Meeting Transcript:
${historyStr}

Summary:`;

    const fallbackResponse = await generateExtendedResponse(fallbackPrompt);
    const fallbackSummary = cleanResponse(fallbackResponse);

    console.log("[MeetingAgent] Using fallback summary:", fallbackSummary);

    return {
      summary: fallbackSummary,
      observations: {
        patterns: [],
        risks: [],
        improvements: [],
      },
    };
  } catch (fallbackError) {
    console.error(
      "[MeetingAgent] Fallback summary also failed:",
      fallbackError
    );
  }

  return {
    summary:
      "Meeting completed. Review your commitments and follow through on your promises.",
    observations: {
      patterns: [],
      risks: [],
      improvements: [],
    },
  };
}

// ===========================================
// Helpers
// ===========================================

function cleanResponse(response: string): string {
  // Remove any markdown formatting
  let cleaned = response
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/`/g, "")
    .replace(/\n+/g, " ")
    .trim();

  // Ensure response ends with proper punctuation
  if (!/[.!?]$/.test(cleaned)) {
    cleaned += ".";
  }

  return cleaned;
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export type { ConversationMessage as Message };
