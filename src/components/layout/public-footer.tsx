import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-brand-lilac py-8 md:py-12 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-[40px]">
        {/* Left Side */}
        <div className="flex flex-col justify-between">
          <div className="mb-4">
            <img src="/acwa-logo-white.svg" alt="ACWA Power" className="h-12 md:h-14 w-auto" />
          </div>
          <a
            href="https://www.acwapower.com/en/contact-us/"
            target="_blank"
            className="flex items-center justify-between border border-white/30 rounded-lg p-3 w-full max-w-[260px] text-white font-semibold hover:bg-white/10 transition-colors text-sm"
          >
            <span>Get in touch</span>
            <span className="text-lg">→</span>
          </a>
        </div>

        {/* Right Side */}
        <div className="flex flex-col justify-between">
          <div className="text-2xl md:text-3xl font-medium leading-[1.2] mb-6">
            <span className="text-white">Driving progress</span> for <br />
            people <span className="text-white">and</span> the planet.
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <a href="https://www.acwapower.com/en/about-us/" className="text-white/90 hover:underline text-[12px] font-medium transition-all">About us</a>
              <a href="https://www.acwapower.com/en/about-us/company-history/" className="text-white/90 hover:underline text-[12px] font-medium transition-all">Our history</a>
              <a href="https://www.acwapower.com/en/about-us/board-of-directors/" className="text-white/90 hover:underline text-[12px] font-medium transition-all">Board of Directors</a>
              <a href="https://www.acwapower.com/en/about-us/management-team/" className="text-white/90 hover:underline text-[12px] font-medium transition-all">Management</a>
            </div>
            <div className="flex flex-col gap-2">
              <a href="https://www.acwapower.com/en/projects/" className="text-white/90 hover:underline text-[12px] font-medium transition-all">Projects</a>
              <a href="https://www.acwapower.com/en/projects/operations-maintenance/" className="text-white/90 hover:underline text-[12px] font-medium transition-all">Acwa Operations</a>
              <a href="#" className="text-white/90 hover:underline text-[12px] font-medium transition-all">Acwa Field Services</a>
              <a href="#" className="text-white/90 hover:underline text-[12px] font-medium transition-all">Technologies</a>
            </div>
            <div className="hidden md:flex flex-col gap-2">
              <a href="https://www.acwapower.com/en/sustainability/" className="text-white/90 hover:underline text-[12px] font-medium transition-all">Sustainability at Acwa</a>
              <a href="https://www.acwapower.com/en/investor-relations/overview/" className="text-white/90 hover:underline text-[12px] font-medium transition-all">Investors overview</a>
              <a href="https://www.acwapower.com/en/newsroom/" className="text-white/90 hover:underline text-[12px] font-medium transition-all">Latest news</a>
              <a href="#" className="text-white/90 hover:underline text-[12px] font-medium transition-all">Applications</a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto mt-8 pt-4 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 text-white text-[11px]">
        <div>© 2026 Acwa. All rights reserved.</div>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Legal Notice</a>
          <a href="https://www.acwapower.com/en/privacy-policy/" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Compliance Line</a>
        </div>
      </div>
    </footer>
  );
}
