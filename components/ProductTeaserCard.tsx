"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";

type ProductTeaserCardProps = {
  dailyVolume?: string;
  dailyVolumeLabel?: string;
  subheadline?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
};

// Rotating text configuration with distinct color themes
const rotatingWords = [
  {
    word: "Manager",
    textColor: "#156d95",
    pillBg: "rgba(21, 109, 149, 0.12)",
    shadowColor: "rgba(21, 109, 149, 0.25)",
  },
  {
    word: "Partner",
    textColor: "#b5651d",
    pillBg: "rgba(181, 101, 29, 0.12)",
    shadowColor: "rgba(181, 101, 29, 0.25)",
  },
  {
    word: "Mentor",
    textColor: "#2d8659",
    pillBg: "rgba(45, 134, 89, 0.12)",
    shadowColor: "rgba(45, 134, 89, 0.25)",
  },
];

// @component: ProductTeaserCard
export const ProductTeaserCard = (props: ProductTeaserCardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const currentWord = rotatingWords[currentIndex];

  const {
    dailyVolume = "12,847",
    dailyVolumeLabel = "ACCOUNTABILITY MEETINGS COMPLETED",
    subheadline = "RunBook runs scheduled voice meetings to check in on your goals—just like a workplace stand-up. No more ignoring your to-do list. No more excuses. Just real accountability.",
    description = "Join remote professionals, solo founders, and productivity-focused individuals who use RunBook to turn goals into commitments. Experience the pressure of a real manager who remembers your promises and questions incomplete work.",
    primaryButtonText = "Start your first meeting",
    secondaryButtonText = "Learn how it works",
    primaryButtonHref = "#",
    secondaryButtonHref = "#",
  } = props;

  // @return
  return (
    <section
      id="home"
      className="w-full px-4 sm:px-6 md:px-8 pt-16 md:pt-24 lg:pt-32 pb-8 md:pb-12 lg:pb-16"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-3 md:gap-4 lg:gap-2">
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.8,
              ease: [0.645, 0.045, 0.355, 1],
            }}
            className="col-span-12 lg:col-span-6 bg-secondary rounded-2xl sm:rounded-3xl lg:rounded-[40px] p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 flex flex-col justify-end lg:aspect-square min-h-[400px] md:min-h-[500px] lg:min-h-0 overflow-hidden"
          >
            {/* <a
              href={primaryButtonHref}
              onClick={(e) => e.preventDefault()}
              className="flex flex-col gap-1 text-muted-foreground"
            >
              <motion.span
                initial={{
                  transform: "translateY(20px)",
                  opacity: 0,
                }}
                animate={{
                  transform: "translateY(0px)",
                  opacity: 1,
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.645, 0.045, 0.355, 1],
                  delay: 0.6,
                }}
                className="text-sm uppercase tracking-tight font-mono flex items-center gap-1"
                style={{
                  fontFamily:
                    "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace",
                }}
              >
                {dailyVolumeLabel}
                <ArrowUpRight className="w-[0.71em] h-[0.71em]" />
              </motion.span>
              <span
                className="text-[32px] leading-[160px] tracking-tight bg-gradient-to-r from-[#202020] via-[#00517f] via-[#52aee3] to-[#9ed2fc] bg-clip-text text-transparent"
                style={{
                  fontFeatureSettings: '"clig" 0, "liga" 0',
                  height: "98px",
                  marginBottom: "0px",
                  paddingTop: "",
                  display: "none",
                }}
              >
                {dailyVolume}
              </span>
            </a> */}

            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] leading-tight sm:leading-[1.1] md:leading-[1.1] lg:leading-[60px] tracking-tight text-foreground max-w-full sm:max-w-[520px] mb-4 sm:mb-5 md:mb-6"
              style={{
                fontWeight: "500",
                fontFamily: "var(--font-figtree), Figtree",
              }}
            >
              Your AI{" "}
              <motion.span
                className="inline-flex items-center justify-center rounded-full px-3 sm:px-4 md:px-5 py-1 sm:py-1.5 md:py-2 align-middle"
                style={{
                  minWidth: "250px",
                  width: "fit-content",
                  backgroundColor: currentWord.pillBg,
                  boxShadow: `inset 0 2px 8px ${currentWord.shadowColor}, inset 0 1px 2px ${currentWord.shadowColor}`,
                }}
                animate={{
                  backgroundColor: currentWord.pillBg,
                  boxShadow: `inset 0 2px 8px ${currentWord.shadowColor}, inset 0 1px 2px ${currentWord.shadowColor}`,
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <span
                  className="relative overflow-hidden h-[1.1em] flex items-center justify-center"
                  style={{ minWidth: "250px" }}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentWord.word}
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "-100%", opacity: 0 }}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                        duration: 0.4,
                      }}
                      className="absolute whitespace-nowrap"
                      style={{
                        color: currentWord.textColor,
                        fontWeight: "600",
                      }}
                    >
                      {currentWord.word}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </motion.span>{" "}
              that holds you accountable.
            </h1>

            <p
              className="text-base sm:text-lg leading-6 sm:leading-7 text-muted-foreground max-w-full sm:max-w-[520px] mb-4 sm:mb-5 md:mb-6"
              style={{
                fontFamily: "var(--font-figtree), Figtree",
              }}
            >
              {subheadline}
            </p>

            <div className="max-w-[520px] mb-0">
              <p
                className="text-base leading-5"
                style={{
                  display: "none",
                }}
              >
                {description}
              </p>
            </div>

            <ul className="flex flex-col sm:flex-row gap-2 sm:gap-1.5 flex-wrap mt-6 sm:mt-8 md:mt-8">
              <li className="w-full sm:w-auto">
                <a
                  href={primaryButtonHref}
                  onClick={(e) => e.preventDefault()}
                  className="block cursor-pointer text-white bg-[#0988f0] rounded-full px-4 sm:px-[18px] py-3 sm:py-[15px] text-sm sm:text-base leading-4 text-center sm:text-left whitespace-nowrap transition-all duration-150 ease-[cubic-bezier(0.455,0.03,0.515,0.955)] hover:rounded-2xl"
                  style={{
                    background: "#156d95",
                  }}
                >
                  {primaryButtonText}
                </a>
              </li>
              <li className="w-full sm:w-auto">
                <a
                  href={secondaryButtonHref}
                  onClick={(e) => e.preventDefault()}
                  className="block cursor-pointer text-foreground border border-foreground rounded-full px-4 sm:px-[18px] py-3 sm:py-[15px] text-sm sm:text-base leading-4 text-center sm:text-left whitespace-nowrap transition-all duration-150 ease-[cubic-bezier(0.455,0.03,0.515,0.955)] hover:rounded-2xl"
                >
                  {secondaryButtonText}
                </a>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.8,
              ease: [0.645, 0.045, 0.355, 1],
              delay: 0.2,
            }}
            className="col-span-12 lg:col-span-6 bg-card rounded-2xl sm:rounded-3xl lg:rounded-[40px] flex justify-center items-center aspect-square min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-0 overflow-hidden"
            style={{
              backgroundImage: "url(/runbook-hero.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>
      </div>
    </section>
  );
};
