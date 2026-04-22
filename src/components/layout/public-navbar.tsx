"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ExternalLink, Menu, X } from "lucide-react";

export function PublicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Who we are", href: "https://www.acwapower.com/en/what-we-do/projects/hajr-ipp/" },
    { label: "What we do", href: "https://www.acwapower.com/en/what-we-do/acwa-operations/" },
    { label: "SuccessFactors", href: "https://hcm23.sapsf.com/sf/home?bplte_company=acwapowerc" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[1000] transition-all duration-400 ease-in-out",
        isScrolled
          ? "bg-[#2e2235d6] backdrop-blur-[4px] shadow-[0_4px_24px_rgba(0,0,0,0.28)] py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-6 md:px-12 max-w-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4">
          <img src="/acwa-logo-white.svg" alt="ACWA Power" className="h-[60px] md:h-[84px] w-auto" />
          <span className="hidden sm:block font-bold text-lg md:text-2xl text-white ml-2 pl-4 border-l border-white/40 tracking-wider">
            OPERATIONS
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 hover:text-brand-lime font-medium text-sm md:text-base transition-colors py-2 border-b-2 border-transparent hover:border-brand-lime"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://apnomac.synergilife.dnv.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 rounded-full border-2 border-white/80 text-white font-semibold text-sm hover:bg-white hover:text-brand-purple transition-all"
          >
            Synergi Life
          </a>
          <div className="flex items-center gap-3 ml-4">
            <a
              href="https://flpnwc-fpg6i1pyim.dispatcher.sa1.hana.ondemand.com/sites?siteId=bd8f998f-0949-4d95-b233-fbf3aa884a5c#Shell-home"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 rounded-full border-2 border-white/80 text-white font-semibold text-sm hover:bg-white hover:text-brand-purple transition-all"
            >
              S4HANA
            </a>
            <a
              href="https://acwapi-my.sharepoint.com/:x:/g/personal/m_algarni_nomac_com/IQBX9-3015HcT6C0FTLuB_lOAfVqMX5BJTYTqFMVOwZ7nwE?e=dQHZWw"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-brand-lime/90 hover:bg-brand-lime text-brand-purple rounded-full font-bold text-xs transition-all"
            >
              <ExternalLink size={14} strokeWidth={3} />
              Planned Leaves
            </a>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 bg-brand-lime rounded-lg text-brand-purple"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#2e2235f7] backdrop-blur-md p-6 border-t border-white/10 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-white text-lg font-medium border-b border-white/5 pb-2"
            >
              {link.label}
            </a>
          ))}
          <a href="https://apnomac.synergilife.dnv.com/" className="text-white text-lg font-medium border-b border-white/5 pb-2">
            Synergi Life
          </a>
          <div className="flex flex-col gap-3 pt-2">
            <a
              href="https://flpnwc-fpg6i1pyim.dispatcher.sa1.hana.ondemand.com/sites?siteId=bd8f998f-0949-4d95-b233-fbf3aa884a5c#Shell-home"
              className="w-full py-3 rounded-xl border border-white/20 text-white text-center font-bold"
            >
              S4HANA
            </a>
            <a
              href="https://acwapi-my.sharepoint.com/:x:/g/personal/m_algarni_nomac_com/IQBX9-3015HcT6C0FTLuB_lOAfVqMX5BJTYTqFMVOwZ7nwE?e=dQHZWw"
              className="w-full py-3 rounded-xl bg-brand-lime text-brand-purple text-center font-bold"
            >
              Planned Leaves
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
