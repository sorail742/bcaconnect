import { Hero } from "../components/Hero"
import LandingTopCarousel from "../components/LandingTopCarousel"
import { FeaturedProducts } from "../components/FeaturedProducts"
import { MarketTrendsSection } from "../components/MarketTrendsSection"
import { SupplierBanner } from "../components/SupplierBanner"
import { AISection } from "../components/AISection"
import { HowItWorks } from "../components/HowItWorks"
import { RolesSection } from "../components/RolesSection"
import { DashboardPreview } from "../components/DashboardPreview"
import { TestimonialsSection } from "../components/TestimonialsSection"
import { CTASection } from "../components/CTASection"
import { useLandingStats } from "../hooks/useLandingStats"

export default function LandingPage() {
    const { stats } = useLandingStats()

    return (
        <main className="min-h-screen bg-[#f7f7f7] text-[#333] selection:bg-[#1CA0DB]/20">
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
