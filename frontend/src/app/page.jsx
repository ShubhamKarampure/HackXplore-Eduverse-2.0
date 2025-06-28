
"use client";
import { useRouter } from "next/navigation";
import ThemeTogglerTwo from "@/components/courses/dashboard/stats/common/ThemeTogglerTwo";
import { NavBar } from "@/components/sections/navbar";
import { HeroSection } from "@/components/sections/hero-section";
import { StatsSection } from "@/components/sections/stats-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { SolutionsSection } from "@/components/sections/solutions-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { CTASection } from "@/components/sections/cta-section";
import { Footer } from "@/components/sections/footer";

const LandingPage = () => {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/signin");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-500">
      
      {/* Theme toggler */}
      <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
        <ThemeTogglerTwo />
      </div>

      {/* Navigation Bar */}
      <NavBar onSignIn={handleSignIn} onSignUp={handleSignUp} />

      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Solutions Section */}
      <SolutionsSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Call to Action */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
