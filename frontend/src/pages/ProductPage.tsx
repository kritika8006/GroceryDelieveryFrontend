import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Plus, Minus, Home, Star, ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import ReviewsSection from "../components/ReviewsSection";
import ProductCard from "../components/Home/ProductCard";
import type { Product } from "../types";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getProductById(id)
      .then(async (data: Product) => {
        setProduct(data);
        const related = await api.getProducts({ category: data.category });
        setSimilarProducts((related.products || []).filter((p: Product) => p._id !== id).slice(0, 5));
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-black"><Home size={16} /></Link>
          <span>/</span>
          <Link to="/products" className="hover:text-black">Products</Link>
          <span>/</span>
          <Link to={`/category/${product.category}`} className="hover:text-black capitalize">{product.category}</Link>
          <span>/</span>
          <span className="text-black font-medium">{product.name}</span>
        </div>

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-8 text-gray-500 hover:text-black transition">
          <ArrowLeft size={20} /> Back
        </button>

        {/* Product Details Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 flex flex-col md:flex-row gap-12 mb-12">
          {/* Image and Side-by-Side Badges */}
          <div className="flex-1 bg-gray-50 rounded-2xl p-8 flex items-center justify-center relative">
            <div className="absolute top-4 left-4 z-10 flex flex-row gap-2">
              {product.isOrganic && (
                <div className="px-3 py-1 rounded-full text-xs font-bold text-white bg-green-600">
                  ORGANIC
                </div>
              )}
              {product.discount > 0 && (
                <div className="px-3 py-1 rounded-full text-xs font-bold text-white bg-orange-500">
                  {product.discount}% OFF
                </div>
              )}
            </div>
            <img src={product.image} alt={product.name} className="w-full max-w-sm object-contain" />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <p className="text-gray-400 uppercase text-sm font-bold tracking-wider">{product.category}</p>
            <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-[#FF7F11]">
                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
              </div>
              <span className="font-bold text-gray-700">4.5</span>
            </div>

            <p className="text-3xl font-bold text-gray-900 mb-6">{currency}{product.price.toFixed(2)}</p>
            <p className="text-gray-600 mb-6">{product.description}</p>
            {product.stock > 0 ? (
              <p className="text-green-600 font-medium mb-8 flex items-center gap-2">
                ✓ In Stock ({product.stock} available)
              </p>
            ) : (
              <p className="text-red-600 font-medium mb-8 flex items-center gap-2">✕ Out of Stock</p>
            )}

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 border rounded-full px-4 py-2 bg-gray-50">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={20} /></button>
                <span className="font-bold w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}><Plus size={20} /></button>
              </div>
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={product.stock === 0}
                className="flex-1 bg-[#FF7F11] text-white py-4 rounded-full font-bold hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} /> {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
      <ReviewsSection product={product} />

        {/* Related Products Section */}
        {similarProducts.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-app-green">Related Products</h2>
                <p className="text-sm text-gray-500 mt-1">More from {product.category}</p>
              </div>
              <Link 
                to={`/products?category=${product.category}`} 
                className="text-sm font-semibold text-[#FF7F11] hover:text-orange-700 flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {similarProducts.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductPage;