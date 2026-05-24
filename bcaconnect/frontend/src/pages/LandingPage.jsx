import { Hero } from "../components/landing/Hero"
import { FeaturedProducts } from "../components/landing/FeaturedProducts"
import { CategorySection } from "../components/landing/CategorySection"
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
        <main className="min-h-screen bg-[#f7f7f7] text-foreground selection:bg-[#FF6600]/30 selection:text-foreground">
            {/* 1. Hero — full bleed splash */}
            <Hero />

            {/* 2. Flash deals + featured products — Alibaba core e-commerce block */}
            <FeaturedProducts />

            {/* 3. Category browser (sidebar + live product grid) */}
            <CategorySection />

            {/* 4. Live market trends with sparklines */}
            <MarketTrendsSection />

            {/* 5. "Become a Supplier" promo banner — Alibaba style */}
            <SupplierBanner />

            {/* 6. AI section */}
            <AISection />

            {/* 7. How it works — simple 3/4 step explainer */}
            <HowItWorks />

            {/* 8. Role cards (Buyer / Vendor / Transporter / Bank) */}
            <RolesSection />

            {/* 9. Dashboard preview */}
            <DashboardPreview />

            {/* 10. Social proof / Testimonials */}
            <TestimonialsSection />

            {/* 11. Final CTA */}
            <CTASection />
        </main>
    )
}
