import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import "../../styles/pages/home/CreateProduct.scss";

export default function CreateProduct() {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    description: "",
    brand: "",
    categoryId: "",
    sizes: [],
  });

  const [previewMain, setPreviewMain] = useState({});
  const [previewGallery, setPreviewGallery] = useState({});

  // ===== Size =====
  const handleAddSize = () => {
    setProduct((prev) => ({
      ...prev,
      sizes: [
        ...prev.sizes,
        {
          size: "",
          price: "",
          discountPrice: "",
          weight: "",
          imageUrl: "",
          imageUrls: [],
          flavors: [],
        },
      ],
    }));
  };

  const handleRemoveSize = (i) => {
    const updated = [...product.sizes];
    updated.splice(i, 1);
    setProduct({ ...product, sizes: updated });
  };

  const handleSizeChange = (i, field, value) => {
    const updated = [...product.sizes];
    updated[i][field] = value;
    setProduct({ ...product, sizes: updated });
  };

  // ===== Flavor =====
  const handleAddFlavor = (i) => {
    const updated = [...product.sizes];
    updated[i].flavors.push({
      flavor: "",
      quantityInStock: "",
      quantitySold: "",
      active: true,
    });
    setProduct({ ...product, sizes: updated });
  };

  const handleRemoveFlavor = (i, j) => {
    const updated = [...product.sizes];
    updated[i].flavors.splice(j, 1);
    setProduct({ ...product, sizes: updated });
  };

  const handleFlavorChange = (i, j, field, value) => {
    const updated = [...product.sizes];
    updated[i].flavors[j][field] = value;
    setProduct({ ...product, sizes: updated });
  };

  // ===== Image Preview =====
  const handleImagePreview = (index, files, type = "main") => {
    if (!files || files.length === 0) return;

    if (type === "gallery") {
      const selectedFiles = Array.from(files).slice(0, 4); // tối đa 4 ảnh
      const readers = selectedFiles.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          })
      );

      Promise.all(readers).then((results) => {
        setPreviewGallery((prev) => ({
          ...prev,
          [index]: results,
        }));
        handleSizeChange(index, "imageUrls", results);
      });
    } else if (type === "main") {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewMain((prev) => ({ ...prev, [index]: reader.result }));
        handleSizeChange(index, "imageUrl", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("✅ Product data:", product);
    navigate("/products");
  };

  return (
    <div className="create-product-page">
      <div className="page-header">
        <h2>🛍️ Thêm sản phẩm mới</h2>
        <p>Điền thông tin chi tiết và tải ảnh để xem trước sản phẩm của bạn.</p>
      </div>

      <form onSubmit={handleSubmit} className="create-product-form">
        <div className="grid-two">
          <div className="form-group">
            <label>Tên sản phẩm</label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Thương hiệu</label>
            <input
              type="text"
              value={product.brand}
              onChange={(e) =>
                setProduct({ ...product, brand: e.target.value })
              }
            />
          </div>
        </div>

        <div className="form-group">
          <label>Mô tả sản phẩm</label>
          <textarea
            rows="3"
            value={product.description}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
          ></textarea>
        </div>

        <div className="form-group">
          <label>Danh mục (ID)</label>
          <input
            type="text"
            value={product.categoryId}
            onChange={(e) =>
              setProduct({ ...product, categoryId: e.target.value })
            }
          />
        </div>

        {/* ========== SIZE SECTION ========== */}
        <div className="sizes-section">
          <h3>Kích thước & Hương vị</h3>
          {product.sizes.map((size, i) => (
            <div key={i} className="size-card">
              <div className="size-header">
                <h4>Size {i + 1}</h4>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => handleRemoveSize(i)}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid-two">
                <div className="form-group">
                  <label>Kích thước</label>
                  <input
                    type="text"
                    value={size.size}
                    onChange={(e) =>
                      handleSizeChange(i, "size", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Trọng lượng</label>
                  <input
                    type="text"
                    value={size.weight}
                    onChange={(e) =>
                      handleSizeChange(i, "weight", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid-two">
                <div className="form-group">
                  <label>Giá gốc</label>
                  <input
                    type="number"
                    value={size.price}
                    onChange={(e) =>
                      handleSizeChange(i, "price", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Giá giảm</label>
                  <input
                    type="number"
                    value={size.discountPrice}
                    onChange={(e) =>
                      handleSizeChange(i, "discountPrice", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* MAIN IMAGE */}
              <div className="form-group image-upload">
                <label>Ảnh chính</label>
                <div className="image-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImagePreview(i, e.target.files, "main")
                    }
                  />
                  {previewMain[i] ? (
                    <img src={previewMain[i]} alt="preview" />
                  ) : (
                    <div className="placeholder">
                      <ImageIcon size={32} />
                      <span>Tải ảnh chính</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SUB IMAGES */}
              <div className="form-group">
                <label>Ảnh phụ (tối đa 4)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    handleImagePreview(i, e.target.files, "gallery")
                  }
                />
                <div className="preview-gallery">
                  {(previewGallery[i] || []).map((url, idx) => (
                    <img key={idx} src={url} alt={`sub-preview-${idx}`} />
                  ))}
                </div>
              </div>

              {/* FLAVORS */}
              <div className="flavors-section">
                <h4>Hương vị</h4>
                {size.flavors.map((flavor, j) => (
                  <div key={j} className="flavor-item">
                    <input
                      type="text"
                      placeholder="Tên hương vị"
                      value={flavor.flavor}
                      onChange={(e) =>
                        handleFlavorChange(i, j, "flavor", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      placeholder="Tồn kho"
                      value={flavor.quantityInStock}
                      onChange={(e) =>
                        handleFlavorChange(
                          i,
                          j,
                          "quantityInStock",
                          e.target.value
                        )
                      }
                    />
                    <input
                      type="number"
                      placeholder="Đã bán"
                      value={flavor.quantitySold}
                      onChange={(e) =>
                        handleFlavorChange(i, j, "quantitySold", e.target.value)
                      }
                    />
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={flavor.active}
                        onChange={(e) =>
                          handleFlavorChange(i, j, "active", e.target.checked)
                        }
                      />
                      <span>Active</span>
                    </label>
                    <button
                      type="button"
                      className="btn-remove-small"
                      onClick={() => handleRemoveFlavor(i, j)}
                    >
                      ✖
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-add"
                  onClick={() => handleAddFlavor(i)}
                >
                  <Plus size={16} /> Thêm hương vị
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="btn-add-size"
            onClick={handleAddSize}
          >
            <Plus size={18} /> Thêm Size
          </button>
        </div>

        <button type="submit" className="btn-submit">
          ✅ Tạo sản phẩm
        </button>
      </form>
    </div>
  );
}
