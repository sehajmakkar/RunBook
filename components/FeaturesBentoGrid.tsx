"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/registry/magicui/animated-beam";
import {
  FileDescriptionIcon,
  CheckedIcon,
  QuestionMarkIcon,
  ChartHistogramIcon,
  LockIcon,
  type AnimatedIconHandle,
} from "@/components/animated-icons";

// Animation variants for the container to stagger children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Animation variants for each grid item
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 10,
    },
  },
};

// Shared card wrapper with hover effects
const BentoCard = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border bg-card p-6",
        "transition-all duration-300 hover:shadow-lg hover:border-foreground/20",
        "dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Voice Meetings Card - Tall card with animated waveform
const VoiceMeetingsCard = () => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <BentoCard className="h-full flex flex-col justify-between bg-gradient-to-br from-card via-card to-secondary/30 dark:to-secondary/10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 dark:bg-foreground/10 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground">
            Voice-First
          </span>
        </div>
        <h3 className="text-2xl font-semibold text-foreground mb-2">
          Voice Meetings
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Scheduled voice calls with your AI manager. No text, no excuses—just
          real accountability.
        </p>
      </div>

      {/* Animated Voice Waveform */}
      <div
        className="relative flex items-center justify-center gap-1 h-32 mt-6"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 rounded-full bg-gradient-to-t from-foreground/20 to-foreground/60 dark:from-foreground/30 dark:to-foreground/80"
            animate={{
              height: isHovered
                ? [20, 40 + Math.random() * 40, 20]
                : [20, 30 + Math.sin(i * 0.5) * 10, 20],
              opacity: isHovered ? 1 : 0.6,
            }}
            transition={{
              duration: isHovered ? 0.4 : 1.5,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.05,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Microphone Icon */}
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            className="text-foreground/40"
          >
            <path
              d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>

      {/* Meeting Time Display */}
      <motion.div
        className="mt-8 p-4 rounded-2xl bg-foreground/5 dark:bg-foreground/5 border border-border"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Next Stand-up</p>
            <p className="text-lg font-semibold text-foreground">9:00 AM</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-foreground"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M12 6v6l4 2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </motion.div>
    </BentoCard>
  );
};

// Goal Tracking Card - Animated checkboxes
const GoalTrackingCard = () => {
  const [checkedItems, setCheckedItems] = React.useState([true, true, false]);
  const goals = ["Ship landing page", "Review PRs", "Update docs"];

  const toggleItem = (index: number) => {
    setCheckedItems((prev) => {
      const newItems = [...prev];
      newItems[index] = !newItems[index];
      return newItems;
    });
  };

  return (
    <BentoCard className="h-full">
      <h3 className="text-lg font-semibold text-foreground mb-1">
        Goal Tracking
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Your commitments, locked in
      </p>

      <div className="space-y-2">
        {goals.map((goal, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50 dark:bg-secondary/30 cursor-pointer"
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleItem(i)}
          >
            <motion.div
              className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                checkedItems[i]
                  ? "bg-foreground border-foreground"
                  : "border-muted-foreground/40"
              )}
              animate={{ scale: checkedItems[i] ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.2 }}
            >
              {checkedItems[i] && (
                <motion.svg
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-background"
                >
                  <motion.path
                    d="M5 12l5 5L20 7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              )}
            </motion.div>
            <span
              className={cn(
                "text-sm transition-all",
                checkedItems[i]
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              )}
            >
              {goal}
            </span>
          </motion.div>
        ))}
      </div>
    </BentoCard>
  );
};

// Circle component for memory nodes
const Circle = React.forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-10 items-center justify-center rounded-full border-2 border-border bg-card p-2 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        "dark:bg-card dark:shadow-[0_0_20px_-12px_rgba(255,255,255,0.1)]",
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

// Memory-related icons
const MemoryIcons = {
  brain: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-foreground"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M12 18v-5" />
      <path d="M8 9h8" />
    </svg>
  ),
  calendar: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-foreground"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  target: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-foreground"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  alertTriangle: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-foreground"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  ),
  trendingUp: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-foreground"
    >
      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
      <polyline points="16,7 22,7 22,13" />
    </svg>
  ),
  messageCircle: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-foreground"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  ),
  user: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-foreground"
    >
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  ),
};

