import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, Loader2 } from "lucide-react";
import { dummyProducts, categoriesData } from "../assets/assets";
import ProductCard from "../components/Home/ProductCard";

// Loading component with lucid-react spinner
const Loading = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
    <Loader2 className="w-12 h-12 text-[#1A2E22] animate-spin mb-4" />
    <p className="text-[#1A2E22] font-semibold animate-pulse">Loading your products...</p>
  </div>
);

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  
  // Extract state params from the URL
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";

  // Local state for price inputs to avoid laggy typing
  const [minPriceInput, setMinPriceInput] = useState(minPriceParam);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam);

  // Sync inputs if URL params change externally
  useEffect(() => {
    setMinPriceInput(minPriceParam);
    setMaxPriceInput(maxPriceParam);
  }, [minPriceParam, maxPriceParam]);

  // Simulate data fetching delay when dependencies change
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [category, sort, minPriceParam, maxPriceParam]);

  // 1. Filtering Logic (Category + Price Range matching image_8177a4.png)
  let filteredProducts = dummyProducts.filter((p) => {
    const matchesCategory = category === "" || p.category === category;
    const matchesMinPrice = minPriceParam === "" || p.price >= parseFloat(minPriceParam);
    const matchesMaxPrice = maxPriceParam === "" || p.price <= parseFloat(maxPriceParam);
    return matchesCategory && matchesMinPrice && matchesMaxPrice;
  });

  // 2. Sorting Logic matching image_770339.jpg
  if (sort === "price_asc") filteredProducts.sort((a, b) => a.price - b.price);
  else if (sort === "price_desc") filteredProducts.sort((a, b) => b.price - a.price);
  else if (sort === "rating") filteredProducts.sort((a, b) => b.rating - a.rating);
  else if (sort === "name") filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  else filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Function to update single URL Parameters
  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  // Debounced/Triggered handler for updating multiple price parameters at once
  const handlePriceChange = (minVal: string, maxVal: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (minVal) newParams.set("minPrice", minVal);
    else newParams.delete("minPrice");

    if (maxVal) newParams.set("maxPrice", maxVal);
    else newParams.delete("maxPrice");

    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-6">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Breadcrumbs matching top of image_8177a4.png */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <span className="cursor-pointer hover:text-gray-800">🏠</span>
          <span className="text-gray-300">/</span>
          <span className="font-medium text-gray-700">All Products</span>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Section matching layout of image_8177a4.png */}
          <aside className="w-64 shrink-0">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
              
              {/* Category Heading */}
              <h3 className="font-bold text-gray-800 text-lg mb-4">Categories</h3>
              <ul className="space-y-1 mb-6">
                <li 
                  onClick={() => updateFilter("category", "")} 
                  className={`p-2 px-4 rounded-xl cursor-pointer transition text-sm font-medium ${category === "" ? "bg-[#1A2E22] text-white" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  All Categories
                </li>
                {categoriesData.map((c) => (
                  <li 
                    key={c.slug} 
                    onClick={() => updateFilter("category", c.slug)} 
                    className={`p-2 px-4 rounded-xl cursor-pointer transition text-sm font-medium ${category === c.slug ? "bg-[#1A2E22] text-white" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    {c.name}
                  </li>
                ))}
              </ul>

              <hr className="border-gray-100 mb-6" />

              {/* Price Range Controls Section matching bottom of image_8177a4.png */}
              <h3 className="font-bold text-gray-800 text-sm mb-3">Price Range</h3>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPriceInput}
                  onChange={(e) => {
                    setMinPriceInput(e.target.value);
                    handlePriceChange(e.target.value, maxPriceInput);
                  }}
                  className="w-full bg-white border border-gray-200 text-sm rounded-xl py-2 px-3 outline-none focus:border-[#1A2E22] transition"
                />
                <span className="text-gray-400">—</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPriceInput}
                  onChange={(e) => {
                    setMaxPriceInput(e.target.value);
                    handlePriceChange(minPriceInput, e.target.value);
                  }}
                  className="w-full bg-white border border-gray-200 text-sm rounded-xl py-2 px-3 outline-none focus:border-[#1A2E22] transition"
                />
              </div>

            </div>
          </aside>

          {/* Main Grid View */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#1A2E22]">All Products</h1>
                <p className="text-gray-500">{loading ? "..." : `${filteredProducts.length} products found`}</p>
              </div>
              
              {/* Dropdown Custom Select Custom Wrapper */}
              <div className="relative bg-white rounded-xl border border-gray-200 focus-within:border-[#1A2E22] transition">
                <select 
                  className="appearance-none bg-transparent py-2 pl-4 pr-10 outline-none cursor-pointer text-sm font-medium text-gray-700" 
                  value={sort}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                >
                  <option value="">Newest</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="name">A → Z</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
              </div>
            </div>
            
            {/* View Switching Conditionally via Loading State */}
            {loading ? (
              <Loading />
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex justify-center py-20 text-gray-500 font-medium bg-white rounded-2xl border border-dashed border-gray-200">
                No products found matching your active criteria.
              </div>
            )}
          </main>
        </div>

      </div>
    </div>
  );
};

export default Products;