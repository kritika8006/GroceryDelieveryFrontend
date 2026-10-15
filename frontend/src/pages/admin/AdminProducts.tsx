import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../lib/api";
import type { Product } from "../../types";

const PAGE_SIZE = 10;

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const load = () => {
    setLoading(true);
    api
      .getProducts({ page: String(page), limit: String(PAGE_SIZE) })
      .then((d) => {
        setProducts(d.products || []);
        setTotalPages(d.pages || 1);
        setTotalProducts(d.total || 0);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const changeStock = async (p: Product, stock: number) => {
    if (Number.isNaN(stock) || stock < 0) return;
    try {
      await api.updateProduct(p._id, { stock });
      setProducts((prev) => prev.map((x) => (x._id === p._id ? { ...x, stock } : x)));
      toast.success("Stock updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const remove = async (p: Product) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await api.deleteProduct(p._id);
      // if that was the last item on this page (and we're not on page 1), step back a page
      if (products.length === 1 && page > 1) setPage((pg) => pg - 1);
      else load();
      toast.success("Product deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <h2 className="text-xl font-serif text-app-green mb-6">Product List ({totalProducts})</h2>
      {loading ? <p className="text-app-text-light">Loading...</p> : products.length === 0 ? (
        <p className="text-app-text-light">No products yet. Add one from "Add Product".</p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p._id} className="flex items-center justify-between gap-4 p-4 bg-app-canvas rounded-2xl">
              <div className="flex items-center gap-4 min-w-0">
                <img src={p.image} alt={p.name} className="w-12 h-12 object-contain bg-white rounded-xl" />
                <div className="min-w-0">
                  <p className="font-medium text-app-green truncate">{p.name}</p>
                  <p className="text-xs text-app-text-light">{p.category}</p>
                </div>
              </div>
              <p className="font-serif text-app-green">${p.price.toFixed(2)}</p>
              <label className="text-sm text-app-text-light flex items-center gap-2">
                Stock
                <input
                  type="number" min={0} defaultValue={p.stock}
                  onBlur={(e) => Number(e.target.value) !== p.stock && changeStock(p, Number(e.target.value))}
                  className="w-20 p-2 rounded-lg border border-app-border text-app-green outline-none focus:border-app-clay transition-colors"
                />
              </label>
              <button onClick={() => remove(p)} className="text-app-clay font-medium hover:text-app-clay-dark transition-colors">Delete</button>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-app-border">
          <p className="text-sm text-app-text-light">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-app-border text-app-green disabled:opacity-40 hover:border-app-clay transition-colors"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-app-border text-app-green disabled:opacity-40 hover:border-app-clay transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;