import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { CartItem, Product } from "../types";
import { useAuth } from "./AuthContext";
import { api } from "../lib/api";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const GUEST_CART_KEY = "app_cart";
const SYNC_DEBOUNCE_MS = 600;

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Guards so the load effect's own setItems() doesn't immediately trigger
  // the persist effect right back at the server/localStorage.
  const skipNextPersistRef = useRef(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Load cart whenever auth state changes (covers first mount, login, logout) ---
  useEffect(() => {
    let cancelled = false;

    const loadGuestCart = (): CartItem[] => {
      const saved = localStorage.getItem(GUEST_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    };

    if (!isAuthenticated) {
      skipNextPersistRef.current = true;
      setItems(loadGuestCart());
      return;
    }

    // Logged in: fetch the server cart, then fold in anything sitting in the
    // guest cart (e.g. items added before signing in), summing quantities on
    // a product that's in both. Push the merged result back once, then wipe
    // the guest copy so it doesn't get merged in again on a future login.
    api
      .getCart()
      .then(({ items: serverItems }: { items: CartItem[] }) => {
        if (cancelled) return;

        const guestItems = loadGuestCart();
        if (guestItems.length === 0) {
          skipNextPersistRef.current = true;
          setItems(serverItems);
          return;
        }

        const merged = [...serverItems];
        for (const guestItem of guestItems) {
          const existing = merged.find((i) => i.product._id === guestItem.product._id);
          if (existing) existing.quantity += guestItem.quantity;
          else merged.push(guestItem);
        }

        skipNextPersistRef.current = true;
        setItems(merged);
        localStorage.removeItem(GUEST_CART_KEY);
        api.syncCart(merged.map((i) => ({ productId: i.product._id, quantity: i.quantity }))).catch(() => {});
      })
      .catch(() => {
        if (!cancelled) {
          skipNextPersistRef.current = true;
          setItems([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // --- Persist on every change: localStorage for guests, debounced API call when logged in ---
  useEffect(() => {
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    if (!isAuthenticated) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
      return;
    }

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      api.syncCart(items.map((i) => ({ productId: i.product._id, quantity: i.quantity }))).catch(() => {});
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [items, isAuthenticated]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setIsCartOpen(false);
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use the context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};