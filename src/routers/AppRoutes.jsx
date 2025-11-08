// src/routes/AppRoutes.jsx

import { Routes, Route } from "react-router-dom";
import SignIn from "../pages/auth/SignIn.jsx";

import AdminDashboard from "../layouts/AdminDashboard.jsx";
import ProductManagement from "../pages/home/ProductManagement.jsx";
import CategoryManagement from "../pages/home/CategoryManagement.jsx";
// 👈 Đảm bảo bạn đã import AdminRoute
import AdminRoute from "./AdminRoute.jsx"; 

export default function AppRoutes() {
  return (
    <Routes>
      
      {/* ======================================================= */}
      {/* 🛡️ 1. Tuyến Bảo Vệ (AdminRoute) */}
      {/* Các tuyến con chỉ được truy cập nếu người dùng là ADMIN */}
      <Route element={<AdminRoute />}>
        
        {/* 🏢 2. Layout Admin (AdminDashboard) */}
        {/* Sau khi qua kiểm tra quyền, load Layout Admin */}
        <Route element={<AdminDashboard />}>
          {/* Các tuyến con cần được bảo vệ */}
          <Route path="/" element={<div>Admin Dashboard Home</div>} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/product-types" element={<CategoryManagement />} />
        </Route>
      </Route>
      
      {/* ======================================================= */}
      {/* 🔓 Tuyến Công Khai (Trang Đăng nhập) */}
      <Route path="/signIn" element={<SignIn />} />
    </Routes>
  );
}