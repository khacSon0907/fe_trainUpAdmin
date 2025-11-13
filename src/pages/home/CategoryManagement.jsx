import { useState, useEffect } from "react";
import { message, Modal } from "antd";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import categoryService from "../../services/categoryService";
import { categorySchema } from "../../util/validators";
import { ERROR_CODES } from "../../util/constants";
import "../../styles/pages/home/CategoryManagement.scss";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [errorModal, setErrorModal] = useState(false);

  // 🧭 React Hook Form + Yup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(categorySchema),
  });

  // 🧭 Lấy danh mục
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll();
      const data = res.data?.data || [];
      setCategories(data);
      setFiltered(data);
    } catch (err) {
      console.error("❌ Lỗi tải danh mục:", err);
      message.error("Không thể tải danh mục!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔍 Tìm kiếm với trim
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value); // Hiển thị giá trị gốc (có khoảng trắng)

    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      setFiltered(categories);
      return;
    }

    try {
      const res = await categoryService.search(trimmedValue);
      setFiltered(res.data?.data || []);
    } catch (err) {
      console.error("Lỗi tìm kiếm:", err);
    }
  };

  //  Submit form (tạo hoặc cập nhật)
  const onSubmit = async (data) => {
    // ✅ Kiểm tra trùng lặp tên không phân biệt hoa/thường
    const normalizedName = data.name.trim().toLowerCase();
    const isDuplicate = categories.some(cat => {
      // Bỏ qua danh mục đang edit
      if (editingId && cat.id === editingId) return false;
      return cat.name.trim().toLowerCase() === normalizedName;
    });

    if (isDuplicate) {
      setServerMessage("⚠️ Tên danh mục đã tồn tại!");
      setErrorModal(true);
      return;
    }

    try {
      if (editingId) {
        await categoryService.update(editingId, data);
        message.success("✅ Cập nhật danh mục thành công!");
      } else {
        await categoryService.create(data);
        message.success("🎉 Thêm danh mục thành công!");
      }
      setShowModal(false);
      setEditingId(null);
      reset();
      fetchCategories();
    } catch (error) {
      console.error("❌ Lỗi lưu danh mục:", error);
      const errCode = error?.response?.data?.code;

      switch (errCode) {
        case ERROR_CODES.CATEGORY_ALREADY_EXISTS:
          setServerMessage("Danh mục này đã tồn tại!");
          break;
        case ERROR_CODES.CATEGORY_NAME_REQUIRED:
          setServerMessage("⚠️ Tên danh mục không được để trống!");
          break;
        default:
          setServerMessage("Tên danh mục phải có ít nhất 3 ký tự!");
          break;
      }
      setErrorModal(true);
    }
  };

  // ✏️ Sửa danh mục
  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setValue("name", cat.name);
    setValue("description", cat.description);
    setValue("active", cat.active);
    setShowModal(true);
  };
  const handleCancelEdit = () => {
    setEditingId(null);
    reset();
    setShowModal(false);
  }

  // 🗑️ Xóa danh mục
  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa danh mục này không?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await categoryService.remove(id);
          message.success("🗑️ Xóa danh mục thành công!");
          fetchCategories();
        } catch (err) {
          console.error("❌ Lỗi xóa danh mục:", err);
          message.error("Không thể xóa danh mục!");
        }
      },
    });
  };

  // 🟢 Toggle trạng thái
  const toggleActive = async (cat) => {
    try {
      await categoryService.update(cat.id, { ...cat, active: !cat.active });
      message.success("🔄 Cập nhật trạng thái thành công!");
      fetchCategories();
    } catch (err) {
      console.error("❌ Lỗi cập nhật trạng thái:", err);
      message.error("Không thể cập nhật trạng thái!");
    }
  };

  return (
    <div className="category-page">
      <div className="page-header">
        <h2 className="page-title">Quản lý loại sản phẩm</h2>
        <div className="actions">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-box"
          />
          <button
            className="btn-add"
            onClick={() => {
              setShowModal(true);
              reset({ name: "", description: "", active: true });
            }}
          >
            ➕ Thêm danh mục
          </button>
        </div>
      </div>

      {loading ? (
        <p>⏳ Đang tải danh mục...</p>
      ) : (
        <div className="category-list">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên loại</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((cat, index) => (
                  <tr key={cat.id}>
                    <td>{index + 1}</td>
                    <td>{cat.name}</td>
                    <td>{cat.description || "—"}</td>
                    <td>
                      <span
                        className={`status ${
                          cat.active ? "active" : "inactive"
                        }`}
                        onClick={() => toggleActive(cat)}
                      >
                        {cat.active ? "🟢 Còn hàng" : "🔴 Hết hàng"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn edit"
                        onClick={() => handleEdit(cat)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn delete"
                        onClick={() => handleDelete(cat.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    Không tìm thấy danh mục nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 🪟 Modal Thêm/Sửa */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? "✏️ Cập nhật danh mục" : "➕ Thêm danh mục mới"}</h3>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label>Tên danh mục</label>
                <input {...register("name")} placeholder="Nhập tên danh mục..." />
                {errors.name && <p className="error-text">{errors.name.message}</p>}
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  {...register("description")}
                  placeholder="Nhập mô tả..."
                />
                {errors.description && (
                  <p className="error-text">{errors.description.message}</p>
                )}
              </div>

              <div className="form-group radio-group">
                <label>Trạng thái</label>
                <div className="radio-options">
                  <label>
                    <input
                      type="radio"
                      value="true"
                      {...register("active")}
                      defaultChecked
                    />
                    🟢 Còn hàng
                  </label>
                  <label>
                    <input type="radio" value="false" {...register("active")} />
                    🔴 Hết hàng
                  </label>
                </div>
                {errors.active && (
                  <p className="error-text">{errors.active.message}</p>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => handleCancelEdit()}
                >
                  Hủy
                </button>
                <button className="btn-submit" type="submit">
                  {editingId ? "Lưu thay đổi" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal lỗi server */}
      <Modal
        open={errorModal}
        footer={[
          <button key="ok" onClick={() => setErrorModal(false)} className="btn-submit">
            Đóng
          </button>,
        ]}
        onCancel={() => setErrorModal(false)}
        centered
      >
        <div style={{ textAlign: "center" }}>
          <h2>❌ Không thể lưu vào danh mục</h2>
          <p>{serverMessage}</p>
        </div>
      </Modal>
    </div>
  );
};

export default CategoryManagement;
