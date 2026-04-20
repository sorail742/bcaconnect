
import { Hero } from "../components/landing/Hero"
import { CategorySection } from "../components/landing/CategorySection"
import { ProblemSection } from "../components/landing/ProblemSection"
import { SolutionSection } from "../components/landing/SolutionSection"
import { HowItWorks } from "../components/landing/HowItWorks"
import { RolesSection } from "../components/landing/RolesSection"
import { CommunityGallery } from "../components/landing/CommunityGallery"
import { AISection } from "../components/landing/AISection"
import { DashboardPreview } from "../components/landing/DashboardPreview"
import { FeaturedProducts } from "../components/landing/FeaturedProducts"
import { TestimonialsSection } from "../components/landing/TestimonialsSection"
import { MarketTrendsSection } from "../components/landing/MarketTrendsSection"
import { CTASection } from "../components/landing/CTASection"

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-[#FF6600]/30 selection:text-foreground">
            <Hero />
            <FeaturedProducts />
            <CategorySection />
            <TestimonialsSection />
            <ProblemSection />
            <SolutionSection />
            <HowItWorks />
            <RolesSection />
            <CommunityGallery />
            <AISection />
            <DashboardPreview />
            <MarketTrendsSection />
            <CTASection />
        </main>
    )
}
