import { useState, useRef } from "react";
import { Upload, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { api, UPLOADS_ORIGIN } from "../../lib/api";
import { categoriesData } from "../../assets/assets";

const input = "w-full p-4 bg-app-canvas rounded-2xl outline-none focus:ring-2 focus:ring-app-clay/30 text-app-green";
const empty = { name: "", description: "", price: "", originalPrice: "", stock: "", unit: "1 pc", image: "", category: categoriesData[0].slug, isOrganic: false };

// form.image can be a pasted absolute URL, or a /uploads/... path from our own upload endpoint
const resolveImageUrl = (image: string) =>
  image.startsWith("/") ? `${UPLOADS_ORIGIN}${image}` : image;

const AddProduct = () => {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { url } = await api.uploadProductImage(file);
      set("image", url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const price = Number(form.price);
      await api.createProduct({
        ...form,
        price,
        originalPrice: form.originalPrice ? Number(form.originalPrice) : price,
        stock: Number(form.stock || 0),
      });
      toast.success("Product added!");
      setForm(empty);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] max-w-2xl">
      <h2 className="text-xl font-serif text-app-green mb-6">Add New Product</h2>
      <form onSubmit={submit} className="space-y-4">
        <input required placeholder="Product Name" className={input} value={form.name} onChange={(e) => set("name", e.target.value)} />

        {/* Image: upload a file, or paste a URL directly — whichever lands last in form.image wins */}
        <div>
          <label className="text-sm text-app-text-light mb-2 block">Product Image</label>
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 shrink-0 rounded-2xl bg-app-canvas border border-app-border overflow-hidden flex items-center justify-center">
              {form.image ? (
                <img src={resolveImageUrl(form.image)} alt="Preview" className="w-full h-full object-contain p-1" />
              ) : (
                <Upload className="text-app-text-light" size={24} />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                disabled={uploading}
                className="block w-full text-sm text-app-text-light file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-app-green file:text-white file:text-sm file:font-medium hover:file:bg-app-clay file:transition-colors file:cursor-pointer disabled:opacity-60"
              />
              {uploading && <p className="text-xs text-app-text-light flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Uploading...</p>}

              <div className="flex items-center gap-2">
                <input
                  placeholder="...or paste an image URL (https://...)"
                  className="flex-1 p-2.5 bg-app-canvas rounded-xl outline-none focus:ring-2 focus:ring-app-clay/30 text-sm text-app-green"
                  value={form.image}
                  onChange={(e) => set("image", e.target.value)}
                />
                {form.image && (
                  <button type="button" onClick={() => set("image", "")} className="text-app-text-light hover:text-app-clay transition-colors" title="Clear image">
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input required type="number" min={0} step="0.01" placeholder="Selling price" className={input} value={form.price} onChange={(e) => set("price", e.target.value)} />
          <input type="number" min={0} step="0.01" placeholder="Original price (optional)" className={input} value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} />
          <input required type="number" min={0} placeholder="Stock" className={input} value={form.stock} onChange={(e) => set("stock", e.target.value)} />
          <input placeholder="Unit (e.g. 500g)" className={input} value={form.unit} onChange={(e) => set("unit", e.target.value)} />
        </div>
        <select className={input} value={form.category} onChange={(e) => set("category", e.target.value)}>
          {categoriesData.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-app-text-light">
          <input type="checkbox" checked={form.isOrganic} onChange={(e) => set("isOrganic", e.target.checked)} /> Organic
        </label>
        <textarea placeholder="Description" className={`${input} h-32`} value={form.description} onChange={(e) => set("description", e.target.value)} />
        <button disabled={saving || uploading} className="w-full bg-app-green hover:bg-app-clay text-white py-4 rounded-2xl font-medium transition-colors disabled:opacity-60">
          {saving ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;