# RunBook AI Meeting - Development Guide

This guide documents the implementation of the AI Manager Meeting feature.

---

## Table of Contents

- [TODO 1: Database Schema Extensions](#todo-1-database-schema-extensions)
- [TODO 2: Meeting UI](#todo-2-meeting-ui)
- [TODO 3: Voice Pipeline](#todo-3-voice-pipeline)

---

## TODO 1: Database Schema Extensions ✅

### Approach

Extend the Prisma schema to support the AI Manager Meeting system with two new core models:

1. **Meeting** - Tracks individual meeting sessions, their status, transcripts, and AI-generated outputs
2. **UserMemory** - Stores persistent behavioral patterns and observations that the AI uses across meetings

Additionally, we added supporting enums and updated existing models with new relations.

### Implementation Strategy

1. Add new relations to the User model (`meetings`, `memories`)
2. Add `lastReminderAt` field to MeetingSchedule for email reminder tracking
3. Create Meeting model with phase tracking and transcript storage
4. Create UserMemory model with categorization and importance scoring
5. Add enums for MeetingStatus, MeetingPhase, and MemoryCategory

### Schema Design

```
┌─────────────────────────────────────────────────────────────────┐
│                              USER                                │
├─────────────────────────────────────────────────────────────────┤
│ id, supabaseId, email, name, avatarUrl, onboardingDone          │
├─────────────────────────────────────────────────────────────────┤
│ Relations: goals[], meetingSchedule?, meetings[], memories[]     │
└─────────────────────────────────────────────────────────────────┘
                    │                      │
                    │ 1:N                  │ 1:N
                    ▼                      ▼
┌───────────────────────────┐    ┌───────────────────────────────┐
│         MEETING           │    │         USER_MEMORY           │
├───────────────────────────┤    ├───────────────────────────────┤
│ id          String        │    │ id          String            │
│ userId      String (FK)   │    │ userId      String (FK)       │
│ status      MeetingStatus │    │ category    MemoryCategory    │
│ startedAt   DateTime      │    │ content     String            │
│ endedAt     DateTime?     │    │ importance  Int (1-10)        │
│ durationMs  Int?          │    │ sourceId    String? (ref)     │
│ transcript  Json?         │    │ metadata    Json?             │
│ summary     String?       │    │ expiresAt   DateTime?         │
│ observations Json?        │    │ createdAt   DateTime          │
│ phase       MeetingPhase  │    │ updatedAt   DateTime          │
│ createdAt   DateTime      │    └───────────────────────────────┘
│ updatedAt   DateTime      │
└───────────────────────────┘
```

### New Models

#### Meeting Model

| Field          | Type          | Purpose                                 |
| -------------- | ------------- | --------------------------------------- |
| `id`           | String        | Unique identifier (CUID)                |
| `userId`       | String        | Foreign key to User                     |
| `status`       | MeetingStatus | Current meeting state                   |
| `startedAt`    | DateTime      | When meeting began                      |
| `endedAt`      | DateTime?     | When meeting finished                   |
| `durationMs`   | Int?          | Actual duration in milliseconds         |
| `transcript`   | Json?         | Array of `{role, content, timestamp}`   |
| `summary`      | String?       | AI-generated meeting summary            |
| `observations` | Json?         | `{patterns[], risks[], improvements[]}` |
| `phase`        | MeetingPhase  | Current phase of meeting flow           |

#### UserMemory Model

| Field        | Type           | Purpose                               |
| ------------ | -------------- | ------------------------------------- |
| `id`         | String         | Unique identifier (CUID)              |
| `userId`     | String         | Foreign key to User                   |
| `category`   | MemoryCategory | Type of memory (pattern, trend, etc.) |
| `content`    | String         | The actual memory text                |
| `importance` | Int            | 1-10 scale for prioritization         |
| `sourceId`   | String?        | Reference to originating meeting      |
| `metadata`   | Json?          | Additional context data               |
| `expiresAt`  | DateTime?      | Optional TTL for memory               |

### New Enums

#### MeetingStatus

| Value         | Description                          |
| ------------- | ------------------------------------ |
| `SCHEDULED`   | Meeting is scheduled but not started |
| `IN_PROGRESS` | Meeting is currently active          |
| `COMPLETED`   | Meeting finished normally            |
| `MISSED`      | User didn't join within grace period |
| `CANCELLED`   | Meeting was cancelled                |

#### MeetingPhase

| Value                | Description                               |
| -------------------- | ----------------------------------------- |
| `OPENING`            | Greeting and context setting (15-20s)     |
| `PROGRESS_REVIEW`    | Reviewing active commitments (1-2min)     |
| `BLOCKER_DISCUSSION` | Probing incomplete items (45s-1min)       |
| `CONFRONTATION`      | Addressing patterns - optional (30s-1min) |
| `COMMITMENT_LOCK_IN` | Getting new commitments (45s-1min)        |
| `CLOSING`            | Wrapping up (15-20s)                      |

#### MemoryCategory

| Value               | Description                      | Typical TTL |
| ------------------- | -------------------------------- | ----------- |
| `MISSED_COMMITMENT` | User missed a commitment         | 30 days     |
| `EXCUSE_PATTERN`    | Repeated excuse detected         | 60 days     |
| `DELAY_PATTERN`     | Consistently late on commitments | 90 days     |
| `POSITIVE_TREND`    | Improvement or streak            | 14 days     |
| `WORK_STYLE`        | Preference or working pattern    | 180 days    |
| `BLOCKER`           | Recurring blocker or obstacle    | 30 days     |

### Updated Models

#### MeetingSchedule

Added `lastReminderAt` field to track when the last email reminder was sent, preventing duplicate reminders.

```prisma
model MeetingSchedule {
  // ... existing fields ...
  lastReminderAt  DateTime? // NEW: Track when last reminder was sent
}
```

### Indexes

| Table           | Index                | Purpose                        |
| --------------- | -------------------- | ------------------------------ |
| `meetings`      | `userId`             | Fast lookup of user's meetings |
| `meetings`      | `userId, status`     | Query active/recent meetings   |
| `user_memories` | `userId, category`   | Filter memories by type        |
| `user_memories` | `userId, importance` | Sort by priority               |

### Files Modified

| File                   | Changes                                                     |
| ---------------------- | ----------------------------------------------------------- |
| `prisma/schema.prisma` | Added Meeting, UserMemory models, enums, and User relations |

---

## Setup Instructions

### 1. Verify Prisma Schema

```bash
# Validate schema syntax
npx prisma validate
# Expected: The schema at prisma/schema.prisma is valid 🚀
```

### 2. Generate Prisma Client

```bash
# Generate TypeScript types and client
npm run db:generate
# Expected: ✔ Generated Prisma Client (v7.2.0)
```

### 3. Push Schema to Database

```bash
# Sync schema with database (development)
npm run db:push
# Expected: 🚀 Your database is now in sync with your Prisma schema.
```

---

## Testing Instructions

### 1. Verify Tables Created

```bash
# Open Prisma Studio
npm run db:studio
```

Navigate to [http://localhost:5555](http://localhost:5555) and verify:

- [x] `meetings` table exists with all columns
- [x] `user_memories` table exists with all columns
- [x] `meeting_schedules` has new `lastReminderAt` column

### 2. Test Model Types in Code

Create a temporary test file or use the Node REPL:

```typescript
import {
  PrismaClient,
  MeetingStatus,
  MeetingPhase,
  MemoryCategory,
} from "@prisma/client";

// Verify enums are available
console.log(MeetingStatus.IN_PROGRESS); // Should print: IN_PROGRESS
console.log(MeetingPhase.OPENING); // Should print: OPENING
console.log(MemoryCategory.EXCUSE_PATTERN); // Should print: EXCUSE_PATTERN
```

### 3. Test Creating Records (Optional)

```typescript
import { prisma } from "@/lib/prisma";

// Create a test meeting (requires existing user)
const meeting = await prisma.meeting.create({
  data: {
    userId: "<user-id>",
    status: "IN_PROGRESS",
    phase: "OPENING",
  },
});
console.log("Created meeting:", meeting.id);

// Create a test memory
const memory = await prisma.userMemory.create({
  data: {
    userId: "<user-id>",
    category: "MISSED_COMMITMENT",
    content: 'Missed "Exercise daily" commitment 2 times this week',
    importance: 7,
  },
});
console.log("Created memory:", memory.id);

// Clean up
await prisma.meeting.delete({ where: { id: meeting.id } });
await prisma.userMemory.delete({ where: { id: memory.id } });
```

### 4. Verify Relations

```typescript
// Fetch user with meetings and memories
const userWithRelations = await prisma.user.findUnique({
  where: { id: "<user-id>" },
  include: {
    meetings: true,
    memories: true,
  },
});
console.log("User meetings:", userWithRelations?.meetings.length);
console.log("User memories:", userWithRelations?.memories.length);
```

---

## Transcript JSON Schema

The `transcript` field in Meeting stores conversation history:

```typescript
interface TranscriptEntry {
  role: "user" | "ai";
  content: string;
  timestamp: number; // Unix timestamp in ms
}

// Example transcript
const transcript: TranscriptEntry[] = [
  {
    role: "ai",
    content: "Good morning, Sarah. Let's review your commitments.",
    timestamp: 1704067200000,
  },
  { role: "user", content: "Hey, good morning.", timestamp: 1704067205000 },
  {
    role: "ai",
    content:
      'You had three daily goals. Did you complete "Exercise for 30 minutes"?',
    timestamp: 1704067210000,
  },
  // ...
];
```

---

## Observations JSON Schema

The `observations` field stores AI-extracted insights:

```typescript
interface MeetingObservations {
  patterns: string[]; // Behavioral patterns noticed
  risks: string[]; // Potential issues flagged
  improvements: string[]; // Positive changes observed
}

// Example observations
const observations: MeetingObservations = {
  patterns: ["Frequently reschedules morning tasks to evening"],
  risks: ["Exercise goal missed 3 times in past week"],
  improvements: ["Completed all reading goals consistently"],
};
```

---

## Memory Metadata Schema

The `metadata` field in UserMemory stores additional context:

```typescript
interface MemoryMetadata {
  relatedGoalIds?: string[]; // Goals this memory relates to
  occurrenceCount?: number; // How many times pattern observed
  lastOccurrence?: string; // ISO date of last occurrence
  triggerPhrases?: string[]; // Phrases that triggered this memory
}

// Example metadata
const metadata: MemoryMetadata = {
  relatedGoalIds: ["clx123", "clx456"],
  occurrenceCount: 3,
  lastOccurrence: "2026-01-10",
  triggerPhrases: ["too busy", "didn't have time"],
};
```

---

## Troubleshooting

| Issue                              | Solution                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| `prisma validate` fails            | Check for syntax errors in schema.prisma                                     |
| `db:push` fails with drift error   | Use `prisma db push --accept-data-loss` or reset with `prisma migrate reset` |
| Types not available after generate | Restart TypeScript server in VS Code (Cmd+Shift+P → "Restart TS Server")     |
| Foreign key constraint error       | Ensure referenced User exists before creating Meeting/Memory                 |

---

## TODO 2: Meeting UI ✅

### Approach

Build a complete voice-first meeting interface with multiple states, real-time visual feedback, and a professional dark aesthetic. The UI is designed to feel like an audio call, not a chat interface.

### Implementation Strategy

1. Create reusable meeting components with clear separation of concerns
2. Implement multiple meeting states (Ready, Connecting, In Progress, Completed, Error)
3. Build visual feedback components (AI presence indicator, audio visualizer, timer)
4. Create live transcript panel with real-time updates
5. Implement meeting controls (mute, end meeting, toggle transcript)
6. Create Meeting API routes for starting, updating, and ending meetings

### File Structure

```
components/meeting/
├── index.ts              # Component exports
├── types.ts              # TypeScript types and interfaces
├── MeetingRoom.tsx       # Main meeting container
├── MeetingTimer.tsx      # Duration tracker with progress bar
├── MeetingControls.tsx   # Mute, end, transcript toggle buttons
├── TranscriptPanel.tsx   # Live transcript display
├── AudioVisualizer.tsx   # Voice activity indicator & AI presence
└── MeetingStates.tsx     # Pre/post meeting screens

app/api/meeting/
├── route.ts              # GET/POST - List/Create meetings
├── [id]/
│   ├── route.ts          # GET/PATCH - Meeting details
│   └── end/route.ts      # POST - End meeting with summary
```

### Meeting UI States

| State           | Description             | UI                                        |
| --------------- | ----------------------- | ----------------------------------------- |
| `READY`         | Meeting can start       | Join button, agenda preview, back link    |
| `CONNECTING`    | Establishing connection | Loading animation, connection steps       |
| `IN_PROGRESS`   | Active meeting          | Timer, AI indicator, transcript, controls |
| `AI_SPEAKING`   | AI is talking           | Pulsing AI indicator, speaking animation  |
| `USER_SPEAKING` | User is talking         | Listening indicator                       |
| `PROCESSING`    | AI thinking             | Thinking dots animation                   |
| `ENDING`        | Meeting concluding      | Disabled controls                         |
| `COMPLETED`     | Meeting finished        | Summary, observations, back button        |

### Component Details

#### MeetingRoom

Main container that orchestrates the in-progress meeting experience:

- Dark gradient background with subtle grid pattern
- Header with live indicator, phase badge, and timer
- Central AI presence indicator that responds to state
- Last transcript entry preview (minimal view)
- Expandable full transcript panel
- Control bar with mute/end/transcript buttons

#### AIPresenceIndicator

Visual representation of AI state using concentric animated rings:

- **Idle**: Slow pulse, low opacity
- **Listening**: Green accent, responsive pulse
- **Thinking**: Amber color, bouncing dots
- **Speaking**: Blue pulsing bars, high activity

#### MeetingTimer

Tracks meeting duration with visual progress:

- MM:SS format display
- Progress bar showing time used
- Color changes: blue → amber (>80%) → red (overtime)
- Triggers callback when max duration reached

#### TranscriptPanel

Live conversation display:

- Auto-scrolls to latest message
- Role indicators (AI/User)
- Timestamp for each entry
- Support for interim (in-progress) transcripts
- Expandable/collapsible

#### MeetingControls

Meeting action buttons:

- **Mute**: Toggle microphone, red indicator when muted
- **End Meeting**: Red phone icon, ends meeting
- **Transcript**: Toggle expanded transcript view

### API Routes

#### POST /api/meeting

Creates a new meeting session.

**Response:**

```json
{
  "id": "clx...",
  "userId": "clx...",
  "status": "IN_PROGRESS",
  "phase": "OPENING",
  "startedAt": "2026-01-11T...",
  "transcript": []
}
```

#### GET /api/meeting

Returns the most recent meeting (in progress or completed).

#### GET /api/meeting/[id]

Returns meeting details by ID.

#### PATCH /api/meeting/[id]

Updates meeting phase, transcript, or status.

**Request:**

```json
{
  "phase": "PROGRESS_REVIEW",
  "transcript": [...],
  "status": "IN_PROGRESS"
}
```

#### POST /api/meeting/[id]/end

Ends a meeting and generates summary.

**Request:**

```json
{
  "transcript": [...]
}
```

**Response:**

```json
{
  "id": "clx...",
  "status": "COMPLETED",
  "endedAt": "2026-01-11T...",
  "durationMs": 180000,
  "summary": "Accountability check-in completed...",
  "observations": {
    "patterns": [],
    "risks": [],
    "improvements": []
  }
}
```

### Design Principles

1. **Dark, focused UI**: Minimizes distractions, creates meeting room atmosphere
2. **Voice-first**: No text input, audio-centric controls
3. **Real-time feedback**: Immediate visual response to state changes
4. **Accessibility**: Live transcript for hearing-impaired users
5. **Progressive disclosure**: Minimal by default, expandable for detail

### Files Created/Modified

| File                                     | Purpose                |
| ---------------------------------------- | ---------------------- |
| `components/meeting/types.ts`            | Type definitions       |
| `components/meeting/index.ts`            | Component exports      |
| `components/meeting/MeetingRoom.tsx`     | Main meeting container |
| `components/meeting/MeetingTimer.tsx`    | Duration tracker       |
| `components/meeting/MeetingControls.tsx` | Control buttons        |
| `components/meeting/TranscriptPanel.tsx` | Live transcript        |
| `components/meeting/AudioVisualizer.tsx` | Visual feedback        |
| `components/meeting/MeetingStates.tsx`   | State screens          |
| `app/(protected)/meeting/page.tsx`       | Meeting page (updated) |
| `app/api/meeting/route.ts`               | Meeting API            |
| `app/api/meeting/[id]/route.ts`          | Meeting details API    |
| `app/api/meeting/[id]/end/route.ts`      | End meeting API        |

---

## Setup Instructions (TODO 2)

### 1. Verify TypeScript Compilation

```bash
npx tsc --noEmit
# Should complete with no errors
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Navigate to Meeting Page

Open [http://localhost:3000/meeting](http://localhost:3000/meeting)

---

## Testing Instructions (TODO 2)

### 1. Test Ready State

1. Navigate to `/meeting`
2. Verify you see the "Ready for your check-in" screen
3. Verify your active commitments are listed in the agenda preview
4. Verify "Meeting will last 3-5 minutes" notice is shown

### 2. Test Join Meeting Flow

1. Click "Join Meeting" button
2. Browser should prompt for microphone access
3. Grant microphone permission
4. Verify connecting screen appears with loading steps
5. Verify transition to meeting room

### 3. Test Meeting Room

1. Verify timer is counting up
2. Verify AI presence indicator is animated
3. Verify simulated AI greeting appears in transcript
4. Click transcript toggle - verify panel expands/collapses
5. Click mute button - verify visual feedback and warning message

### 4. Test End Meeting

1. Click red phone icon to end meeting
2. Verify completed state appears
3. Verify summary is shown
4. Click "Back to Dashboard" - verify navigation

### 5. Test API Routes

```bash
# Start meeting (requires auth cookie)
curl -X POST http://localhost:3000/api/meeting

# Get meeting details
curl http://localhost:3000/api/meeting

# End meeting
curl -X POST http://localhost:3000/api/meeting/<meeting-id>/end \
  -H "Content-Type: application/json" \
  -d '{"transcript": []}'
```

### 6. Verify Database Records

```bash
npm run db:studio
```

Check `meetings` table for:

- New meeting records created
- Status transitions (IN_PROGRESS → COMPLETED)
- Duration calculated correctly
- Transcript stored as JSON

---

## Troubleshooting (TODO 2)

| Issue                           | Solution                                             |
| ------------------------------- | ---------------------------------------------------- |
| Microphone prompt not appearing | Check browser permissions, try different browser     |
| Meeting not starting            | Check API response in Network tab, verify auth       |
| Timer not counting              | Verify `startTime` is set correctly                  |
| Transcript not updating         | Check state management, verify `setTranscript` calls |
| API returns 401                 | User not authenticated, redirect to login            |
| API returns 404                 | Meeting or user not found in database                |

---

## TODO 3: Voice Pipeline ✅

### Approach

Implement real-time voice conversation using Deepgram for both Speech-to-Text (STT) and Text-to-Speech (TTS). The pipeline uses a browser-to-Deepgram WebSocket for STT (lowest latency) and server-side API for TTS (keeps API key secure).

### Technology Choices

| Component        | Provider        | Details                             |
| ---------------- | --------------- | ----------------------------------- |
| STT              | Deepgram Nova-2 | Real-time WebSocket, <300ms latency |
| TTS              | Deepgram Aura   | Asteria voice (professional female) |
| Audio Processing | Web Audio API   | PCM16 encoding, 16kHz sample rate   |

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       BROWSER                                    │
├─────────────────────────────────────────────────────────────────┤
│  Microphone → AudioContext → PCM16 → WebSocket → Deepgram STT   │
│                                                                  │
│  Deepgram TTS → API Route → PCM Audio → AudioContext → Speaker  │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure

```
lib/voice/
├── index.ts              # Exports
├── deepgram.ts           # Deepgram client config
├── audio-utils.ts        # Audio conversion utilities
├── stt.ts                # Speech-to-Text client
├── tts.ts                # Text-to-Speech client
├── pipeline.ts           # Orchestration layer
└── use-voice-pipeline.ts # React hook

app/api/voice/
├── token/route.ts        # GET - Deepgram token for browser STT
└── tts/route.ts          # POST - Text-to-Speech conversion
```

### Key Components

#### DeepgramSTT (Speech-to-Text)

Browser-based WebSocket connection to Deepgram:

- Direct browser-to-Deepgram connection (lowest latency)
- Streaming transcription with interim results
- Voice Activity Detection (VAD)
- Auto-reconnection on connection loss

**Configuration:**

```typescript
{
  model: "nova-2",
  language: "en-US",
  smart_format: true,
  punctuate: true,
  interim_results: true,
  utterance_end_ms: 1000,
  vad_events: true,
  endpointing: 300,
}
```

#### DeepgramTTS (Text-to-Speech)

Server-side TTS via API route:

- Keeps API key secure (not exposed to browser)
- Streams audio back to client
- Queue system for sequential playback
- Auto-interrupt when user speaks

**Voice Options:**
| Voice ID | Name | Tone |
|----------|------|------|
| `aura-asteria-en` | Asteria | Professional (default) |
| `aura-luna-en` | Luna | Warm |
| `aura-stella-en` | Stella | Confident |
| `aura-orion-en` | Orion | Authoritative |

#### VoicePipeline

Orchestrates STT and TTS:

- State management (idle, connecting, listening, speaking, etc.)
- Auto-interrupt: Stops TTS when user starts speaking
- Voice activity callbacks
- Clean resource management

#### useVoicePipeline Hook

React hook for easy integration:

```typescript
const {
  state, // Current pipeline state
  isConnected, // STT WebSocket connected
  isSpeaking, // TTS currently playing
  isListening, // STT active
  voiceLevel, // Current audio level (0-1)
  error, // Any error that occurred
  start, // Start the pipeline
  stop, // Stop and cleanup
  speak, // Speak text
  stopSpeaking, // Interrupt TTS
  setMuted, // Mute/unmute microphone
} = useVoicePipeline(options);
```

### API Routes

#### GET /api/voice/token

Returns Deepgram API key for browser STT connection.

**Response:**

```json
{ "token": "deepgram-api-key" }
```

> **Security Note:** In production, use Deepgram's temporary keys API instead of returning the main API key.

#### POST /api/voice/tts

Converts text to speech using Deepgram Aura.

**Request:**

```json
{
  "text": "Hello, let's review your commitments.",
  "voice": "aura-asteria-en"
}
```

**Response:** Raw PCM audio (audio/pcm)

### Audio Processing

The pipeline handles audio format conversion:

1. **Capture**: MediaRecorder → Float32Array
2. **Convert**: Float32 → Int16 (PCM16)
3. **Send**: PCM16 → WebSocket → Deepgram
4. **Receive**: Deepgram → PCM16 audio
5. **Play**: PCM16 → WAV → AudioContext → Speaker

### Files Created

| File                               | Purpose                        |
| ---------------------------------- | ------------------------------ |
| `lib/voice/deepgram.ts`            | Deepgram client configuration  |
| `lib/voice/audio-utils.ts`         | Audio conversion utilities     |
| `lib/voice/stt.ts`                 | Speech-to-Text client          |
| `lib/voice/tts.ts`                 | Text-to-Speech client          |
| `lib/voice/pipeline.ts`            | Voice pipeline orchestration   |
| `lib/voice/use-voice-pipeline.ts`  | React hook                     |
| `lib/voice/index.ts`               | Module exports                 |
| `app/api/voice/token/route.ts`     | Token API                      |
| `app/api/voice/tts/route.ts`       | TTS API                        |
| `app/(protected)/meeting/page.tsx` | Updated with voice integration |
| `env.example`                      | Added DEEPGRAM_API_KEY         |

### Dependencies Added

```json
{
  "@deepgram/sdk": "^3.x"
}
```

---

## Setup Instructions (TODO 3)

### 1. Get Deepgram API Key

1. Go to [console.deepgram.com](https://console.deepgram.com)
2. Create an account (free tier includes $200 credit)
3. Create a new API key
4. Add to `.env.local`:

```env
DEEPGRAM_API_KEY=your-deepgram-api-key-here
```

### 2. Restart Development Server

```bash
# Stop current server (Ctrl+C) then:
npm run dev
```

### 3. Test Voice Pipeline

1. Navigate to `/meeting`
2. Click "Join Meeting"
3. Allow microphone access
4. You should hear the AI greeting
5. Speak - your words should appear in the transcript

---

## Testing Instructions (TODO 3)

### 1. Test Token API

```bash
curl http://localhost:3000/api/voice/token
# Should return: {"token":"..."}
```

### 2. Test TTS API

```bash
curl -X POST http://localhost:3000/api/voice/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world"}' \
  --output test.pcm

# Should create a PCM audio file
```

### 3. Test Full Flow

1. Open browser console (F12)
2. Navigate to `/meeting`
3. Join meeting
4. Check for:
   - `[STT] Connected to Deepgram` in console
   - AI greeting audio plays
   - Speaking shows transcript updates
   - Interim results appear while speaking

### 4. Test Auto-Interrupt

1. Start a meeting
2. Let AI start speaking
3. Start talking - AI should stop immediately

---

## Troubleshooting (TODO 3)

| Issue                          | Solution                                                 |
| ------------------------------ | -------------------------------------------------------- |
| "Voice service not configured" | Add `DEEPGRAM_API_KEY` to `.env.local`                   |
| No audio playing               | Check browser audio permissions, try clicking page first |
| STT not working                | Check microphone permissions, verify token endpoint      |
| "WebSocket connection error"   | Verify API key is valid, check network                   |
| Audio choppy                   | Check internet connection, reduce other network usage    |
| Echo/feedback                  | Use headphones, enable echo cancellation in browser      |

---

## Next Steps

After TODO 3 is complete:

- **TODO 4**: Integrate Google Gemini 2.5 Flash for AI conversation logic ✅
- **TODO 5**: Implement meeting phases and behavioral rules

The voice pipeline is now functional. The next step is to add AI intelligence to generate contextual responses based on user speech.

---

## TODO 4: LLM Provider (Gemini Integration) ✅

### Approach

Integrate Google Gemini 2.5 Flash as the LLM provider for the AI Manager Meeting. The integration includes a Gemini client configuration, meeting-specific agent logic, conversation flow, and a chat API endpoint.

### Technology Choice

| Component | Provider                | Details                                                     |
| --------- | ----------------------- | ----------------------------------------------------------- |
| LLM       | Google Gemini 2.5 Flash | Fast inference (~500ms), generous free tier, good reasoning |
| Model ID  | `gemini-2.5-flash`      | Latest preview model for optimal performance                |

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MEETING PAGE                                  │
├─────────────────────────────────────────────────────────────────┤
│  Voice Pipeline (STT) → User Speech → /api/chat                 │
│                                                                  │
│  /api/chat → Gemini → AI Response → Voice Pipeline (TTS)        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI MEETING AGENT                              │
├─────────────────────────────────────────────────────────────────┤
│  • System Instructions (personality, rules)                      │
│  • Phase-specific prompts                                        │
│  • Context injection (commitments, history)                      │
│  • Response cleaning (for TTS)                                   │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure

```
lib/ai/
├── index.ts              # Module exports
├── gemini.ts             # Gemini client configuration
└── meeting-agent.ts      # Meeting-specific agent logic

app/api/
└── chat/
    └── route.ts          # Chat API endpoint
```

### Key Components

#### Gemini Client (`lib/ai/gemini.ts`)

Configured Gemini client with:

- **Safety Settings**: Configured to be lenient for accountability conversations while blocking harmful content
- **Voice Generation Config**: Low max tokens (150) for concise responses suitable for TTS
- **Extended Generation Config**: Higher max tokens (500) for summaries and analysis

```typescript
// Voice-optimized config
export const voiceGenerationConfig = {
  maxOutputTokens: 150, // Keep responses short for voice
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
};
```

**Exported Functions:**
| Function | Purpose |
|----------|---------|
| `getMeetingModel()` | Get model for meeting conversations |
| `getExtendedModel()` | Get model for summaries/analysis |
| `generateResponse()` | Generate single response |
| `generateExtendedResponse()` | Generate longer response |
| `generateStreamingResponse()` | Stream response (for future use) |

#### Meeting Agent (`lib/ai/meeting-agent.ts`)

Core conversation logic:

**System Instructions:**

- Professional and direct personality
- Results-oriented, skeptical of excuses
- 2-3 sentence responses (TTS-friendly)
- No casual conversation or motivational speeches

**Meeting Phases:**
| Phase | Duration | Purpose |
|-------|----------|---------|
| `OPENING` | 15-20s | Brief greeting, state purpose |
| `PROGRESS_REVIEW` | 1-2min | Review top commitments |
| `BLOCKER_DISCUSSION` | 45s-1min | Probe incomplete items |
| `CONFRONTATION` | 30s-1min | Address patterns (optional) |
| `COMMITMENT_LOCK_IN` | 45s-1min | Get specific commitments |
| `CLOSING` | 15-20s | Recap and end |

**Exported Functions:**
| Function | Purpose |
|----------|---------|
| `generateMeetingResponse()` | Generate response to user message |
| `generateOpeningMessage()` | Generate meeting opening |
| `generateMeetingSummary()` | Generate post-meeting summary |

**Phase Transition Logic:**

- Time-based constraints (meeting must end by 5 minutes)
- Detects blockers from user responses
- Detects excuse patterns across conversation
- Skips CONFRONTATION if no patterns detected

**Detection Helpers:**

- `detectBlockers()`: Identifies incomplete items or issues
- `detectCommitment()`: Identifies when user makes a commitment
- `detectExcusePatterns()`: Identifies repeated excuses

#### Chat API (`app/api/chat/route.ts`)

POST endpoint for AI conversation:

**Request:**

```json
{
  "meetingId": "clx...",
  "message": "I haven't started on the project yet",
  "action": "respond"
}
```

Or for meeting start:

```json
{
  "meetingId": "clx...",
  "action": "start"
}
```

**Response:**

```json
{
  "response": "What specifically blocked you from starting?",
  "phase": "BLOCKER_DISCUSSION",
  "shouldEndMeeting": false,
  "timestamp": 1704067200000
}
```

**Features:**

- Loads user commitments for context
- Tracks conversation history in meeting transcript
- Updates meeting phase automatically
- Handles rate limits and errors gracefully

### Meeting Page Integration

Updated `app/(protected)/meeting/page.tsx`:

1. **AI Opening**: Calls `/api/chat` with `action: "start"` to get AI-generated greeting
2. **User Response Processing**: When STT returns final transcript, calls `/api/chat` with user message
3. **AI Response Handling**: Receives AI response, adds to transcript, speaks via TTS
4. **Phase Updates**: Automatically updates meeting phase based on AI response
5. **Meeting End**: AI can signal meeting should end via `shouldEndMeeting` flag

### Response Flow

```
User speaks → STT (Deepgram) → Final transcript
                                     │
                                     ▼
                          /api/chat POST
                                     │
                                     ▼
                    Meeting Agent (Gemini)
                    • Build context
                    • Generate phase prompt
                    • Get AI response
                                     │
                                     ▼
                    Response + phase update
                                     │
                                     ▼
              Add to transcript → TTS (Deepgram) → User hears
```

### Files Created/Modified

| File                                | Purpose                     |
| ----------------------------------- | --------------------------- |
| `lib/ai/index.ts`                   | Module exports              |
| `lib/ai/gemini.ts`                  | Gemini client configuration |
| `lib/ai/meeting-agent.ts`           | Meeting agent logic         |
| `app/api/chat/route.ts`             | Chat API endpoint           |
| `app/api/meeting/[id]/end/route.ts` | Updated to use AI summaries |
| `app/(protected)/meeting/page.tsx`  | Integrated AI responses     |

---

## Setup Instructions (TODO 4)

### 1. Verify Google AI API Key

Ensure your `.env` file has the Gemini API key:

```env
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
```

If you need a key:

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click "Get API Key"
3. Create a new key or use existing

### 2. Verify Dependencies

The `@google/generative-ai` package should already be installed. Verify in `package.json`:

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.24.1"
  }
}
```

### 3. Restart Development Server

```bash
npm run dev
```

---

## Testing Instructions (TODO 4)

### 1. Test Gemini Client Directly

Create a test script or use the Node REPL:

```typescript
import { generateResponse } from "@/lib/ai/gemini";

const response = await generateResponse(
  "Generate a brief greeting for an accountability check-in",
  "You are a professional accountability manager."
);
console.log(response);
```

### 2. Test Chat API

```bash
# First, start a meeting (requires auth)
# Then test the chat endpoint:

curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-auth-cookie>" \
  -d '{
    "meetingId": "<meeting-id>",
    "action": "start"
  }'

# Should return AI opening message
```

### 3. Test Full Meeting Flow

1. Navigate to `/meeting`
2. Click "Join Meeting"
3. **Verify AI Greeting**: Should hear/see AI-generated opening (not hardcoded)
4. **Speak a response**: Say something like "I haven't made progress on my goals"
5. **Verify AI Response**: Should get a probing follow-up question
6. **Continue conversation**: AI should transition through phases
7. **End meeting**: Click end or wait for AI to end
8. **Verify Summary**: Should see AI-generated summary

### 4. Test Phase Transitions

1. Start meeting (OPENING → PROGRESS_REVIEW)
2. Give positive updates → stays in PROGRESS_REVIEW
3. Mention blockers → transitions to BLOCKER_DISCUSSION
4. Give excuses multiple times → may trigger CONFRONTATION
5. Meeting approaches 4+ minutes → transitions to COMMITMENT_LOCK_IN
6. Give specific commitment → transitions to CLOSING

### 5. Test Error Handling

1. Disconnect internet mid-meeting → should show error message
2. Invalid meeting ID → should return 404
3. Rate limit (unlikely with free tier) → should return 429 with friendly message

### 6. Verify Transcript Storage

```bash
npm run db:studio
```

Check `meetings` table:

- Transcript field should contain full conversation
- Phase should reflect current/final phase
- Summary should be AI-generated (after meeting ends)

---

## Troubleshooting (TODO 4)

| Issue                                | Solution                                              |
| ------------------------------------ | ----------------------------------------------------- |
| "AI service configuration error"     | Check `GOOGLE_AI_API_KEY` in `.env`                   |
| "AI service temporarily unavailable" | Rate limit hit, wait and retry                        |
| AI responses too long                | Voice config limits to 150 tokens, check model config |
| AI not following personality         | Review system instructions in `meeting-agent.ts`      |
| Phase not transitioning              | Check `determineNextPhase()` logic and conditions     |
| Transcript not saving                | Verify Prisma update in chat route                    |
| Summary not generated                | Check `generateMeetingSummary()` and JSON parsing     |
| "Failed to get AI response"          | Check server logs for detailed error                  |

---

## AI Behavioral Rules Reference

### MUST DO:

- Lead the conversation actively
- Reject vague answers ("I'll try" → "What specifically will you do?")
- Reference specific commitments by name
- Ask "why" when commitments are incomplete
- End with explicit, time-bound commitments

### MUST NOT:

- Engage in casual conversation or small talk
- Accept excuses without follow-up questions
- Give motivational speeches
- Be apologetic about asking hard questions
- Use filler phrases like "That's great!"

### Response Format:

- 2-3 sentences maximum
- Conversational but efficient
- No bullet points or lists
- No markdown formatting
- Natural speech patterns

---

## Next Steps

After TODO 4 is complete:

- **TODO 5**: Implement full meeting phases with detailed behavioral rules
- **TODO 6**: Build context injection system for commitments and memory
- **TODO 7**: Implement memory extraction and storage
- **TODO 8**: Generate meeting summaries and observations
- **TODO 9**: Set up email reminders with Vercel Cron

The Gemini integration is now functional. The AI can conduct basic accountability conversations with phase transitions and contextual responses.

---

## Schema Reference

Full schema available at: [`prisma/schema.prisma`](prisma/schema.prisma)
