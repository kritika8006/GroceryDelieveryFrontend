import { useEffect, useState } from "react";
import ProductCard from "../components/Home/ProductCard";
import { api } from "../lib/api";
import type { Product } from "../types";

const FlashDeals = () => {
  const [flashProducts, setFlashProducts] = useState<Product[]>([]);

  useEffect(() => {
    api
      .getDeals()
      .then((data) => setFlashProducts(data))
      .catch(() => setFlashProducts([]));
  }, []);

  return (
    <div className="w-full bg-[#FDFBF7] py-8">
      <div
        className="w-full py-12 px-4 mb-8 text-center shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #1B3022 0%, #2E7D32 35%, #81C784 75%, #FFFFFF 100%)'
        }}
      >
        <h2 className="text-4xl font-black text-[#1B3022] mb-2 flex items-center justify-center gap-2 drop-shadow-sm">
          ⚡ Flash Deals ⚡
        </h2>
        <p className="text-[#1B3022] font-semibold opacity-90">
          Limited-time offers on your favorite organic products. Grab them before they're gone!
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {flashProducts.length === 0 ? (
          <p className="text-center text-gray-500">No active deals right now — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {flashProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashDeals;