// Memory Card - Animated brain pattern with beam animations
const MemoryCard = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const div1Ref = React.useRef<HTMLDivElement>(null);
  const div2Ref = React.useRef<HTMLDivElement>(null);
  const div3Ref = React.useRef<HTMLDivElement>(null);
  const div4Ref = React.useRef<HTMLDivElement>(null);
  const div5Ref = React.useRef<HTMLDivElement>(null);
  const div6Ref = React.useRef<HTMLDivElement>(null);
  const div7Ref = React.useRef<HTMLDivElement>(null);

  return (
    <BentoCard className="h-full relative overflow-hidden">
      <h3 className="text-lg font-semibold text-foreground mb-1">
        Long-term Memory
      </h3>
      <p className="text-xs text-muted-foreground mb-2">
        AI remembers everything
      </p>

      {/* Animated Memory Network */}
      <div
        className="relative flex h-40 w-full items-center justify-center overflow-hidden"
        ref={containerRef}
      >
        <div className="flex size-full max-h-[200px] flex-col items-stretch justify-between gap-4">
          <div className="flex flex-row items-center justify-between">
            <Circle ref={div1Ref}>
              <MemoryIcons.calendar />
            </Circle>
            <Circle ref={div5Ref}>
              <MemoryIcons.target />
            </Circle>
          </div>
          <div className="flex flex-row items-center justify-between">
            <Circle ref={div2Ref}>
              <MemoryIcons.alertTriangle />
            </Circle>
            <Circle ref={div4Ref} className="size-12">
              <MemoryIcons.brain />
            </Circle>
            <Circle ref={div6Ref}>
              <MemoryIcons.trendingUp />
            </Circle>
          </div>
          <div className="flex flex-row items-center justify-between">
            <Circle ref={div3Ref}>
              <MemoryIcons.messageCircle />
            </Circle>
            <Circle ref={div7Ref}>
              <MemoryIcons.user />
            </Circle>
          </div>
        </div>

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div1Ref}
          toRef={div4Ref}
          curvature={-50}
          endYOffset={-5}
          gradientStartColor="hsl(var(--foreground))"
          gradientStopColor="hsl(var(--muted-foreground))"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div2Ref}
          toRef={div4Ref}
          gradientStartColor="hsl(var(--foreground))"
          gradientStopColor="hsl(var(--muted-foreground))"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div3Ref}
          toRef={div4Ref}
          curvature={50}
          endYOffset={5}
          gradientStartColor="hsl(var(--foreground))"
          gradientStopColor="hsl(var(--muted-foreground))"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div5Ref}
          toRef={div4Ref}
          curvature={-50}
          endYOffset={-5}
          reverse
          gradientStartColor="hsl(var(--foreground))"
          gradientStopColor="hsl(var(--muted-foreground))"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div6Ref}
          toRef={div4Ref}
          reverse
          gradientStartColor="hsl(var(--foreground))"
          gradientStopColor="hsl(var(--muted-foreground))"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div7Ref}
          toRef={div4Ref}
          curvature={50}
          endYOffset={5}
          reverse
          gradientStartColor="hsl(var(--foreground))"
          gradientStopColor="hsl(var(--muted-foreground))"
        />
      </div>

      {/* <div className="text-xs text-muted-foreground mt-1 text-center">
        Tracking patterns & excuses
      </div> */}
    </BentoCard>
  );
};

