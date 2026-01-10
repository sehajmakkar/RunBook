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

  // Voice Pipeline Hook
  const voicePipeline = useVoicePipeline({
    voice: "aura-asteria-en",
    autoInterrupt: true,
    onTranscript: (text, isFinal) => {
      if (isFinal) {
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
      } else {
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
            goalsData.map((g: CommitmentPreview & { id: string; title: string }) => ({
              id: g.id,
              title: g.title,
              type: g.type || "DAILY",
              priority: g.priority || "DEFAULT",
              status: g.status || "ACTIVE",
            }))
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

  // Generate AI greeting message
  const generateGreeting = useCallback(() => {
    const activeCount = commitments.filter((c) => c.status === "ACTIVE").length;
    const name = user?.name?.split(" ")[0] || "there";
    const timeOfDay = getTimeOfDay();
    
    return `Good ${timeOfDay}, ${name}. Let's review your commitments. I see you have ${activeCount} active items to discuss. Let's start with your progress.`;
  }, [user?.name, commitments]);

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

      // Add AI greeting to transcript
      const greeting = generateGreeting();
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
        try {
          await voicePipeline.speak(greeting);
          console.log("[Meeting] Greeting spoken");
        } catch (speakErr) {
          console.warn("[Meeting] Failed to speak greeting:", speakErr);
        }
      } else {
        console.log("[Meeting] Voice not enabled, skipping TTS");
      }

    } catch (err) {
      console.error("Error starting meeting:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to start meeting";
      
      // Check for specific error types
      if (errorMessage.includes("microphone") || errorMessage.includes("getUserMedia")) {
        setError("Microphone access is required for the meeting. Please allow access and try again.");
      } else if (errorMessage.includes("token") || errorMessage.includes("Deepgram")) {
        setError("Voice service unavailable. Please check your configuration.");
      } else {
        setError(errorMessage);
      }
      
      setMeetingState("READY");
      isVoicePipelineActive.current = false;
    }
  }, [generateGreeting, voicePipeline]);

  // End meeting
  const handleEndMeeting = useCallback(async () => {
    setMeetingState("ENDING");
    isVoicePipelineActive.current = false;

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

  // Handle max duration reached
  const handleMaxDurationReached = useCallback(async () => {
    // Add and speak closing message
    const closingMessage = "We've reached our time limit. Let's wrap up. Remember to follow through on your commitments. See you next time.";
    
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
