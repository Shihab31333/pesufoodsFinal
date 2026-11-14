import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Canteens from './pages/Canteens';
import CanteenDetails from './pages/CanteenDetails';
import Auth from './pages/Auth';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Success from './pages/Success';
import AdminDashboard from './pages/admin/AdminDashboard';
export default function App() { return <BrowserRouter><Navbar/><Routes><Route path="/" element={<Home/>}/><Route path="/canteens" element={<Canteens/>}/><Route path="/canteens/:id" element={<CanteenDetails/>}/><Route path="/login" element={<Auth/>}/><Route path="/signup" element={<Auth signup/>}/><Route path="/cart" element={<Cart/>}/><Route path="/checkout" element={<ProtectedRoute><Checkout/></ProtectedRoute>}/><Route path="/orders" element={<ProtectedRoute><Orders/></ProtectedRoute>}/><Route path="/success/:id" element={<ProtectedRoute><Success/></ProtectedRoute>}/><Route path="/admin" element={<ProtectedRoute admin><AdminDashboard/></ProtectedRoute>}/></Routes><footer><span className="brand"><span>PF</span>PESUFOODS</span><p>Made for campus. Served with care.</p></footer></BrowserRouter>; }
