import { PortfolioNavbar } from "@/components/PortfolioNavbar";
import { ProductTeaserCard } from "@/components/ProductTeaserCard";
import { BankingScaleHero } from "@/components/BankingScaleHero";
import { CaseStudiesCarousel } from "@/components/CaseStudiesCarousel";
import { FeaturesBentoGrid } from "@/components/FeaturesBentoGrid";
import { PricingSection } from "@/components/PricingSection";
import { FAQSection } from "@/components/FAQSection";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <PortfolioNavbar />
      <ProductTeaserCard />
      <BankingScaleHero />
      <FeaturesBentoGrid />
      <CaseStudiesCarousel />
      <PricingSection />
      <FAQSection />
      <Footer />
    </>
  );
}
