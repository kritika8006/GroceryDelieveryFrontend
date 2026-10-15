import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, Loader2 } from "lucide-react";
import { categoriesData } from "../assets/assets";
import ProductCard from "../components/Home/ProductCard";
import { api } from "../lib/api";
import type { Product } from "../types";

// Loading component with lucid-react spinner
const Loading = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
    <Loader2 className="w-12 h-12 text-app-clay animate-spin mb-4" />
    <p className="text-app-green font-medium animate-pulse">Loading your products...</p>
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

  const [products, setProducts] = useState<Product[]>([]);

  // Fetch from the backend whenever category/sort change (server-side),
  // then apply the price range client-side since the API doesn't filter on it.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (sort) params.sort = sort;

    api
      .getProducts(params)
      .then((data) => {
        if (!cancelled) setProducts(data.products || []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, sort]);

  // Price range filtering happens client-side on whatever the API returned
  const filteredProducts = products.filter((p) => {
    const matchesMinPrice = minPriceParam === "" || p.price >= parseFloat(minPriceParam);
    const matchesMaxPrice = maxPriceParam === "" || p.price <= parseFloat(maxPriceParam);
    return matchesMinPrice && matchesMaxPrice;
  });

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
    <div className="min-h-screen bg-app-canvas py-6">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-app-text-light mb-6">
          <span className="cursor-pointer hover:text-app-green">🏠</span>
          <span className="text-app-border">/</span>
          <span className="font-medium text-app-green">All Products</span>
        </div>

               <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 md:shrink-0">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-app-border md:sticky md:top-24">              
              {/* Category Heading */}
              <h3 className="font-serif text-app-green text-lg mb-4">Categories</h3>
              <ul className="space-y-1 mb-6">
                <li 
                  onClick={() => updateFilter("category", "")} 
                  className={`p-2 px-4 rounded-xl cursor-pointer transition-colors text-sm font-medium ${category === "" ? "bg-app-green text-white" : "text-app-green/70 hover:bg-app-canvas"}`}
                >
                  All Categories
                </li>
                {categoriesData.map((c) => (
                  <li 
                    key={c.slug} 
                    onClick={() => updateFilter("category", c.slug)} 
                    className={`p-2 px-4 rounded-xl cursor-pointer transition-colors text-sm font-medium ${category === c.slug ? "bg-app-green text-white" : "text-app-green/70 hover:bg-app-canvas"}`}
                  >
                    {c.name}
                  </li>
                ))}
              </ul>

              <hr className="border-app-border mb-6" />

              {/* Price Range Controls */}
              <h3 className="font-medium text-app-green text-sm mb-3">Price Range</h3>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPriceInput}
                  onChange={(e) => {
                    setMinPriceInput(e.target.value);
                    handlePriceChange(e.target.value, maxPriceInput);
                  }}
                  className="w-full bg-white border border-app-border text-sm rounded-xl py-2 px-3 outline-none focus:border-app-clay transition-colors"
                />
                <span className="text-app-text-light">—</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPriceInput}
                  onChange={(e) => {
                    setMaxPriceInput(e.target.value);
                    handlePriceChange(minPriceInput, e.target.value);
                  }}
                  className="w-full bg-white border border-app-border text-sm rounded-xl py-2 px-3 outline-none focus:border-app-clay transition-colors"
                />
              </div>

            </div>
          </aside>

          {/* Main Grid View */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="font-serif text-2xl text-app-green">All Products</h1>
                <p className="text-app-text-light">{loading ? "..." : `${filteredProducts.length} products found`}</p>
              </div>
              
              <div className="relative bg-white rounded-xl border border-app-border focus-within:border-app-clay transition-colors">
                <select 
                  className="appearance-none bg-transparent py-2 pl-4 pr-10 outline-none cursor-pointer text-sm font-medium text-app-green" 
                  value={sort}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                >
                  <option value="">Newest</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="name">A → Z</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-app-text-light pointer-events-none" />
              </div>
            </div>
            
            {loading ? (
              <Loading />
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex justify-center py-20 text-app-text-light font-medium bg-white rounded-2xl border border-dashed border-app-border">
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