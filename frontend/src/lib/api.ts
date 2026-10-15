// Thin fetch wrapper around the backend API.
// Set VITE_API_URL in frontend/.env, e.g. VITE_API_URL=http://localhost:5000/api

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// The /uploads static path lives on the same host as the API, one level up
// (BASE_URL ends in /api; the uploaded files don't).
export const UPLOADS_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

function getToken() {
  return localStorage.getItem("token");
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
}

export const api = {
  // --- auth ---
  signup: (body: { name: string; email: string; password: string; phone?: string }) =>
    request("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  getMe: () => request("/auth/me"),
    forgotPassword: (email: string) =>
    request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) =>
    request(`/auth/reset-password/${token}`, { method: "POST", body: JSON.stringify({ password }) }),

  // --- products ---
  getProducts: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ""}`);
  },
  getDeals: () => request("/products/deals"),
  getProductById: (id: string) => request(`/products/${id}`),
    canReview: (productId: string) => request(`/products/${productId}/can-review`), 
  getReviews: (productId: string) => request(`/products/${productId}/reviews`),
  submitReview: (productId: string, body: { rating: number; comment: string }) =>
    request(`/products/${productId}/reviews`, { method: "POST", body: JSON.stringify(body) }),
  deleteReview: (productId: string) => request(`/products/${productId}/reviews`, { method: "DELETE" }),
  createProduct: (body: object) => request("/products", { method: "POST", body: JSON.stringify(body) }),
    // multipart upload — can't go through request() since that always sets a JSON Content-Type
  uploadProductImage: async (file: File) => {
    const form = new FormData();
    form.append("image", file);
    const res = await fetch(`${BASE_URL}/products/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Upload failed (${res.status})`);
    return data as { url: string };
  },
  updateProduct: (id: string, body: object) =>
    request(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProduct: (id: string) => request(`/products/${id}`, { method: "DELETE" }),

  // --- addresses ---
  getAddresses: () => request("/addresses"),
  addAddress: (body: object) => request("/addresses", { method: "POST", body: JSON.stringify(body) }),
  updateAddress: (id: string, body: object) =>
    request(`/addresses/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteAddress: (id: string) => request(`/addresses/${id}`, { method: "DELETE" }),
    // --- cart ---
  getCart: () => request("/cart"),
  syncCart: (items: { productId: string; quantity: number }[]) =>
    request("/cart", { method: "PUT", body: JSON.stringify({ items }) }),
    // --- payments ---
  createPaymentIntent: (amount: number) =>
    request("/payments/create-intent", { method: "POST", body: JSON.stringify({ amount }) }),

  // --- orders ---
  createOrder: (body: object) => request("/orders", { method: "POST", body: JSON.stringify(body) }),
  getMyOrders: () => request("/orders"),
  getOrderById: (id: string) => request(`/orders/${id}`),
  cancelOrder: (id: string) => request(`/orders/${id}/cancel`, { method: "POST" }),
  verifyOtp: (id: string, otp: string) =>
    request(`/orders/${id}/verify-otp`, { method: "POST", body: JSON.stringify({ otp }) }),
  updateLocation: (id: string, body: { lat: number; lng: number }) =>
    request(`/orders/${id}/location`, { method: "PUT", body: JSON.stringify(body) }),
  updateOrderStatus: (id: string, body: object) =>
    request(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify(body) }),

  // --- admin ---
  getDashboard: () => request("/admin/dashboard"),
  getAllOrders: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/orders${qs ? `?${qs}` : ""}`);
  },
    getDeliveryPartners: () => request("/admin/delivery-partners"),
  createDeliveryPartner: (body: object) =>
    request("/admin/delivery-partners", { method: "POST", body: JSON.stringify(body) }),
  updateDeliveryPartner: (id: string, body: object) =>
    request(`/admin/delivery-partners/${id}`, { method: "PUT", body: JSON.stringify(body) }),
};

export const API_SOCKET_URL = BASE_URL.replace(/\/api\/?$/, "");