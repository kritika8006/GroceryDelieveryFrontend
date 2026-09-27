import { heroSectionData } from "../../assets/assets";

const Features = () => {
  return (
    <section className="bg-white py-5 border border-gray-200/80 rounded-xl shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {heroSectionData.hero_features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              {/* Icon Container */}
              <div className="size-10 rounded-lg bg-[#FDFBF7] flex items-center justify-center shrink-0">
                <feature.icon className="size-5 text-green-700" />
              </div>
              {/* Text Info */}
              <div>
                <p className="text-sm font-semibold text-green-800">{feature.title}</p>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;