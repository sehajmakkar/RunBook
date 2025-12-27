"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
type CaseStudy = {
  id: string;
  company: string;
  logo: React.ReactNode;
  title: string;
  features: string[];
  quote: string;
  attribution: string;
  accentColor: string;
  cards: {
    type: "slack" | "meeting" | "sentiment" | "notion" | "stripe" | "figma";
    delay: number;
    zIndex: number;
  }[];
};
const caseStudies: CaseStudy[] = [
  {
    id: "notion",
    company: "Sarah M.",
    logo: (
      <svg
        fill="none"
        height="48"
        viewBox="0 0 38 48"
        width="38"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m14.25 5c0 7.8701-6.37994 14.25-14.25 14.25v9.5h14.25v14.25h9.5c0-7.8701 6.3799-14.25 14.25-14.25v-9.5h-14.25v-14.25z"
          fill="#16b364"
        />
      </svg>
    ),
    title:
      "Sarah uses RunBook to stay accountable for her side project while working a full-time job.",
    features: ["Daily Standups", "Goal Tracking", "Pattern Recognition"],
    quote:
      "RunBook is the only reason my side project is still alive. The voice meetings create real pressure—I can't fake my way through them like I could with a todo app.",
    attribution: "Sarah M., Remote Software Engineer",
    accentColor: "#16b364",
    cards: [
      {
        type: "notion",
        delay: 0,
        zIndex: 1,
      },
      {
        type: "slack",
        delay: 0.1,
        zIndex: 2,
      },
    ],
  },
  {
    id: "cloudwatch",
    company: "Marcus W.",
    logo: (
      <svg
        fill="none"
        height="48"
        viewBox="0 0 192 48"
        width="192"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter
          id="a"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="54"
          width="48"
          x="0"
          y="-3"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            in="SourceGraphic"
            in2="BackgroundImageFix"
            mode="normal"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="-3" />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
          />
          <feBlend
            in2="shape"
            mode="normal"
            result="effect1_innerShadow_3046_38742"
          />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="3" />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"
          />
          <feBlend
            in2="effect1_innerShadow_3046_38742"
            mode="normal"
            result="effect2_innerShadow_3046_38742"
          />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feMorphology
            in="SourceAlpha"
            operator="erode"
            radius="1"
            result="effect3_innerShadow_3046_38742"
          />
          <feOffset />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.24 0"
          />
          <feBlend
            in2="effect2_innerShadow_3046_38742"
            mode="normal"
            result="effect3_innerShadow_3046_38742"
          />
        </filter>
        <g filter="url(#a)">
          <rect fill="url(#b)" height="48" rx="12" width="48" />
        </g>
        <g clipPath="url(#c)">
          <path
            d="m23.9995 14.25c5.3848 0 9.7505 4.3658 9.7505 9.7506s-4.3657 9.7505-9.7505 9.7505-9.7506-4.3657-9.7506-9.7505 4.3658-9.7506 9.7506-9.7506z"
            fill="#fff"
          />
          <path
            d="m23.9995 18.0005c-3.3137 0-6 2.6863-6 6s2.6863 6 6 6 6-2.6863 6-6-2.6863-6-6-6z"
            fill="url(#d)"
          />
        </g>
        <text
          fill="currentColor"
          fontFamily="Inter, sans-serif"
          fontSize="20"
          fontWeight="600"
          x="58"
          y="32"
        >
          ScaleVenture
        </text>
        <defs>
          <linearGradient
            id="b"
            gradientUnits="userSpaceOnUse"
            x1="24"
            x2="24"
            y1="0"
            y2="48"
          >
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient
            id="d"
            gradientUnits="userSpaceOnUse"
            x1="23.9995"
            x2="23.9995"
            y1="18.0005"
            y2="30.0005"
          >
            <stop stopColor="#60a5fa" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
          <clipPath id="c">
            <rect fill="#fff" height="36" rx="6" width="36" x="6" y="6" />
          </clipPath>
        </defs>
      </svg>
    ),
    title:
      "Marcus uses RunBook to maintain consistency with his fitness and learning goals after struggling with motivation.",
    features: ["Weekly Reviews", "Commitment Lock-In", "Behavior Analysis"],
    quote:
      "The AI remembers when I make excuses. After three weeks of 'I'll do it tomorrow,' it called me out. That's when things changed.",
    attribution: "Marcus W., Solo Founder",
    accentColor: "#3b82f6",
    cards: [
      {
        type: "stripe",
        delay: 0,
        zIndex: 1,
      },
      {
        type: "slack",
        delay: 0.1,
        zIndex: 2,
      },
    ],
  },
  {
    id: "eightball",
    company: "Jordan R.",
    logo: (
      <svg
        fill="none"
        height="48"
        viewBox="0 0 151 48"
        width="151"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#0A0D12">
          <path
            clipRule="evenodd"
            d="m20 44c11.0457 0 20-8.9543 20-20s-8.9543-20-20-20-20 8.9543-20 20 8.9543 20 20 20zm5-16c4.9706 0 9-4.0294 9-9s-4.0294-9-9-9-9 4.0294-9 9 4.0294 9 9 9z"
            fillRule="evenodd"
          />
        </g>
      </svg>
    ),
    title:
      "Jordan uses RunBook to build a consistent writing habit and finish their first book project.",
    features: ["Daily Accountability", "Progress Tracking", "Goal Setting"],
    quote:
      "I've tried every productivity app. RunBook is the first one that actually makes me show up. The voice meetings feel real—like I'm answering to an actual person.",
    attribution: "Jordan R., Content Creator",
    accentColor: "#0A0D12",
    cards: [
      {
        type: "meeting",
        delay: 0,
        zIndex: 1,
      },
      {
        type: "slack",
        delay: 0.1,
        zIndex: 2,
      },
    ],
  },
  {
    id: "coreos",
    company: "Alex T.",
    logo: (
      <svg
        fill="none"
        height="48"
        viewBox="0 0 155 48"
        width="155"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter
          id="a"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="54"
          width="48"
          x="0"
          y="-3"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            in="SourceGraphic"
            in2="BackgroundImageFix"
            mode="normal"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="-3" />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
          />
          <feBlend
            in2="shape"
            mode="normal"
            result="effect1_innerShadow_3046_38745"
          />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="3" />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0"
          />
          <feBlend
            in2="effect1_innerShadow_3046_38745"
            mode="normal"
            result="effect2_innerShadow_3046_38745"
          />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feMorphology
            in="SourceAlpha"
            operator="erode"
            radius="1"
            result="effect3_innerShadow_3046_38745"
          />
          <feOffset />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.24 0"
          />
          <feBlend
            in2="effect2_innerShadow_3046_38745"
            mode="normal"
            result="effect3_innerShadow_3046_38745"
          />
        </filter>
        <filter
          id="b"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="42"
          width="37.5"
          x="5.25"
          y="5.25"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="0.375" />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
          />
          <feBlend
            in2="BackgroundImageFix"
            mode="normal"
            result="effect1_innerShadow_3046_38745"
          />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="1.5" />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"
          />
          <feBlend
            in2="effect1_innerShadow_3046_38745"
            mode="normal"
            result="effect2_innerShadow_3046_38745"
          />
        </filter>
        <g filter="url(#a)">
          <rect fill="#101828" height="48" rx="12" width="48" />
        </g>
        <g filter="url(#b)">
          <path d="m24 6c-4.28696 0-8.11479 1.94663-10.66502 5.00196-.28444.34056-.07907.8481.36214.8481h2.30574c.2313 0 .44848-.10604.59314-.28956 1.8933-2.39892 4.7914-3.93296 8.01874-3.93296 2.0486 0 3.9438.60814 5.5313 1.6523.1969.1296.4546.1263.648-.0083l1.4976-1.04256c.3563-.24804.2998-.80964-.1033-1.01724-2.0652-1.06164-4.4124-1.66192-6.8911-1.66192zm10.6642 4.999c-.2843-.34042-.7198-.41856-1.0052-.0835l-1.0848 1.2738c-.1631.1915-.2196.4512-.1497.6892.5696 1.93848.8827 3.99358.8827 6.12048 0 2.1271-.3131 4.1822-.8827 6.1207-.0699.238-.0134.4977.1497.6892l1.0848 1.2738c.2854.3351.7209.257 1.98-2.1.88-.52 1.91-.78 3.09-.78 1.8399 0 3.2699.58 4.2899 1.74s1.53 2.86 1.53 5.1v8.4h-3.84v-8.04c0-1.28-.26-2.26-.78-2.94s-1.3299-1.02-2.4299-10.11c-1.08 0-1.89.3-2.61.9s-1.19 1.38-1.44 2.34z" />
          <path d="m113.945 33.3599c-1.4 0-2.65-.34-3.75-1.02s-1.97-1.61-2.61-2.79-.96-2.52-.96-4.02.32-2.83.96-3.99c.64-1.18 1.51-2.1 2.61-2.76 1.1-.68 2.35-1.02 3.75-10.11h7.92c-.1-.96-.51-1.74-1.23-2.34-.7-.6-1.58-.9-2.64-.9-1.02 0-1.89.3-2.61.9s-1.19 1.38-1.44 2.34z" />
          <path d="m136.364 33.3599c-1.54 0-2.9-.34-4.08-1.02-1.16-.7-2.07-1.64-2.73-2.82-.66-1.2-.99-2.52-.99-3.96s.34-2.77 1.02-3.99c.68-1.22 1.61-2.18 2.79-2.88 1.18-.7 2.52-1.05 4.02-10.11 1.46 0 2.76.34 3.9 1.02 1.14.68 2.03 1.63 2.67 2.85.64 1.2.96 2.58.96 4.14v1.08h-11.7c.12 1.08.57 1.95 1.35 2.61s1.73 .99 2.85 .99c.86 0 1.61-.18 2.25-.54.66-.38 1.16-.91 1.5-1.59l3.27 1.44c-.66 1.28-1.66 2.3-3 3.06-1.32.76-2.86 1.14-4.62 1.14zm-3.84-10.11h7.92c-.1-.96-.51-1.74-1.23-2.34-.7-.6-1.58-.9-2.64-.9-1.02 0-1.89.3-2.61.9s-1.19 1.38-1.44 2.34z" />
          <path d="m161.793 35.2199 3.36-7.68-6.78-15.66h4.26l4.38 10.98 4.29-10.98h4.17l-9.81 23.34z" />
          <path d="m166.629 32.9999v-14.88h3.39l.3 2.52c.46-.88 1.12-1.58 1.98-2.1.88-.52 1.91-.78 3.09-.78 1.8399 0 3.2699.58 4.2899 1.74s1.53 2.86 1.53 5.1v8.4h-3.84v-8.04c0-1.28-.26-2.26-.78-2.94s-1.3299-1.02-2.4299-10.11c-1.08 0-1.89.3-2.61.9s-1.19 1.38-1.44 2.34z" />
          <path d="m190.044 33.3599c-1.54 0-2.9-.34-4.08-1.02-1.16-.7-2.07-1.64-2.73-2.82-.66-1.2-.99-2.52-.99-3.96s.34-2.77 1.02-3.99c.68-1.22 1.61-2.18 2.79-2.88 1.18-.7 2.52-1.05 4.02-10.11 1.46 0 2.76.34 3.9 1.02 1.14.68 2.03 1.63 2.67 2.85.64 1.2.96 2.58.96 4.14v1.08h-11.7c.12 1.08.57 1.95 1.35 2.61s1.73 .99 2.85 .99c.86 0 1.61-.18 2.25-.54.66-.38 1.16-.91 1.5-1.59l3.27 1.44c-.66 1.28-1.66 2.3-3 3.06-1.32.76-2.86 1.14-4.62 1.14zm-3.84-10.11h7.92c-.1-.96-.51-1.74-1.23-2.34-.7-.6-1.58-.9-2.64-.9-1.02 0-1.89.3-2.61.9s-1.19 1.38-1.44 2.34z" />
        </g>
      </svg>
    ),
    title:
      "Alex uses RunBook to manage multiple goals across work, fitness, and personal projects without losing focus.",
    features: ["Multi-Goal Tracking", "Priority Management", "Time Estimation"],
    quote:
      "RunBook helps me be honest about what I can actually commit to. The AI pushes back when I'm over-committing, which saves me from myself.",
    attribution: "Alex T., Product Manager",
    accentColor: "#155eef",
    cards: [
      {
        type: "figma",
        delay: 0,
        zIndex: 1,
      },
      {
        type: "meeting",
        delay: 0.1,
        zIndex: 2,
      },
    ],
  },
];
const FeatureBadge = ({ name }: { name: string }) => {
  const getIcon = (featureName: string) => {
    if (featureName.includes("Slack")) {
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 opacity-50"
        >
          <path
            d="M6 2C6 1.44772 5.55228 1 5 1C4.44772 1 4 1.44772 4 2V6C4 6.55228 4.44772 7 5 7C5.55228 7 6 6.55228 6 6V2Z"
            fill="#E01E5A"
          />
          <path
            d="M10 6C10.5523 6 11 5.55228 11 5C11 4.44772 10.55228 4 10 4H6V6H10Z"
            fill="#36C5F0"
          />
          <path
            d="M14 5C14 4.44772 13.5523 4 13 4C12.4477 4 12 4.44772 12 5V9C12 9.55228 12.4477 10 13 10C13.5523 10 14 9.55228 14 9V5Z"
            fill="#2EB67D"
          />
          <path
            d="M6 10C5.44772 10 5 10.4477 5 11C5 11.5523 5.44772 12 6 12H10V10H6Z"
            fill="#ECB22E"
          />
        </svg>
      );
    } else if (featureName.includes("Meeting")) {
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 opacity-50"
        >
          <path
            d="M2 4C2 3.44772 2.44772 3 3 3H9C9.55228 3 10 3.44772 10 4V10C10 10.55228 9.55228 11 9 11H3C2.44772 11 2 10.55228 2 10V4Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 5L13 3V11L10 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    } else if (featureName.includes("Sentiment")) {
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 opacity-50"
        >
          <path
            d="M3 9L5 11L8 8L13 13"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 5H13M3 5V13M13 5V13M3 13H13"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    return null;
  };
  return (
    <div className="flex items-center gap-2 bg-background/75 shadow-sm border border-border rounded-lg px-2 py-1 text-sm font-medium text-foreground">
      {getIcon(name)}
      {name}
    </div>
  );
};
const SlackCallCard = ({
  accentColor,
  delay,
  zIndex,
}: {
  accentColor: string;
  delay: number;
  zIndex: number;
}) => {
  return null;
};
const MeetingTranscriptCard = ({
  accentColor,
  delay,
  zIndex,
}: {
  accentColor: string;
  delay: number;
  zIndex: number;
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.6,
        ease: [0.76, 0, 0.24, 1],
        delay,
      }}
      className="absolute w-[380px] rounded-xl p-6 backdrop-blur-xl bg-card/85 dark:bg-card/90 shadow-lg border border-border/50"
      style={{
        transform: "translate(-190px, -70px)",
        zIndex,
      }}
    >
      <div className="flex flex-col space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">
            Meeting Summary
          </h4>
          <span className="text-xs text-muted-foreground">Today</span>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-muted/20 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">
              Goal Progress
            </div>
            <div className="text-sm font-semibold text-foreground">
              Writing: Chapter 5
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
              <div
                className="h-full rounded-full"
                style={{ width: "73%", backgroundColor: "#186d93" }}
              />
            </div>
          </div>

          <div className="p-3 bg-muted/20 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Commitment</div>
            <div className="text-sm text-foreground">
              Complete 2,000 words by next meeting
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
            <span className="text-sm text-foreground">Consistency streak</span>
            <span
              className="text-sm font-semibold"
              style={{ color: "#c86651" }}
            >
              12 days
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Next meeting:</span>{" "}
            Tomorrow 9:00 AM
          </div>
        </div>
      </div>
    </motion.div>
  );
};
const SentimentReportCard = ({
  accentColor,
  delay,
  zIndex,
}: {
  accentColor: string;
  delay: number;
  zIndex: number;
}) => {
  return null;
};
const NotionCollaborationCard = ({
  accentColor,
  delay,
  zIndex,
}: {
  accentColor: string;
  delay: number;
  zIndex: number;
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.6,
        ease: [0.76, 0, 0.24, 1],
        delay,
      }}
      className="absolute w-[380px] rounded-xl p-6 backdrop-blur-xl bg-card/85 dark:bg-card/90 shadow-lg border border-border/50"
      style={{
        transform: "translate(-200px, -80px)",
        zIndex,
      }}
    >
      <div className="flex flex-col space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">
            Team Alignment
          </h4>
          <span className="text-xs text-muted-foreground">Real-time</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#186d93" }}
              />
              <span className="text-sm text-foreground">Goal Completion</span>
            </div>
            <span
              className="text-sm font-semibold"
              style={{ color: "#186d93" }}
            >
              96%
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#c86651" }}
              />
              <span className="text-sm text-foreground">Commitment Rate</span>
            </div>
            <span
              className="text-sm font-semibold"
              style={{ color: "#c86651" }}
            >
              94%
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#186d93" }}
              />
              <span className="text-sm text-foreground">Progress Tracking</span>
            </div>
            <span
              className="text-sm font-semibold"
              style={{ color: "#186d93" }}
            >
              92%
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">12</span> active
            conversations
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StripeGlobalCard = ({
  accentColor,
  delay,
  zIndex,
}: {
  accentColor: string;
  delay: number;
  zIndex: number;
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.6,
        ease: [0.76, 0, 0.24, 1],
        delay,
      }}
      className="absolute w-[400px] rounded-xl p-6 backdrop-blur-xl bg-card/85 dark:bg-card/90 shadow-lg border border-border/50"
      style={{
        transform: "translate(-180px, -60px)",
        zIndex,
      }}
    >
      <div className="flex flex-col space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">
            Global Team Dynamics
          </h4>
          <span className="text-xs text-muted-foreground">Last 24h</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-muted/20 rounded-lg">
            <div className="text-2xl font-bold text-foreground">Wk 1</div>
            <div className="text-xs text-muted-foreground mt-1">Week 1</div>
            <div
              className="text-xs font-semibold mt-2"
              style={{ color: "#186d93" }}
            >
              On Track
            </div>
          </div>
          <div className="text-center p-3 bg-muted/20 rounded-lg">
            <div className="text-2xl font-bold text-foreground">Wk 2</div>
            <div className="text-xs text-muted-foreground mt-1">Week 2</div>
            <div
              className="text-xs font-semibold mt-2"
              style={{ color: "#c86651" }}
            >
              Review
            </div>
          </div>
          <div className="text-center p-3 bg-muted/20 rounded-lg">
            <div className="text-2xl font-bold text-foreground">Wk 3</div>
            <div className="text-xs text-muted-foreground mt-1">Week 3</div>
            <div
              className="text-xs font-semibold mt-2"
              style={{ color: "#186d93" }}
            >
              Active
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold text-foreground">+28%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: "87%", backgroundColor: "#186d93" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FigmaSprintCard = ({
  accentColor,
  delay,
  zIndex,
}: {
  accentColor: string;
  delay: number;
  zIndex: number;
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.6,
        ease: [0.76, 0, 0.24, 1],
        delay,
      }}
      className="absolute w-[380px] rounded-xl p-6 backdrop-blur-xl bg-card/85 dark:bg-card/90 shadow-lg border border-border/50"
      style={{
        transform: "translate(-190px, -70px)",
        zIndex,
      }}
    >
      <div className="flex flex-col space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: "#186d93" }}
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                <rect
                  x="3"
                  y="3"
                  width="10"
                  height="10"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Sprint Planning
              </h4>
              <p className="text-xs text-muted-foreground">Week 3 • Day 2</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
            <span className="text-sm text-foreground">
              Goal Completion Rate
            </span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full"
                  style={{ width: "94%", backgroundColor: "#186d93" }}
                />
              </div>
              <span className="text-xs font-semibold text-foreground">94%</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
            <span className="text-sm text-foreground">
              Accountability Score
            </span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full"
                  style={{ width: "89%", backgroundColor: "#c86651" }}
                />
              </div>
              <span className="text-xs font-semibold text-foreground">89%</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
            <span className="text-sm text-foreground">Pattern Recognition</span>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-semibold"
                style={{ color: "#186d93" }}
              >
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Goals in progress</span>
            <span className="font-semibold text-foreground">2</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const CaseStudiesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const currentStudy = caseStudies[currentIndex];
  const startAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      nextSlide();
    }, 5000);
  };
  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };
  useEffect(() => {
    if (isAutoPlaying) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    return () => stopAutoPlay();
  }, [isAutoPlaying, currentIndex]);
  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % caseStudies.length);
  };
  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + caseStudies.length) % caseStudies.length
    );
  };
  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };
  return (
    <div
      id="case-studies"
      className="w-full min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center py-24 px-8 overflow-x-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="max-w-7xl w-full overflow-x-hidden">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h1
            className="text-[40px] leading-tight font-normal text-foreground mb-6 tracking-tight"
            style={{
              fontWeight: "400",
              fontFamily: "var(--font-figtree), Figtree",
              fontSize: "40px",
            }}
          >
            Real Stories from Real Users
          </h1>
          <p
            className="text-lg leading-7 text-muted-foreground max-w-2xl mx-auto"
            style={{
              fontFamily: "var(--font-figtree), Figtree",
            }}
          >
            See how remote professionals, solo founders, and ambitious
            individuals use RunBook to turn goals into commitments and excuses
            into action.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 overflow-x-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStudy.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  },
                  opacity: {
                    duration: 0.2,
                  },
                }}
                className="space-y-6 overflow-x-hidden"
              >
                <div className="text-foreground/60">{currentStudy.logo}</div>

                <h2
                  className="text-4xl font-bold text-foreground leading-tight tracking-tight"
                  style={{
                    fontFamily: "var(--font-figtree), Figtree",
                    fontWeight: "400",
                    fontSize: "32px",
                  }}
                >
                  {currentStudy.title}
                </h2>

                <div className="flex flex-wrap gap-2">
                  {currentStudy.features.map((feature, idx) => (
                    <FeatureBadge key={idx} name={feature} />
                  ))}
                </div>

                <blockquote className="border-l-4 border-primary pl-6 py-2">
                  <p
                    className="text-lg leading-7 text-foreground/80 italic mb-3"
                    style={{
                      fontFamily: "var(--font-figtree), Figtree",
                    }}
                  >
                    "{currentStudy.quote}"
                  </p>
                  <footer
                    className="text-sm text-muted-foreground"
                    style={{
                      fontFamily: "var(--font-inter), Inter",
                    }}
                  >
                    {currentStudy.attribution}
                  </footer>
                </blockquote>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center gap-6">
              <div className="flex gap-2">
                {caseStudies.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? "w-8 bg-primary"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
                  aria-label="Previous slide"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M12.5 15L7.5 10L12.5 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
                  aria-label="Next slide"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M7.5 15L12.5 10L7.5 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Content - Card Visualization */}
          <div className="relative h-[500px] flex items-center justify-center overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStudy.id}
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 0.3,
                }}
                className="relative w-full h-full flex items-center justify-center overflow-x-hidden"
              >
                {currentStudy.id === "notion" && (
                  <>
                    <NotionCollaborationCard
                      accentColor={currentStudy.accentColor}
                      delay={0}
                      zIndex={1}
                    />
                    <SlackCallCard
                      accentColor={currentStudy.accentColor}
                      delay={0.1}
                      zIndex={2}
                    />
                  </>
                )}
                {currentStudy.id === "cloudwatch" && (
                  <>
                    <StripeGlobalCard
                      accentColor={currentStudy.accentColor}
                      delay={0}
                      zIndex={1}
                    />
                    <SlackCallCard
                      accentColor={currentStudy.accentColor}
                      delay={0.1}
                      zIndex={2}
                    />
                  </>
                )}
                {currentStudy.id === "eightball" && (
                  <>
                    <MeetingTranscriptCard
                      accentColor={currentStudy.accentColor}
                      delay={0}
                      zIndex={1}
                    />
                    <SlackCallCard
                      accentColor={currentStudy.accentColor}
                      delay={0.1}
                      zIndex={2}
                    />
                  </>
                )}
                {currentStudy.id === "coreos" && (
                  <>
                    <FigmaSprintCard
                      accentColor={currentStudy.accentColor}
                      delay={0}
                      zIndex={1}
                    />
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
