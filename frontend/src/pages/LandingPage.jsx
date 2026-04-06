import MainLayout from "../components/layout/MainLayout"
import { Hero } from "../components/landing/Hero"
import { CategorySection } from "../components/landing/CategorySection"
import { ProblemSection } from "../components/landing/ProblemSection"
import { SolutionSection } from "../components/landing/SolutionSection"
import { HowItWorks } from "../components/landing/HowItWorks"
import { RolesSection } from "../components/landing/RolesSection"
import { CommunityGallery } from "../components/landing/CommunityGallery"
import { AISection } from "../components/landing/AISection"
import { DashboardPreview } from "../components/landing/DashboardPreview"
import { CTASection } from "../components/landing/CTASection"

export default function LandingPage() {
    return (
        <MainLayout>
            <main className="min-h-screen bg-slate-50 dark:bg-[#0A0D14] text-slate-900 dark:text-foreground selection:bg-[#FF6600]/30 selection:text-slate-900 dark:text-foreground">
                <Hero />
                <CategorySection />
                <ProblemSection />
                <SolutionSection />
                <HowItWorks />
                <RolesSection />
                <CommunityGallery />
                <AISection />
                <DashboardPreview />
                <CTASection />
            </main>
        </MainLayout>
    )
}
