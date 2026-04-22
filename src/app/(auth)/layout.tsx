"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#1A1227] relative overflow-hidden p-4 md:p-8">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-lilac/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-purple/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 gap-0 bg-zinc-900/50 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        
        {/* Left Side - Brand Info (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-brand-purple to-[#1A1227] border-r border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/hero-image.jpeg')] bg-cover bg-center opacity-20" />
          <div className="relative z-10">
            <Link href="/" className="inline-block mb-12">
               <img src="/acwa-logo-white.svg" alt="ACWA" className="h-16 w-auto" />
            </Link>
            <h2 className="text-4xl font-black text-white leading-tight mb-6 uppercase tracking-tight">
              Operational <br />
              <span className="text-brand-lime">Intelligence</span> <br />
              System.
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-sm">
              Secure access to QIPP's unified control and personnel management infrastructure.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">
            <div className="w-2 h-2 bg-brand-lime rounded-full animate-pulse" />
            System Secure & Online
          </div>
        </div>

        {/* Right Side - Form Content */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
           <div className="lg:hidden flex justify-center mb-8">
              <img src="/acwa-logo-white.svg" alt="ACWA" className="h-12 w-auto" />
           </div>
           {children}
        </div>
      </div>

      {/* Simple Footer Links */}
      <div className="relative z-10 mt-8 flex gap-8 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
         <Link href="/" className="hover:text-white transition-colors">Public Dashboard</Link>
         <a href="#" className="hover:text-white transition-colors">Support</a>
         <a href="#" className="hover:text-white transition-colors">Privacy</a>
      </div>
    </div>
  );
}