// Pattern Recognition Card
const PatternCard = () => {
  const [activePattern, setActivePattern] = React.useState(0);
  const patterns = [
    { label: "Over-commits", value: 73, color: "from-amber-500 to-orange-500" },
    { label: "Deadline slips", value: 42, color: "from-rose-500 to-pink-500" },
    {
      label: "Morning focus",
      value: 89,
      color: "from-emerald-500 to-teal-500",
    },
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActivePattern((prev) => (prev + 1) % patterns.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [patterns.length]);

  return (
    <BentoCard className="h-full">
      <h3 className="text-lg font-semibold text-foreground mb-1">
        Pattern Recognition
      </h3>
      <p className="text-xs text-muted-foreground mb-7">
        AI identifies behaviors
      </p>

      <div className="space-y-3">
        {patterns.map((pattern, i) => (
          <motion.div
            key={i}
            className="relative"
            animate={{ opacity: activePattern === i ? 1 : 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{pattern.label}</span>
              <motion.span
                className="text-foreground font-medium"
                animate={{ scale: activePattern === i ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                {pattern.value}%
              </motion.span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full bg-gradient-to-r",
                  pattern.color
                )}
                initial={{ width: 0 }}
                animate={{ width: `${pattern.value}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </BentoCard>
  );
};

// Accountability Card - Commitment Ring with micro-interactions
const AccountabilityCard = () => {
  const [hoveredSegment, setHoveredSegment] = React.useState<number | null>(
    null
  );
  const [isHovered, setIsHovered] = React.useState(false);

  const baseScore = 55;
  const targetScore = 100;
  const circumference = 2 * Math.PI * 45;

  // Animated score value
  const scoreMotion = useMotionValue(baseScore);
  const scoreSpring = useSpring(scoreMotion, { stiffness: 100, damping: 20 });
  const [displayScore, setDisplayScore] = React.useState(baseScore);

  // Update score on hover
  React.useEffect(() => {
    scoreMotion.set(isHovered ? targetScore : baseScore);
  }, [isHovered, scoreMotion]);

  // Subscribe to spring changes to update displayed number
  React.useEffect(() => {
    const unsubscribe = scoreSpring.on("change", (latest) => {
      setDisplayScore(Math.round(latest));
    });
    return unsubscribe;
  }, [scoreSpring]);

  // Calculate offset based on animated score
  const scoreOffset = useTransform(
    scoreSpring,
    (value) => circumference - (value / 100) * circumference
  );

  const commitments = [
    {
      label: "Kept",
      value: 12,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500",
    },
    {
      label: "Pending",
      value: 3,
      color: "text-amber-500",
      bgColor: "bg-amber-500",
    },
    {
      label: "Missed",
      value: 1,
      color: "text-rose-500",
      bgColor: "bg-rose-500",
    },
  ];

  return (
    <BentoCard
      className="h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Accountability
        </h3>
        <p className="text-xs text-muted-foreground">Your commitment score</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Circular Progress Ring */}
        <div className="relative shrink-0">
          <svg width="100" height="100" className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-secondary"
            />
            {/* Progress ring */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              style={{ strokeDashoffset: scoreOffset }}
            />
            <defs>
              <linearGradient
                id="scoreGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">
              {displayScore}
            </span>
            <span className="text-[10px] text-muted-foreground">Score</span>
          </div>
        </div>

        {/* Commitment Stats */}
        <div className="flex-1 space-y-2">
          {commitments.map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-secondary/50"
              onMouseEnter={() => setHoveredSegment(i)}
              onMouseLeave={() => setHoveredSegment(null)}
              animate={{
                x: hoveredSegment === i ? 4 : 0,
                backgroundColor:
                  hoveredSegment === i ? "var(--secondary)" : "transparent",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className={cn("w-2.5 h-2.5 rounded-full", item.bgColor)} />
              <span className="text-xs text-muted-foreground flex-1">
                {item.label}
              </span>
              <span className={cn("text-sm font-semibold", item.color)}>
                {item.value}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </BentoCard>
  );
};

// Meeting Flow Card - Wide card showing the 5-step process with animated icons
const MeetingFlowCard = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const prevActiveStep = React.useRef(activeStep);

  // Refs for each icon to control animations programmatically
  const iconRefs = React.useRef<(AnimatedIconHandle | null)[]>([]);

  const steps = [
    {
      Icon: FileDescriptionIcon,
      label: "Review",
      desc: "Past commitments",
    },
    {
      Icon: CheckedIcon,
      label: "Progress",
      desc: "What's done?",
    },
    {
      Icon: QuestionMarkIcon,
      label: "Interrogate",
      desc: "Why not done?",
    },
    {
      Icon: ChartHistogramIcon,
      label: "Patterns",
      desc: "Spot trends",
    },
    {
      Icon: LockIcon,
      label: "Lock-in",
      desc: "New commitments",
    },
  ];

  // Trigger animation when activeStep changes
  React.useEffect(() => {
    // Stop animation on previous step
    if (prevActiveStep.current !== activeStep) {
      iconRefs.current[prevActiveStep.current]?.stopAnimation();
    }
    // Start animation on new active step
    iconRefs.current[activeStep]?.startAnimation();
    prevActiveStep.current = activeStep;
  }, [activeStep]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [steps.length]);

  // Handle hover to animate icon only (without changing active step)
  const handleIconHoverStart = (index: number) => {
    iconRefs.current[index]?.startAnimation();
  };

  const handleIconHoverEnd = (index: number) => {
    iconRefs.current[index]?.stopAnimation();
  };

  return (
    <BentoCard className="h-full">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Meeting Flow
          </h3>
          <p className="text-xs text-muted-foreground">
            Structured 5-step accountability
          </p>
        </div>
        <div className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary">
          ~15 min
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <motion.div
              className="flex flex-col items-center flex-1 cursor-pointer"
              animate={{
                scale: activeStep === i ? 1.05 : 1,
                opacity: activeStep === i ? 1 : 0.5,
              }}
              transition={{ duration: 0.3 }}
              onMouseEnter={() => handleIconHoverStart(i)}
              onMouseLeave={() => handleIconHoverEnd(i)}
            >
              <motion.div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-2 transition-colors",
                  activeStep === i
                    ? "bg-foreground text-background shadow-lg"
                    : "bg-secondary text-foreground"
                )}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <step.Icon
                  ref={(el) => {
                    iconRefs.current[i] = el;
                  }}
                  size={20}
                />
              </motion.div>
              <span className="text-xs font-medium text-foreground">
                {step.label}
              </span>
              <span className="text-[10px] text-muted-foreground text-center">
                {step.desc}
              </span>
            </motion.div>

            {i < steps.length - 1 && (
              <motion.div
                className="flex-shrink-0 w-6 h-0.5 bg-border rounded-full"
                animate={{
                  backgroundColor:
                    activeStep > i ? "var(--foreground)" : "var(--border)",
                  scaleX: activeStep > i ? 1 : 0.5,
                }}
                transition={{ duration: 0.3 }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </BentoCard>
  );
};

// Main Export Component
interface FeaturesBentoGridProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const FeaturesBentoGrid = ({
  title = "Focus on what matters.",
  subtitle = "RunBook doesn't need integrations or complex setups. Just define your goals, choose your meeting time, and show up. The AI manager handles the rest.",
  className,
}: FeaturesBentoGridProps) => {
  return (
    <div className={cn("w-full py-24 bg-background", className)}>
      <div className="max-w-[680px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center mb-16"
        >
          <h2
            className="text-[40px] leading-tight font-normal text-foreground text-center tracking-tight mb-4"
            style={{
              fontFamily: "var(--font-figtree), Figtree",
              fontWeight: "400",
            }}
          >
            {title}
          </h2>
          <p
            className="text-lg leading-7 text-muted-foreground text-center max-w-[600px]"
            style={{
              fontFamily: "var(--font-figtree), Figtree",
            }}
          >
            {subtitle}
          </p>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className={cn(
            "grid w-full grid-cols-1 gap-4 md:grid-cols-3",
            "md:grid-rows-3",
            "auto-rows-[minmax(180px,auto)]"
          )}
        >
          {/* Slot 1: Voice Meetings (Spans 3 rows) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-1 md:row-span-3"
          >
            <VoiceMeetingsCard />
          </motion.div>

          {/* Slot 2: Goal Tracking */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-1 md:row-span-1"
          >
            <GoalTrackingCard />
          </motion.div>

          {/* Slot 3: Memory */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-1 md:row-span-1"
          >
            <MemoryCard />
          </motion.div>

          {/* Slot 4: Pattern Recognition */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-1 md:row-span-1"
          >
            <PatternCard />
          </motion.div>

          {/* Slot 5: Accountability */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-1 md:row-span-1"
          >
            <AccountabilityCard />
          </motion.div>

          {/* Slot 6: Meeting Flow (Spans 2 cols) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 md:row-span-1"
          >
            <MeetingFlowCard />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
