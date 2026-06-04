import BcaTrustBar from "../marketplace/BcaTrustBar"
import { CategorySection } from "./CategorySection"
import { useLanguage } from "../../context/LanguageContext"

export function Hero() {
    const { t } = useLanguage()

    return (
        <>
            <section className="bg-[#f7f7f7] pt-4 pb-1">
                <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
                    <h1 className="text-center text-[22px] sm:text-[26px] font-bold text-[#333] tracking-tight">
                        {t('welcome') || 'Bienvenue sur'} <span className="text-[#FF6600]">BCA Connect</span>
                    </h1>
                </div>
            </section>
            <BcaTrustBar />
            {/* Capture 3 : sidebar catégories + produits à droite */}
            <CategorySection />
        </>
    )
}
