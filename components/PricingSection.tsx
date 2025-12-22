"use client";

import * as React from "react";
import { CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

type PlanLevel = "free" | "pro" | "proPlus";

interface PricingFeature {
  name: string;
  included: PlanLevel | "all";
}

interface PricingPlan {
  name: string;
  level: PlanLevel;
  price: number;
  meetings: string;
  popular?: boolean;
}

const features: PricingFeature[] = [
  { name: "Voice meetings", included: "all" },
  { name: "Goal tracking and commitments", included: "all" },
  { name: "Meeting summaries", included: "all" },
  { name: "Pattern recognition (missed deadlines, excuses)", included: "pro" },
  { name: "Long-term memory and behavior analysis", included: "pro" },
  {
    name: "Customizable manager style (supportive/strict/adaptive)",
    included: "proPlus",
  },
];

const plans: PricingPlan[] = [
  {
    name: "Free",
    price: 0,
    meetings: "7 meetings/month",
    level: "free",
  },
  {
    name: "Pro",
    price: 15,
    meetings: "Unlimited meetings",
    level: "pro",
    popular: true,
  },
  {
    name: "Pro Plus",
    price: 49,
    meetings: "Unlimited meetings",
    level: "proPlus",
  },
];

function shouldShowCheck(
  included: PricingFeature["included"],
  level: PlanLevel
): boolean {
  if (included === "all") return true;
  if (included === "proPlus" && level === "proPlus") return true;
  if (included === "pro" && (level === "pro" || level === "proPlus"))
    return true;
  if (included === "free" && level === "free") return true;
  return false;
}

function getPlainFeatures(level: PlanLevel): string[] {
  return features
    .filter((feature) => shouldShowCheck(feature.included, level))
    .map((feature) => feature.name);
}

export function PricingSection() {
  // const [isYearly, setIsYearly] = React.useState(false)
  const [selectedPlan, setSelectedPlan] = React.useState<PlanLevel>("pro");

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-figtree text-[40px] font-normal leading-tight mb-4">
            Choose Your Plan
          </h2>
          <p className="font-figtree text-lg text-muted-foreground max-w-2xl mx-auto">
            Replace self-discipline with structure. All plans include voice
            meetings, goal tracking, and meeting summaries.
          </p>
        </div>

        {/* Billing Toggle */}
        {/* <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary rounded-full p-1">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-6 py-2 rounded-full font-figtree text-lg transition-all",
                !isYearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-6 py-2 rounded-full font-figtree text-lg transition-all",
                isYearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Yearly
              <span className="ml-2 text-sm text-[#156d95]">Save 20%</span>
            </button>
          </div>
        </div> */}

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => {
            const planFeatures = getPlainFeatures(plan.level);
            return (
              <button
                key={plan.name}
                type="button"
                onClick={() => setSelectedPlan(plan.level)}
                className={cn(
                  "relative p-8 rounded-2xl text-left transition-all border-2 flex flex-col h-full",
                  selectedPlan === plan.level
                    ? "border-[#156d95] bg-[#156d95]/5"
                    : "border-border hover:border-[#156d95]/50",
                  plan.popular && "md:-mt-6"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#156d95] text-white px-4 py-1 rounded-full text-sm font-figtree">
                    Most Popular
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="font-figtree text-2xl font-medium mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-figtree text-4xl font-medium">
                      ${plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="font-figtree text-lg text-muted-foreground">
                        /month
                      </span>
                    )}
                  </div>
                  <p className="font-figtree text-sm text-muted-foreground">
                    {plan.meetings}
                  </p>
                </div>

                <div className="mb-8 flex-1">
                  <h4 className="font-figtree text-sm font-medium text-muted-foreground mb-4">
                    Features included:
                  </h4>
                  <ul className="space-y-3">
                    {planFeatures.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#156d95] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckIcon className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-figtree text-sm text-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={cn(
                    "w-full py-3 px-6 rounded-full font-figtree text-lg transition-all text-center",
                    selectedPlan === plan.level
                      ? "bg-[#156d95] text-white"
                      : "bg-secondary text-foreground"
                  )}
                >
                  {selectedPlan === plan.level ? "Selected" : "Select Plan"}
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="mt-12 text-center">
          <button className="bg-[#156d95] text-white px-[18px] py-[15px] rounded-full font-figtree text-lg hover:rounded-2xl transition-all">
            Get started with {plans.find((p) => p.level === selectedPlan)?.name}
          </button>
        </div>
      </div>
    </section>
  );
}
