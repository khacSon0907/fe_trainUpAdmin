import { Routes, Route } from "react-router-dom";
import SignIn from "../pages/auth/SignIn.jsx";
import AdminDashboard from "../layouts/AdminDashboard.jsx";
import ProductManagement from "../pages/home/ProductManagement.jsx";
import CategoryManagement from "../pages/home/CategoryManagement.jsx";
import AdminRoute from "./AdminRoute.jsx";
import CreateProduct from "../pages/home/CreateProduct.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ======================================================= */}
      {/* 🛡️ 1. Tuyến Bảo Vệ (AdminRoute) */}
      <Route element={<AdminRoute />}>
        {/* 🏢 2. Layout Admin (AdminDashboard) */}
        <Route element={<AdminDashboard />}>
          <Route path="/" element={<div>Admin Dashboard Home</div>} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/product-types" element={<CategoryManagement />} />

          {/* ✅ Thêm tuyến cho CreateProduct */}
          <Route path="/add-product" element={<CreateProduct />} />
          <Route path="/add-product/:id" element={<CreateProduct />} />
        </Route>
      </Route>

      {/* ======================================================= */}
      {/* 🔓 Tuyến Công Khai (Trang Đăng nhập) */}
      <Route path="/signIn" element={<SignIn />} />
    </Routes>
  );
}
