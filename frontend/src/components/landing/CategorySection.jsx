import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Laptop, Shirt, Home, ShoppingCart, Zap, Smartphone, Watch } from 'lucide-react';
import { cn } from '../../lib/utils';

const categories = [
    {
        id: 'elec',
        title: 'Électronique',
        count: '1.2k+ Produits',
        icon: Smartphone,
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop',
        color: 'from-blue-600/20 to-transparent'
    },
    {
        id: 'mode',
        title: 'Mode & Beauté',
        count: '850+ Produits',
        icon: Shirt,
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop',
        color: 'from-pink-600/20 to-transparent'
    },
    {
        id: 'maison',
        title: 'Maison',
        count: '430+ Produits',
        icon: Home,
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop',
        color: 'from-emerald-600/20 to-transparent'
    },
    {
        id: 'epicerie',
        title: 'Épicerie',
        count: '600+ Produits',
        icon: ShoppingCart,
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2074&auto=format&fit=crop',
        color: 'from-amber-600/20 to-transparent'
    }
];

export function CategorySection() {
    return (
        <section className="relative py-32 bg-[#0A0D14] overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                    <div className="max-w-2xl animate-fade-in-up">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#FF6600]/10 border border-[#FF6600]/20 text-[10px] font-black text-[#FF6600] mb-8 uppercase tracking-[0.2em]">
                            <Zap className="size-3 fill-current" />
                            Explorer le catalogue
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[0.95]">
                            Explorer les <br />
                            <span className="text-[#FF6600] italic">catégories.</span>
                        </h2>
                    </div>
                    <Link to="/marketplace" className="group flex items-center gap-3 text-sm font-black text-white uppercase tracking-widest hover:text-[#FF6600] transition-colors animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        Tout voir
                        <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#FF6600] group-hover:border-[#FF6600] transition-all">
                            <ArrowRight className="size-5" />
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat, i) => (
                        <Link
                            key={cat.id}
                            to={`/marketplace?category=${cat.id}`}
                            className="group relative h-[450px] rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#11161D] animate-fade-in-up"
                            style={{ animationDelay: `${200 + i * 100}ms` }}
                        >
                            {/* Background Image */}
                            <img
                                src={cat.image}
                                alt={cat.title}
                                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"
                            />

                            {/* Gradient Overlay */}
                            <div className={cn("absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/20 to-transparent transition-opacity duration-500", cat.color)} />

                            {/* Content */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                <div className="size-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white mb-6 group-hover:bg-[#FF6600] group-hover:border-[#FF6600] group-hover:scale-110 transition-all duration-500">
                                    <cat.icon className="size-7" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-[#FF6600] transition-colors">{cat.title}</h3>
                                <p className="text-sm font-bold text-slate-400 mb-6">{cat.count}</p>

                                <div className="flex items-center gap-2 text-[10px] font-black text-[#FF6600] uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                    Découvrir
                                    <ArrowRight className="size-3" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
