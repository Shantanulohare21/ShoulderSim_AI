import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Activity, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Platform", href: "/platform" },
  { label: "Simulation", href: "/simulation" },
  { label: "Implants", href: "/implants" },
  { label: "For Surgeons", href: "/surgeons" },
  { label: "For Manufacturers", href: "/manufacturers" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[hsl(222,47%,6%,0.95)] backdrop-blur-md border-b border-[hsl(217,32%,16%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full border-2 border-[hsl(188,100%,45%)] opacity-70" />
              <div className="absolute inset-1.5 rounded-full border border-[hsl(188,100%,45%)] opacity-40" />
              <Activity className="absolute inset-0 w-full h-full p-1.5 text-[hsl(188,100%,45%)]" />
            </div>
            <span className="text-base font-bold tracking-tight hidden sm:block">
              <span className="text-gradient-cyan">Shoulder</span>
              <span className="text-white">Sim AI</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-testid={`nav-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[hsl(188,100%,45%)] bg-[hsl(188,100%,45%,0.1)]"
                      : "text-[hsl(215,20%,65%)] hover:text-white hover:bg-[hsl(217,32%,16%)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              data-testid="button-request-demo"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)] hover:bg-[hsl(188,100%,50%)] transition-colors glow-cyan-sm"
            >
              Request Demo
            </Link>
            <button
              className="lg:hidden p-2 rounded text-[hsl(215,20%,65%)] hover:text-white"
              onClick={() => setMenuOpen((o) => !o)}
              data-testid="button-mobile-menu"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-[hsl(222,47%,6%)] border-t border-[hsl(217,32%,16%)] px-4 py-4">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${
                  location === link.href
                    ? "text-[hsl(188,100%,45%)] bg-[hsl(188,100%,45%,0.1)]"
                    : "text-[hsl(215,20%,65%)] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="block mt-3 px-3 py-2 rounded text-sm font-semibold bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)] text-center"
            >
              Request Demo
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
