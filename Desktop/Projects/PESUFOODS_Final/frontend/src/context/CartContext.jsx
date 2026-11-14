import { createContext, useContext, useMemo, useState } from 'react';
const CartContext = createContext(null);
const stored = JSON.parse(localStorage.getItem('pesufoods-cart') || '[]');
export function CartProvider({ children }) {
  const [items, setItems] = useState(stored);
  const persist = (next) => { setItems(next); localStorage.setItem('pesufoods-cart', JSON.stringify(next)); };
  const addItem = (item) => {
    if (items.length && items[0].canteen._id !== item.canteen._id) return { blocked: true };
    const found = items.find((entry) => entry.itemId === item._id);
    if (found && found.quantity >= item.stock) return { blocked: false, maxed: true };
    persist(found ? items.map((entry) => entry.itemId === item._id ? { ...entry, quantity: entry.quantity + 1, stock: item.stock } : entry) : [...items, { itemId: item._id, canteen: item.canteen, name: item.name, image: item.image, price: item.price, stock: item.stock, quantity: 1 }]);
    return { blocked: false };
  };
  const updateQuantity = (id, quantity) => { const entry = items.find((item) => item.itemId === id); if (entry && quantity >= 1 && quantity <= entry.stock) persist(items.map((item) => item.itemId === id ? { ...item, quantity } : item)); };
  const removeItem = (id) => persist(items.filter((item) => item.itemId !== id));
  const clearCart = () => persist([]);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const value = useMemo(() => ({ items, addItem, updateQuantity, removeItem, clearCart, total }), [items, total]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
