import { Hero } from "../components/landing/Hero"
import LandingTopCarousel from "../components/landing/LandingTopCarousel"
import { FeaturedProducts } from "../components/landing/FeaturedProducts"
import { MarketTrendsSection } from "../components/landing/MarketTrendsSection"
import { SupplierBanner } from "../components/landing/SupplierBanner"
import { AISection } from "../components/landing/AISection"
import { HowItWorks } from "../components/landing/HowItWorks"
import { RolesSection } from "../components/landing/RolesSection"
import { DashboardPreview } from "../components/landing/DashboardPreview"
import { TestimonialsSection } from "../components/landing/TestimonialsSection"
import { CTASection } from "../components/landing/CTASection"
import { useLandingStats } from "../hooks/useLandingStats"

export default function LandingPage() {
    const { stats } = useLandingStats()

    return (
        <main className="min-h-screen bg-[#f7f7f7] text-[#333] selection:bg-[#FF6600]/20">
            <LandingTopCarousel />
            <Hero />
            <FeaturedProducts />
            <MarketTrendsSection stats={stats} />
            <SupplierBanner stats={stats} />
            <AISection />
            <HowItWorks />
            <RolesSection />
            <DashboardPreview stats={stats} />
            <TestimonialsSection stats={stats} />
            <CTASection stats={stats} />
        </main>
    )
}
