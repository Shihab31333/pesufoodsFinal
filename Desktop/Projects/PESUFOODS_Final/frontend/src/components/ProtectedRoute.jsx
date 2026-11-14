import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function ProtectedRoute({ children, admin = false }) { const { user, loading } = useAuth(); if (loading) return <main className="center">Loading...</main>; return user && (!admin || user.role === 'admin') ? children : <Navigate to="/login" replace/>; }
