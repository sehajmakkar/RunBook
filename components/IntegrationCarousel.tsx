"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
type IntegrationApp = {
  name: string;
  logo: string;
};
type IntegrationCarouselProps = {
  buttonText?: string;
  buttonHref?: string;
  title?: string;
  subtitle?: string;
  topRowApps?: IntegrationApp[];
  bottomRowApps?: IntegrationApp[];
};
const defaultTopRowApps: IntegrationApp[] = [
  {
    name: "Integration 1",
    logo: "/images/logoipsum-389.png",
  },
  {
    name: "Integration 2",
    logo: "/images/logoipsum-407.png",
  },
  {
    name: "Integration 3",
    logo: "/images/logoipsum-379.png",
  },
  {
    name: "Integration 4",
    logo: "/images/logoipsum-374.png",
  },
  {
    name: "Integration 5",
    logo: "/images/logoipsum-381.png",
  },
  {
    name: "Integration 6",
    logo: "/images/logoipsum-401.png",
  },
  {
    name: "Integration 7",
    logo: "/images/logoipsum-403.png",
  },
  {
    name: "Integration 1",
    logo: "/images/logoipsum-389.png",
  },
  {
    name: "Integration 2",
    logo: "/images/logoipsum-407.png",
  },
  {
    name: "Integration 3",
    logo: "/images/logoipsum-379.png",
  },
  {
    name: "Integration 4",
    logo: "/images/logoipsum-374.png",
  },
  {
    name: "Integration 5",
    logo: "/images/logoipsum-381.png",
  },
];
const defaultBottomRowApps: IntegrationApp[] = [
  {
    name: "Integration 6",
    logo: "/images/logoipsum-401.png",
  },
  {
    name: "Integration 7",
    logo: "/images/logoipsum-403.png",
  },
  {
    name: "Integration 1",
    logo: "/images/logoipsum-389.png",
  },
  {
    name: "Integration 2",
    logo: "/images/logoipsum-407.png",
  },
  {
    name: "Integration 3",
    logo: "/images/logoipsum-379.png",
  },
  {
    name: "Integration 4",
    logo: "/images/logoipsum-374.png",
  },
  {
    name: "Integration 5",
    logo: "/images/logoipsum-381.png",
  },
  {
    name: "Integration 6",
    logo: "/images/logoipsum-401.png",
  },
  {
    name: "Integration 7",
    logo: "/images/logoipsum-403.png",
  },
  {
    name: "Integration 1",
    logo: "/images/logoipsum-389.png",
  },
  {
    name: "Integration 2",
    logo: "/images/logoipsum-407.png",
  },
  {
    name: "Integration 3",
    logo: "/images/logoipsum-379.png",
  },
];

// @component: IntegrationCarousel
export const IntegrationCarousel = ({
  buttonText = "See how it works",
  buttonHref = "#",
  title = "Focus on what matters.",
  subtitle = "RunBook doesn't need integrations or complex setups. Just define your goals, choose your meeting time, and show up. The AI manager handles the rest.",
  topRowApps = defaultTopRowApps,
  bottomRowApps = defaultBottomRowApps,
}: IntegrationCarouselProps) => {
  const topRowRef = useRef<HTMLDivElement>(null);
  const bottomRowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let topAnimationId: number;
    let bottomAnimationId: number;
    let topPosition = 0;
    let bottomPosition = 0;
    const animateTopRow = () => {
      if (topRowRef.current) {
        topPosition -= 0.5;
        if (Math.abs(topPosition) >= topRowRef.current.scrollWidth / 2) {
          topPosition = 0;
        }
        topRowRef.current.style.transform = `translateX(${topPosition}px)`;
      }
      topAnimationId = requestAnimationFrame(animateTopRow);
    };
    const animateBottomRow = () => {
      if (bottomRowRef.current) {
        bottomPosition -= 0.65;
        if (Math.abs(bottomPosition) >= bottomRowRef.current.scrollWidth / 2) {
          bottomPosition = 0;
        }
        bottomRowRef.current.style.transform = `translateX(${bottomPosition}px)`;
      }
      bottomAnimationId = requestAnimationFrame(animateBottomRow);
    };
    topAnimationId = requestAnimationFrame(animateTopRow);
    bottomAnimationId = requestAnimationFrame(animateBottomRow);
    return () => {
      cancelAnimationFrame(topAnimationId);
      cancelAnimationFrame(bottomAnimationId);
    };
  }, []);

  // @return
  return (
    <div className="w-full py-24 bg-background">
      <div className="max-w-[680px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center mb-20"
        >
          <div className="flex flex-col items-center gap-4">
            <h2
              className="text-[40px] leading-tight font-normal text-foreground text-center tracking-tight mb-0"
              style={{
                fontFamily: "var(--font-figtree), Figtree",
                fontWeight: "400",
                fontSize: "40px",
              }}
            >
              {title}
            </h2>
            <p
              className="text-lg leading-7 text-muted-foreground text-center max-w-[600px] mt-2"
              style={{
                fontFamily: "var(--font-figtree), Figtree",
              }}
            >
              {subtitle}
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="flex gap-3 mt-6"
          >
            <a
              href={buttonHref}
              className="inline-block px-5 py-2.5 rounded-full bg-card text-foreground text-[15px] font-medium leading-6 text-center whitespace-nowrap transition-all duration-75 ease-out w-[182px] cursor-pointer hover:shadow-lg border border-border"
            >
              {buttonText}
            </a>
          </motion.div>
        </motion.div>
      </div>

      <div className="h-[268px] -mt-6 mb-0 pb-0 relative overflow-hidden">
        <div
          ref={topRowRef}
          className="flex items-start gap-6 absolute top-6 whitespace-nowrap"
          style={{
            willChange: "transform",
          }}
        >
          {[...topRowApps, ...topRowApps].map((app, index) => (
            <div
              key={`top-${index}`}
              className="flex items-center justify-center w-24 h-24 rounded-3xl flex-shrink-0 bg-card border border-border shadow-sm"
            >
              <img
                src={app.logo || "/placeholder.svg"}
                alt={app.name}
                className="w-9 h-9 block object-contain"
              />
            </div>
          ))}
        </div>

        <div className="absolute top-0 right-0 bottom-0 w-60 h-[268px] z-10 pointer-events-none bg-gradient-to-l from-background to-transparent" />

        <div className="absolute top-0 left-0 bottom-0 w-60 h-[268px] z-10 pointer-events-none bg-gradient-to-r from-background to-transparent" />

        <div
          ref={bottomRowRef}
          className="flex items-start gap-6 absolute top-[148px] whitespace-nowrap"
          style={{
            willChange: "transform",
          }}
        >
          {[...bottomRowApps, ...bottomRowApps].map((app, index) => (
            <div
              key={`bottom-${index}`}
              className="flex items-center justify-center w-24 h-24 rounded-3xl flex-shrink-0 bg-card border border-border shadow-sm"
            >
              <img
                src={app.logo || "/placeholder.svg"}
                alt={app.name}
                className="w-9 h-9 block object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
