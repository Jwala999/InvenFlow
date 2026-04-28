import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotifProvider } from './context/NotifContext';
import CartSidebar from './components/CartSidebar';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import StockPage from './pages/StockPage';
import UsersPage from './pages/UsersPage';
import ShopPage from './pages/ShopPage';
import CheckoutPage from './pages/CheckoutPage';
import ActivityPage from './pages/ActivityPage';
import OrderPage from './pages/OrderPage';

// ── Spinner while auth state loads ──────────────────────────────────────────
const Spinner = () => (
  <div style={{ minHeight:'100vh', background:'#080B12', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
    <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid rgba(110,231,183,0.15)', borderTopColor:'#6EE7B7', animation:'spin 0.8s linear infinite' }} />
    <p style={{ color:'#4b5563', fontFamily:'monospace', fontSize:13 }}>Loading InvenFlow…</p>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ── Guard for protected routes ───────────────────────────────────────────────
const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// ── Inner app that has access to useAuth (for NotifProvider) ─────────────────
function InnerApp() {
  const { user } = useAuth();

  return (
    <NotifProvider user={user}>
      <CartProvider>
        {/* Cart drawer lives at root so it overlays everything */}
        <CartSidebar />

        <Routes>
          {/* ── Public routes ── */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/shop"     element={<ShopPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* ── Protected dashboard routes ── */}
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index           element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="stock"    element={<StockPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="orders"   element={<OrderPage />} />
            <Route path="users"    element={<PrivateRoute adminOnly><UsersPage /></PrivateRoute>} />
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </NotifProvider>
  );
}

// ── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <InnerApp />
      </BrowserRouter>
    </AuthProvider>
  );
}