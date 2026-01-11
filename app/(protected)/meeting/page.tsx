"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MeetingRoom,
  ReadyState,
  ConnectingState,
  CompletedState,
  ErrorState,
  type MeetingUIState,
  type TranscriptEntry,
  type MeetingData,
  type CommitmentPreview,
} from "@/components/meeting";
import { useVoicePipeline, type VoicePipelineState } from "@/lib/voice";

interface User {
  id: string;
  name: string | null;
  email: string;
}

export default function MeetingPage() {
  const router = useRouter();

  // User & Commitment State
  const [user, setUser] = useState<User | null>(null);
  const [commitments, setCommitments] = useState<CommitmentPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Meeting State
  const [meetingState, setMeetingState] = useState<MeetingUIState>("READY");
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [isMuted, setIsMuted] = useState(false);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);

  // Refs
  const interimTranscriptRef = useRef<string>("");
  const isVoicePipelineActive = useRef(false);
  const isProcessingRef = useRef(false);
  const pendingUserMessageRef = useRef<string | null>(null);
  const shouldEndMeetingRef = useRef(false);
  const voicePipelineRef = useRef<ReturnType<typeof useVoicePipeline> | null>(
    null
  );

  // Process user message and get AI response
  const processUserMessage = useCallback(
    async (userMessage: string) => {
      if (!meetingData?.id || isProcessingRef.current) {
        pendingUserMessageRef.current = userMessage;
        return;
      }

      isProcessingRef.current = true;
      setMeetingState("PROCESSING");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meetingId: meetingData.id,
            message: userMessage,
            action: "respond",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get AI response");
        }

        const data = await response.json();

        // Update meeting phase if changed
        if (data.phase && meetingData) {
          setMeetingData({ ...meetingData, phase: data.phase });
        }

        // Add AI response to transcript
        const aiEntry: TranscriptEntry = {
          id: `ai-${Date.now()}`,
          role: "ai",
          content: data.response,
          timestamp: data.timestamp || Date.now(),
        };
        setTranscript((prev) => [...prev, aiEntry]);

        // Speak the response if voice is active
        const pipeline = voicePipelineRef.current;
        if (isVoicePipelineActive.current && pipeline?.isReady) {
          setMeetingState("AI_SPEAKING");
          try {
            await pipeline.speak(data.response);
          } catch (speakErr) {
            console.warn("[Meeting] Failed to speak AI response:", speakErr);
          }
        }

        // Check if meeting should end - set ref for effect to handle
        if (data.shouldEndMeeting) {
          shouldEndMeetingRef.current = true;
        } else {
          setMeetingState("IN_PROGRESS");
        }
      } catch (err) {
        console.error("Error getting AI response:", err);
        // Add error message to transcript
        const errorEntry: TranscriptEntry = {
          id: `error-${Date.now()}`,
          role: "ai",
          content:
            "I had trouble processing that. Could you repeat what you said?",
          timestamp: Date.now(),
        };
        setTranscript((prev) => [...prev, errorEntry]);
        setMeetingState("IN_PROGRESS");
      } finally {
        isProcessingRef.current = false;

        // Process any pending message
        if (pendingUserMessageRef.current) {
          const pending = pendingUserMessageRef.current;
          pendingUserMessageRef.current = null;
          processUserMessage(pending);
        }
      }
    },
    [meetingData]
  );

  // Voice Pipeline Hook
  const voicePipeline = useVoicePipeline({
    voice: "aura-asteria-en",
    autoInterrupt: true,
    onTranscript: (text, isFinal) => {
      if (isFinal && text.trim()) {
        // Add final transcript entry
        const entry: TranscriptEntry = {
          id: `user-${Date.now()}`,
          role: "user",
          content: text,
          timestamp: Date.now(),
        };
        setTranscript((prev) => {
          // Remove any interim entries and add the final one
          const filtered = prev.filter((e) => !e.isInterim);
          return [...filtered, entry];
        });
        interimTranscriptRef.current = "";

        // Process the user message with AI
        processUserMessage(text);
      } else if (!isFinal) {
        // Update interim transcript
        interimTranscriptRef.current = text;
        setTranscript((prev) => {
          const filtered = prev.filter((e) => !e.isInterim);
          return [
            ...filtered,
            {
              id: `user-interim-${Date.now()}`,
              role: "user",
              content: text,
              timestamp: Date.now(),
              isInterim: true,
            },
          ];
        });
      }
    },
    onStateChange: (state: VoicePipelineState) => {
      // Map voice pipeline state to meeting UI state
      if (!isVoicePipelineActive.current) return;

      switch (state) {
        case "speaking":
          setMeetingState("AI_SPEAKING");
          break;
        case "listening":
          setMeetingState("IN_PROGRESS");
          break;
        case "processing":
          setMeetingState("PROCESSING");
          break;
        case "error":
          setError("Voice connection error. Please try again.");
          break;
      }
    },
    onVoiceActivity: (isActive, level) => {
      setVoiceLevel(level);
      if (isActive && meetingState === "IN_PROGRESS") {
        setMeetingState("USER_SPEAKING");
      } else if (!isActive && meetingState === "USER_SPEAKING") {
        setMeetingState("IN_PROGRESS");
      }
    },
    onError: (err) => {
      console.error("Voice pipeline error:", err);
      setError(err.message || "Voice connection error");
    },
  });

  // Keep voice pipeline ref updated
  useEffect(() => {
    voicePipelineRef.current = voicePipeline;
  }, [voicePipeline]);

  // Fetch user profile and commitments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, goalsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/goals"),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }

        if (goalsRes.ok) {
          const goalsData = await goalsRes.json();
          setCommitments(
            goalsData.map(
              (g: CommitmentPreview & { id: string; title: string }) => ({
                id: g.id,
                title: g.title,
                type: g.type || "DAILY",
                priority: g.priority || "DEFAULT",
                status: g.status || "ACTIVE",
              })
            )
          );
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load your data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Start meeting with voice pipeline
  const handleJoinMeeting = useCallback(async () => {
    setMeetingState("CONNECTING");
    setError(null);

    try {
      // Create meeting record first
      const response = await fetch("/api/meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to start meeting");
      }

      const meeting = await response.json();
      setMeetingData(meeting);
      setStartTime(Date.now());

      // Try to start voice pipeline
      let voiceEnabled = false;
      try {
        await voicePipeline.start();
        voiceEnabled = true;
        isVoicePipelineActive.current = true;
        console.log("[Meeting] Voice pipeline started successfully");
      } catch (voiceErr) {
        console.warn("[Meeting] Voice pipeline failed to start:", voiceErr);
        // Continue without voice - will show transcript only
        isVoicePipelineActive.current = false;
      }

      setMeetingState("IN_PROGRESS");

      // Get AI-generated opening message
      let greeting: string;
      try {
        const chatResponse = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meetingId: meeting.id,
            action: "start",
          }),
        });

        if (chatResponse.ok) {
          const chatData = await chatResponse.json();
          greeting = chatData.response;
          // Update phase if returned
          if (chatData.phase) {
            setMeetingData((prev) =>
              prev ? { ...prev, phase: chatData.phase } : prev
            );
          }
        } else {
          // Fallback to simple greeting
          const activeCount = commitments.filter(
            (c) => c.status === "ACTIVE"
          ).length;
          const name = user?.name?.split(" ")[0] || "there";
          const timeOfDay = getTimeOfDay();
          greeting = `Good ${timeOfDay}, ${name}. Let's review your commitments. You have ${activeCount} active items to discuss.`;
        }
      } catch (chatErr) {
        console.warn("[Meeting] Failed to get AI opening:", chatErr);
        // Fallback greeting
        const activeCount = commitments.filter(
          (c) => c.status === "ACTIVE"
        ).length;
        const name = user?.name?.split(" ")[0] || "there";
        const timeOfDay = getTimeOfDay();
        greeting = `Good ${timeOfDay}, ${name}. Let's review your commitments. You have ${activeCount} active items to discuss.`;
      }

      // Add AI greeting to transcript
      const greetingEntry: TranscriptEntry = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: greeting,
        timestamp: Date.now(),
      };
      setTranscript([greetingEntry]);

      // Speak the greeting if voice pipeline started successfully
      if (voiceEnabled) {
        console.log("[Meeting] Speaking greeting...");
        setMeetingState("AI_SPEAKING");
        try {
          await voicePipeline.speak(greeting);
          console.log("[Meeting] Greeting spoken");
          setMeetingState("IN_PROGRESS");
        } catch (speakErr) {
          console.warn("[Meeting] Failed to speak greeting:", speakErr);
          setMeetingState("IN_PROGRESS");
        }
      } else {
        console.log("[Meeting] Voice not enabled, skipping TTS");
      }
    } catch (err) {
      console.error("Error starting meeting:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start meeting";

      // Check for specific error types
      if (
        errorMessage.includes("microphone") ||
        errorMessage.includes("getUserMedia")
      ) {
        setError(
          "Microphone access is required for the meeting. Please allow access and try again."
        );
      } else if (
        errorMessage.includes("token") ||
        errorMessage.includes("Deepgram")
      ) {
        setError("Voice service unavailable. Please check your configuration.");
      } else {
        setError(errorMessage);
      }

      setMeetingState("READY");
      isVoicePipelineActive.current = false;
    }
  }, [user?.name, commitments, voicePipeline]);

  // End meeting
  const handleEndMeeting = useCallback(async () => {
    setMeetingState("ENDING");
    isVoicePipelineActive.current = false;
    shouldEndMeetingRef.current = false;

    // Stop voice pipeline
    voicePipeline.stop();

    try {
      if (meetingData?.id) {
        // Filter out interim entries for final transcript
        const finalTranscript = transcript.filter((e) => !e.isInterim);

        // End meeting on server
        const response = await fetch(`/api/meeting/${meetingData.id}/end`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: finalTranscript }),
        });

        if (response.ok) {
          const completedMeeting = await response.json();
          setMeetingData(completedMeeting);
        }
      }
    } catch (err) {
      console.error("Error ending meeting:", err);
    }

    setMeetingState("COMPLETED");
  }, [meetingData?.id, transcript, voicePipeline]);

  // Effect to handle AI-triggered meeting end
  useEffect(() => {
    if (
      shouldEndMeetingRef.current &&
      meetingState !== "ENDING" &&
      meetingState !== "COMPLETED"
    ) {
      handleEndMeeting();
    }
  }, [meetingState, handleEndMeeting]);

  // Handle max duration reached
  const handleMaxDurationReached = useCallback(async () => {
    // Add and speak closing message
    const closingMessage =
      "We've reached our time limit. Let's wrap up. Remember to follow through on your commitments. See you next time.";

    const closingEntry: TranscriptEntry = {
      id: `ai-closing-${Date.now()}`,
      role: "ai",
      content: closingMessage,
      timestamp: Date.now(),
    };
    setTranscript((prev) => [...prev, closingEntry]);

    // Speak the closing message if voice is available
    if (isVoicePipelineActive.current && voicePipeline.isReady) {
      try {
        await voicePipeline.speak(closingMessage);
      } catch {
        // Ignore TTS errors during closing
      }
    }

    // Auto-end meeting after TTS completes or timeout
    setTimeout(() => {
      handleEndMeeting();
    }, 4000);
  }, [handleEndMeeting, voicePipeline]);

  // Toggle mute
  const handleToggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    voicePipeline.setMuted(newMutedState);
  }, [isMuted, voicePipeline]);

  // Navigate back to dashboard
  const handleBackToDashboard = useCallback(() => {
    // Ensure voice pipeline is stopped
    voicePipeline.stop();
    router.push("/dashboard");
  }, [router, voicePipeline]);

  // Retry after error
  const handleRetry = useCallback(() => {
    setError(null);
    setMeetingState("READY");
    setTranscript([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      voicePipeline.stop();
    };
  }, [voicePipeline]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-[#156d95] rounded-full animate-spin" />
      </div>
    );
  }

  // Error state
  if (error && meetingState === "READY") {
    return (
      <div className="min-h-screen bg-zinc-950">
        <ErrorState
          message={error}
          onRetry={handleRetry}
          onBackToDashboard={handleBackToDashboard}
        />
      </div>
    );
  }

  // Render based on meeting state
  return (
    <div className="min-h-screen bg-zinc-950">
      {meetingState === "READY" && (
        <ReadyState
          userName={user?.name || ""}
          commitments={commitments}
          onJoinMeeting={handleJoinMeeting}
          isLoading={false}
        />
      )}

      {meetingState === "CONNECTING" && <ConnectingState />}

      {(meetingState === "IN_PROGRESS" ||
        meetingState === "AI_SPEAKING" ||
        meetingState === "USER_SPEAKING" ||
        meetingState === "PROCESSING" ||
        meetingState === "ENDING") && (
        <MeetingRoom
          state={meetingState}
          transcript={transcript}
          startTime={startTime}
          isMuted={isMuted}
          isTranscriptExpanded={isTranscriptExpanded}
          currentPhase={meetingData?.phase}
          onToggleMute={handleToggleMute}
          onEndMeeting={handleEndMeeting}
          onToggleTranscript={() => setIsTranscriptExpanded((prev) => !prev)}
          onMaxDurationReached={handleMaxDurationReached}
        />
      )}

      {meetingState === "COMPLETED" && meetingData && (
        <CompletedState
          meeting={meetingData}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </div>
  );
}

// Helper function
function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
