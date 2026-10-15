import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";
import { heroSectionData } from "../../assets/assets";

const Hero = () => {
  return (
    <section className="relative overflow-hidden min-h-[560px] mb-10 rounded-3xl flex items-center">
      <img
        src={heroSectionData.hero_image}
        alt="Hero"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-app-green/90 via-app-green/55 to-app-green/10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-xl xl:pl-10">
          <p className="text-app-gold font-medium text-sm mb-4 tracking-wide">
            Farm-fresh, organic, delivered today
          </p>

          <h1 className="font-serif font-medium text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.08] mb-6">
            Nourish your home with{" "}
            <span className="relative inline-block">
              earth's finest
              <svg
                className="absolute left-0 -bottom-1 w-full text-app-clay"
                viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true"
              >
                <path d="M2 9 C 80 2, 220 2, 298 8" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="text-base text-white/75 leading-relaxed mb-9 max-w-md">
            {heroSectionData.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/products"
              className="px-7 py-3 bg-app-clay text-white font-medium rounded-full hover:bg-app-clay-dark transition-all flex items-center gap-2 active:scale-[0.98]"
            >
              Shop Now <ArrowRightIcon className="size-4" />
            </Link>

            <Link
              to="/products"
              className="px-7 py-3 bg-white/10 text-white font-medium rounded-full hover:bg-white/20 transition-all border border-white/25"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;