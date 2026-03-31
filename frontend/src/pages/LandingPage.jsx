import { Header } from "../components/landing/Header"
import { Hero } from "../components/landing/Hero"
import { ProblemSection } from "../components/landing/ProblemSection"
import { SolutionSection } from "../components/landing/SolutionSection"
import { FeaturesSection } from "../components/landing/FeaturesSection"
import { HowItWorks } from "../components/landing/HowItWorks"
import { RolesSection } from "../components/landing/RolesSection"
import { DashboardPreview } from "../components/landing/DashboardPreview"
import { CTASection } from "../components/landing/CTASection"
import { Footer } from "../components/landing/Footer"

export default function LandingPage() {
    return (
        <main className="min-h-screen pt-28 bg-transparent text-foreground overflow-x-hidden">
            <Header />
            <Hero />
            <ProblemSection />
            <SolutionSection />
            <FeaturesSection />
            <HowItWorks />
            <RolesSection />
            <DashboardPreview />
            <CTASection />
            <Footer />
        </main>
    )
}
