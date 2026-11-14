import { Link } from 'react-router-dom';
import { ShoppingBag, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
export default function Navbar() {
  const { user, logout } = useAuth(); const { items } = useCart();
  return <header className="nav"><Link className="brand" to="/"><span>PF</span>PESUFOODS</Link><nav><Link to="/">Home</Link><Link to="/canteens">Canteens</Link>{user && <Link to="/orders">My Orders</Link>}{user?.role === 'admin' && <Link to="/admin">Admin</Link>}</nav><div className="nav-actions"><Link to="/cart" className="cart-link"><ShoppingBag size={19}/><b>{items.length}</b></Link>{user ? <button className="text-button" onClick={logout}><UserRound size={17}/> Logout</button> : <Link className="button small" to="/login">Sign in</Link>}</div></header>;
}
