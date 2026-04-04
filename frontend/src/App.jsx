import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar          from "./components/layout/Navbar";
import Footer          from "./components/layout/Footer";
import ProtectedRoute  from "./components/common/ProtectedRoute";
import AdminRoute      from "./components/common/AdminRoute";

// Pages
import HomePage        from "./pages/HomePage";
import ProductsPage    from "./pages/ProductsPage";
import ProductDetail   from "./pages/ProductDetail";
import CartPage        from "./pages/CartPage";
import CheckoutPage    from "./pages/CheckoutPage";
import LoginPage       from "./pages/LoginPage";
import SignupPage      from "./pages/SignupPage";
import DashboardPage   from "./pages/DashboardPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AdminDashboard  from "./pages/admin/AdminDashboard";
import AdminProducts   from "./pages/admin/AdminProducts";
import AdminOrders     from "./pages/admin/AdminOrders";
import NotFound        from "./pages/NotFound";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="page-content">
        <Routes>
          {/* Public */}
          <Route path="/"              element={<HomePage />} />
          <Route path="/products"      element={<ProductsPage />} />
          <Route path="/products/:id"  element={<ProductDetail />} />
          <Route path="/login"         element={<LoginPage />} />
          <Route path="/signup"        element={<SignupPage />} />

          {/* Protected — user only */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart"            element={<CartPage />} />
            <Route path="/checkout"        element={<CheckoutPage />} />
            <Route path="/dashboard"       element={<DashboardPage />} />
            <Route path="/orders/:id"      element={<OrderDetailPage />} />
          </Route>

          {/* Protected — admin only */}
          <Route element={<AdminRoute />}>
            <Route path="/admin"           element={<AdminDashboard />} />
            <Route path="/admin/products"  element={<AdminProducts />} />
            <Route path="/admin/orders"    element={<AdminOrders />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
