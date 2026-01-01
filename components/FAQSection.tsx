"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
type FAQItem = {
  question: string;
  answer: string;
};
type FAQSectionProps = {
  title?: string;
  faqs?: FAQItem[];
};
const defaultFAQs: FAQItem[] = [
  {
    question: "What is RunBook and how does it hold me accountable?",
    answer:
      "RunBook is an AI Accountability Manager that runs scheduled voice meetings to check in on your goals—just like a workplace stand-up. Instead of a passive todo app, you attend a meeting with an AI manager who knows your goals, remembers past commitments, questions incomplete work, and locks in new promises. The AI has authority: it doesn't wait for you to act, it shows up and expects results.",
  },
  {
    question: "How does RunBook work? What happens in a meeting?",
    answer:
      "At your chosen time, you join a voice call with your AI manager. The meeting follows a structured format: review of previous commitments, progress check on what was completed and what wasn't, interrogation about why tasks were incomplete, pattern recognition of missed deadlines or repeated excuses, and commitment lock-in with clear, time-bound goals for the next meeting. The AI controls the flow and asks follow-up questions until you give specific answers.",
  },
  {
    question: "Why voice meetings instead of chat? What if I miss a meeting?",
    answer:
      "Chat-based accountability is easy to avoid and easy to fake. Voice meetings increase psychological pressure, require real-time thinking, and reduce vague or dishonest answers. They feel closer to real workplace interactions. If you miss a meeting, the AI remembers it. Repeated no-shows trigger escalated follow-up. The system is designed to make progress unavoidable, not convenient.",
  },
];
export const FAQSection = ({
  title = "Frequently asked questions",
  faqs = defaultFAQs,
}: FAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return (
    <section id="faq" className="w-full py-24 px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Left Column - Title */}
          <div className="lg:col-span-4">
            <h2
              className="text-[40px] leading-tight font-normal text-foreground tracking-tight sticky top-24"
              style={{
                fontFamily: "var(--font-figtree), Figtree",
                fontWeight: "400",
                fontSize: "40px",
              }}
            >
              {title}
            </h2>
          </div>

          {/* Right Column - FAQ Items */}
          <div className="lg:col-span-8">
            <div className="space-y-0">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border-b border-border last:border-b-0"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between py-6 text-left group hover:opacity-70 transition-opacity duration-150"
                    aria-expanded={openIndex === index}
                  >
                    <span
                      className="text-lg leading-7 text-foreground pr-8"
                      style={{
                        fontFamily: "var(--font-figtree), Figtree",
                        fontWeight: "400",
                      }}
                    >
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{
                        rotate: openIndex === index ? 45 : 0,
                      }}
                      transition={{
                        duration: 0.2,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      className="flex-shrink-0"
                    >
                      <Plus
                        className="w-6 h-6 text-foreground"
                        strokeWidth={1.5}
                      />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {openIndex === index && (
                      <motion.div
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.3,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6 pr-12">
                          <p
                            className="text-lg leading-6 text-muted-foreground"
                            style={{
                              fontFamily: "var(--font-figtree), Figtree",
                            }}
                          >
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
