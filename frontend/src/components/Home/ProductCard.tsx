import { useNavigate } from "react-router-dom";
import { Star, Plus, Leaf } from "lucide-react";
import { Product } from "../../types";
import { useCart } from "../../context/CartContext";

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border border-app-border hover:border-app-clay/40 hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
      onClick={() => navigate(`/products/${product._id}`)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-app-canvas">
        <img
          src={product.image}
          alt={product.name}
          className="object-contain w-full h-full p-4 group-hover:scale-105 transition-transform duration-300"
        />

        {product.discount > 0 && (
          <span className="absolute top-3 left-0 px-2.5 py-1 text-[11px] font-semibold text-white bg-app-clay rounded-r-full">
            {product.discount}% off
          </span>
        )}
        {product.isOrganic && (
          <span className="absolute top-3 right-3 size-6 rounded-full bg-app-moss/90 text-white flex items-center justify-center" title="Organic">
            <Leaf className="size-3.5" />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="text-sm text-app-green leading-snug mb-1.5 line-clamp-2">{product.name}</h3>

        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="size-3 text-app-gold fill-app-gold" />
            <span className="text-xs font-medium text-app-green">{product.rating}</span>
            <span className="text-xs text-app-text-light">({product.reviewCount})</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="font-serif text-lg text-app-green">{currency}{product.price.toFixed(1)}</span>
            <span className="text-xs text-app-text-light">/{product.unit}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-app-text-light line-through">
                {currency}{product.originalPrice.toFixed(1)}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="size-8 rounded-full bg-app-green text-white flex items-center justify-center hover:bg-app-clay transition-colors active:scale-95"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;