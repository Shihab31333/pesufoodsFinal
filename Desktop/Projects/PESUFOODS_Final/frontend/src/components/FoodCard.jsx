import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
export default function FoodCard({ item }) {
  const { addItem } = useCart();
  const add = () => { const result = addItem(item); if (result.blocked) alert('You can order from only one canteen at a time. Clear your existing cart to switch canteens.'); else if (result.maxed) alert('Maximum available quantity reached'); };
  return <article className="food-card"><img src={item.image} alt={item.name} onError={(event) => { event.currentTarget.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800'; }}/><div className="food-body"><div className="food-meta"><span>{item.category}</span><strong>₹{item.price}</strong></div><h3>{item.name}</h3><p>{item.description}</p><small className={item.stock < 1 ? 'danger' : ''}>{item.stock < 1 ? 'Out of stock' : item.stock < 4 ? `Only ${item.stock} left` : `${item.stock} available`}</small><button className="add-button" disabled={!item.isAvailable || item.stock < 1} onClick={add}><Plus size={16}/> Add</button></div></article>;
}
