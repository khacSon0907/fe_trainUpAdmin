import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { Spin } from "antd";
import { useEffect } from "react";
import { fetchCurrentUser } from "../stores/slices/authSlice";

const REQUIRED_ROLE = "ADMIN";

export default function AdminRoute() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  // Fetch user khi chưa có
  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  // Hàm check quyền
  const checkIsAdmin = (userData) => {
    return userData?.roles?.some(role => role.name === REQUIRED_ROLE);
  };

  // Loading
  if (loading || !user) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" tip="Đang kiểm tra quyền..." />
      </div>
    );
  }

  // Chưa login
  if (!user) return <Navigate to="/signIn" replace />;

  // Không phải admin
  if (!checkIsAdmin(user)) return <Navigate to="/" replace />;

  // Admin → render con
  return <Outlet />;
}
