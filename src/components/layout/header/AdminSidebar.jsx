import { useState } from 'react';
import { Home, Users, Package, BarChart, ChevronDown, ChevronUp } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import '../../../styles/layout/AdminSidebar.scss';

// Component con để render một mục menu
const MenuItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isSubMenuActive = item.submenu && item.submenu.some(sub => location.pathname.startsWith(sub.path));

  // Tự động mở submenu nếu đang ở một trong các đường dẫn con
  useState(() => {
    if (isSubMenuActive) {
      setIsOpen(true);
    }
  }, [isSubMenuActive]);

  if (item.submenu) {
    // Render menu đa cấp (có submenu)
    return (
      <div className={`menu-item-dropdown ${isOpen ? 'open' : ''}`}>
        <div
          className={`menu-item parent ${isSubMenuActive ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {item.icon}
          <span>{item.label}</span>
          {isOpen ? <ChevronUp size={16} className="chevron" /> : <ChevronDown size={16} className="chevron" />}
        </div>
        {isOpen && (
          <div className="submenu">
            {item.submenu.map((sub) => (
              <NavLink
                key={sub.path}
                to={sub.path}
                className={({ isActive }) =>
                  isActive ? "submenu-item active" : "submenu-item"
                }
              >
                <span>{sub.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render mục menu đơn
  return (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) =>
        isActive ? "menu-item active" : "menu-item"
      }
    >
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  );
};

export default function AdminSidebar() {
  const menuItems = [
    { path: "/home", icon: <Home size={18} />, label: "Tổng quan" },
    {
      label: "Sản phẩm",
      icon: <Package size={18} />,
      submenu: [
        { path: "/products", label: "Danh sách Sản phẩm" },
        { path: "/product-types", label: "Loại sản phẩm" },
      ],
    },
    { path: "/users", icon: <Users size={18} />, label: "Người dùng" },
    { path: "/stats", icon: <BarChart size={18} />, label: "Thống kê" },
  ];

  return (
    <aside className="admin-sidebar">
      <nav>
        {menuItems.map((item, index) => (
          <MenuItem key={item.path || index} item={item} />
        ))}
      </nav>
    </aside>
  );
}