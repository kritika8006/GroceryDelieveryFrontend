import { useNavigate } from "react-router-dom";
import { Star, Plus } from "lucide-react";
import { Product } from "../../types";
import { useCart } from "../../context/CartContext"; // 1. Context hook import karein

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const navigate = useNavigate();
  const { addToCart } = useCart(); // 2. Context se addToCart function nikalen
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-md transition-all duration-300 group cursor-pointer"
      onClick={() => navigate(`/products/${product._id}`)}
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden">
        <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-all duration-300" />
        
        {/* Discount Badge */}
        <div className="absolute top-3 left-3">
          {product.discount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-orange-500 text-white rounded-full">
              {product.discount}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3.5 text-zinc-700">
        <h3 className="text-sm leading-snug mb-1.5 line-clamp-2">{product.name}</h3>
        
        {/* Rating Section */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="size-3 text-orange-400 fill-orange-400" />
            <span className="text-xs font-medium text-zinc-800">{product.rating}</span>
            <span className="text-xs text-zinc-400">({product.reviewCount})</span>
          </div>
        )}

        {/* Price + Add Button */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 truncate">
            <span className="text-base font-medium">{currency}{product.price.toFixed(1)}</span>
            <span className="text-xs text-gray-400 block">/{product.unit}</span>
            
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through ml-1.5">
                {currency}{product.originalPrice.toFixed(1)}
              </span>
            )}
          </div>

          <button 
            // 3. Yahan humne addToCart(product) call kiya hai
            onClick={(e) => { 
              e.stopPropagation(); 
              addToCart(product); 
            }}
            className="size-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors active:scale-95"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;