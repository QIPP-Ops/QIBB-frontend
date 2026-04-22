export function DashboardHero() {
  return (
    <div className="relative h-[40vh] md:h-[60vh] w-full flex items-center justify-start px-6 md:px-[8%] pt-20 bg-[linear-gradient(rgba(46,32,68,0.6),rgba(46,32,68,0.3)),url('/hero-image.jpeg')] bg-cover bg-center">
      <div className="max-w-[600px] text-white">
        <h1 className="text-3xl md:text-5xl font-medium leading-[1.2]">
          Advancing <span className="text-brand-lime font-bold">life</span><br />
          through energy,<br />
          <span className="text-brand-lime font-bold">water</span> and <span className="text-brand-lime font-bold">ingenuity</span>.
        </h1>
        <div className="mt-6 text-lg md:text-2xl font-normal opacity-90 border-l-4 border-brand-lime pl-4">
          Safe, reliable power and water.
        </div>
      </div>
    </div>
  );
}
