import { Link } from "react-router-dom";
import { categoriesData } from "../../assets/assets";

const HomeCategories = () => {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div>
          <h2 className="text-2xl font-semibold">Browse Categories</h2>
          <p className="text-sm text-gray-500 mt-1">Find exactly what you need using</p>
        </div>

        {/* Categories List (Horizontal Scroll) */}
        <div className="flex items-center mt-8 overflow-x-scroll no-scrollbar">
          {categoriesData.map((cat) => (
            <Link 
              key={cat.slug} 
              to={`/products?category=${cat.slug}`} 
              onClick={() => window.scrollTo(0, 0)} 
              className="group flex flex-col items-center gap-3 p-4"
            >
              <div className="size-16 sm:size-24 sm:p-2 rounded-2xl overflow-hidden bg-orange-100 group-hover:ring-2 ring-orange-300 transition-all">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-contain rounded-full transition-all" 
                />
              </div>
              <p className="text-sm font-medium">{cat.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeCategories;