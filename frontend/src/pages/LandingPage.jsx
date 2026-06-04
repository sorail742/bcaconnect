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

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-[#f7f7f7] text-[#333] selection:bg-[#FF6600]/20">
            {/* Carousel — après navbar, avant « Bienvenue sur BCA Connect » */}
            <LandingTopCarousel />
            <Hero />

            {/* Grille produits recommandés — sans boutons achat */}
            <FeaturedProducts />

            <MarketTrendsSection />
            <SupplierBanner />
            <AISection />
            <HowItWorks />
            <RolesSection />
            <DashboardPreview />
            <TestimonialsSection />
            <CTASection />
        </main>
    )
}
