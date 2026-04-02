import MainLayout from "../components/layout/MainLayout"
import { Hero } from "../components/landing/Hero"
import { CategorySection } from "../components/landing/CategorySection"
import { ProblemSection } from "../components/landing/ProblemSection"
import { SolutionSection } from "../components/landing/SolutionSection"
import { HowItWorks } from "../components/landing/HowItWorks"
import { RolesSection } from "../components/landing/RolesSection"
import { DashboardPreview } from "../components/landing/DashboardPreview"
import { CTASection } from "../components/landing/CTASection"

export default function LandingPage() {
    return (
        <MainLayout>
            <main className="min-h-screen bg-[#0A0D14] text-white selection:bg-[#FF6600]/30 selection:text-white">
                <Hero />
                <CategorySection />
                <ProblemSection />
                <SolutionSection />
                <HowItWorks />
                <RolesSection />
                <DashboardPreview />
                <CTASection />
            </main>
        </MainLayout>
    )
}
