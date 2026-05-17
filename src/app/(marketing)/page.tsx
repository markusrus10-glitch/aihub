import Link from "next/link";
import { Sparkles, Zap, Shield, Globe, MessageSquare, Image, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing/Navbar";
import { LandingHero } from "@/components/landing/Hero";
import { LandingFeatures } from "@/components/landing/Features";
import { LandingModels } from "@/components/landing/Models";
import { LandingPricing } from "@/components/landing/Pricing";
import { LandingFAQ } from "@/components/landing/FAQ";
import { LandingFooter } from "@/components/landing/Footer";

export const metadata = {
  title: "AI Hub — All AI Models in One Place",
  description: "Access GPT-4o, Claude, Gemini, DeepSeek, Grok and more from a single platform.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <LandingHero />
      <LandingModels />
      <LandingFeatures />
      <LandingPricing />
      <LandingFAQ />
      <LandingFooter />
    </div>
  );
}
