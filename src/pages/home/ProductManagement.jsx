import React, { useState } from "react";
import "../../styles/pages/home/ProductManagement.scss";

export default function ProductManagement() {
  const [expandedProducts, setExpandedProducts] = useState({});
  const [expandedImages, setExpandedImages] = useState({});

  const products = [
    {
      name: "Whey ISO HD",
      description: "Dòng whey isolate cao cấp hỗ trợ phục hồi cơ nhanh.",
      brand: "BPI Sports",
      categoryId: "69100ee708c7711e2a8631a6",
      sizes: [
        {
          size: "5lb",
          price: 1650000,
          discountPrice: 1500000,
          imageUrl:
            "https://www.wheystore.vn/images/products/2023/11/22/resized/rule1-protein-5lbs_1700622059.jpg.webp",
          imageUrls: [
            "https://www.wheystore.vn/images/products/2024/01/25/small/rule-1-5lbs-2_1706177653.jpg.webp",
            "https://www.wheystore.vn/images/products/2023/11/21/small/anh-san-pham-rule1-protein-5lbs_1700622044.jpg.webp",
          ],
          weight: "2.3kg",
          flavors: [
            { flavor: "Socola", quantityInStock: 20, quantitySold: 5, active: true },
            { flavor: "Vani", quantityInStock: 15, quantitySold: 3, active: true },
          ],
        },
        {
          size: "5lb",
          price: 1650000,
          discountPrice: 1500000,
          imageUrl:
            "https://www.wheystore.vn/images/products/2023/11/22/resized/rule1-protein-5lbs_1700622059.jpg.webp",
          imageUrls: [
            "https://www.wheystore.vn/images/products/2024/01/25/small/rule-1-5lbs-2_1706177653.jpg.webp",
            "https://www.wheystore.vn/images/products/2023/11/21/small/anh-san-pham-rule1-protein-5lbs_1700622044.jpg.webp",
          ],
          weight: "2.3kg",
          flavors: [
            { flavor: "Socola", quantityInStock: 20, quantitySold: 5, active: true },
            { flavor: "Vani", quantityInStock: 15, quantitySold: 3, active: true },
          ],
        },
      ],
    },{
      name: "Whey Gold",
      description: "Dòng whey isolate cao cấp hỗ trợ phục hồi cơ nhanh.",
      brand: "BPI Sports",
      categoryId: "69100ee708c7711e2a8631a6",
      sizes: [
        {
          size: "5lb",
          price: 1650000,
          discountPrice: 1500000,
          imageUrl:
            "https://www.wheystore.vn/images/products/2023/11/22/resized/rule1-protein-5lbs_1700622059.jpg.webp",
          imageUrls: [
            "https://www.wheystore.vn/images/products/2024/01/25/small/rule-1-5lbs-2_1706177653.jpg.webp",
            "https://www.wheystore.vn/images/products/2023/11/21/small/anh-san-pham-rule1-protein-5lbs_1700622044.jpg.webp",
          ],
          weight: "2.3kg",
          flavors: [
            { flavor: "Socola", quantityInStock: 20, quantitySold: 5, active: true },
            { flavor: "Vani", quantityInStock: 15, quantitySold: 3, active: true },
          ],
        },
        {
          size: "5lb",
          price: 1650000,
          discountPrice: 1500000,
          imageUrl:
            "https://www.wheystore.vn/images/products/2023/11/22/resized/rule1-protein-5lbs_1700622059.jpg.webp",
          imageUrls: [
            "https://www.wheystore.vn/images/products/2024/01/25/small/rule-1-5lbs-2_1706177653.jpg.webp",
            "https://www.wheystore.vn/images/products/2023/11/21/small/anh-san-pham-rule1-protein-5lbs_1700622044.jpg.webp",
          ],
          weight: "2.3kg",
          flavors: [
            { flavor: "Socola", quantityInStock: 20, quantitySold: 5, active: true },
            { flavor: "Vani", quantityInStock: 15, quantitySold: 3, active: true },
          ],
        },
      ],
    },
  ];

  const toggleProduct = (productIndex, sizeIndex) => {
    const key = `${productIndex}-${sizeIndex}`;
    setExpandedProducts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleImages = (productIndex, sizeIndex) => {
    const key = `${productIndex}-${sizeIndex}`;
    setExpandedImages((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="product-manager-container">
      <h1 className="title">Quản lý sản phẩm</h1>

      <div className="product-list">
        {products.map((product, pIndex) => (
          <div className="product-card" key={pIndex}>
            <div className="product-header">
              <h2>{product.name}</h2>
              <p className="brand">{product.brand}</p>
              <p className="description">{product.description}</p>
            </div>

            <div className="sizes">
              {product.sizes.map((s, sIndex) => {
                const sizeKey = `${pIndex}-${sIndex}`;
                const isExpanded = expandedProducts[sizeKey] || false;
                const isImagesExpanded = expandedImages[sizeKey] || false;

                return (
                  <div className="size-card" key={sIndex}>
                    <div
                      className="size-header"
                      onClick={() => toggleProduct(pIndex, sIndex)}
                    >
                      <img src={s.imageUrl} alt={product.name} className="size-img" />
                      <div className="size-info">
                        <p>Size: {s.size}</p>
                        <p>Giá: {s.price.toLocaleString()} VNĐ</p>
                        <p>Giá giảm: {s.discountPrice.toLocaleString()} VNĐ</p>
                        <p>Trọng lượng: {s.weight}</p>
                      </div>
                      <span className="expand-icon">{isExpanded ? "▲" : "▼"}</span>
                    </div>

                    {isExpanded && (
                      <div className="size-details">
                        <div className="flavors">
                          <h4>Hương vị:</h4>
                          <ul>
                            {s.flavors.map((f, fIndex) => (
                              <li key={fIndex}>
                                {f.flavor} - Còn: {f.quantityInStock}, Đã bán:{" "}
                                {f.quantitySold} {f.active ? "(Active)" : "(Inactive)"}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {s.imageUrls.length > 0 && (
                          <div className="image-section">
                            <button
                              className="toggle-images-btn"
                              onClick={() => toggleImages(pIndex, sIndex)}
                            >
                              {isImagesExpanded ? "Ẩn ảnh phụ" : "Xem ảnh phụ"}
                            </button>
                            {isImagesExpanded && (
                              <div className="image-gallery">
                                {s.imageUrls.map((url, idx) => (
                                  <img key={idx} src={url} alt={`Sub ${idx}`} />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
