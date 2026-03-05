import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
  setCart((prevCart) => {
    if (!item.size) {
      const existing = prevCart.find((i) => i.id === item.id);
      if (existing) return prevCart;
      return [...prevCart, { ...item, quantity: 1 }];
    }

    const existing = prevCart.find(
      (i) => i.id === item.id && i.size === item.size
    );

    if (existing) {
      return prevCart.map((i) =>
        i.id === item.id && i.size === item.size
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      return [...prevCart, item];
    }
  });
};


  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setCart((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity } : p))
    );
  };

  const updateSize = (id, size) => {
    setCart((prev) =>
      prev.map((p) => (p.id === id ? { ...p, size } : p))
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, updateSize, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);