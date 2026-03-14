import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../ui/Button"
import { Menu, X } from "lucide-react"

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2" translate="no">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm">BC</span>
                        </div>
                        <span className="font-bold text-xl text-foreground">BCA Connect</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Fonctionnalités
                        </a>
                        <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Comment ça marche
                        </a>
                        <a href="#roles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Rôles
                        </a>
                        <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Contact
                        </a>
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost" size="sm">
                                Se connecter
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button size="sm">
                                Commencer
                            </Button>
                        </Link>
                    </div>

                    <button
                        className="md:hidden p-2 text-foreground"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border">
                        <nav className="flex flex-col gap-4">
                            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Fonctionnalités
                            </a>
                            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Comment ça marche
                            </a>
                            <a href="#roles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Rôles
                            </a>
                            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Contact
                            </a>
                            <div className="flex flex-col gap-2 pt-4">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm" className="w-full">
                                        Se connecter
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="w-full">
                                        Commencer
                                    </Button>
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}
