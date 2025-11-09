// ProductManagement.jsx
import React, { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, Edit, Trash2, Eye, Package, TrendingUp } from "lucide-react";
import "../../styles/pages/home/ProductManagement.scss";

export default function ProductManagement() {
  const products = [
    {
      id: 1,
      name: "Whey ISO HD",
      description: "Dòng whey isolate cao cấp hỗ trợ phục hồi cơ nhanh.",
      brand: "BPI Sports",
      categoryId: "69100ee708c7711e2a8631a6",
      sizes: [
        {
          size: "5lb",
          price: 1650000,
          discountPrice: 1500000,
          imageUrl: "https://www.wheystore.vn/images/products/2023/11/22/resized/rule1-protein-5lbs_1700622059.jpg.webp",
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
          size: "2lb",
          price: 850000,
          discountPrice: 800000,
          imageUrl: "https://www.wheystore.vn/images/products/2023/11/22/resized/rule1-protein-5lbs_1700622059.jpg.webp",
          imageUrls: [],
          weight: "0.9kg",
          flavors: [
            { flavor: "Dâu", quantityInStock: 10, quantitySold: 8, active: true },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Whey Gold Standard",
      description: "Sản phẩm whey protein phổ biến nhất thế giới.",
      brand: "Optimum Nutrition",
      categoryId: "69100ee708c7711e2a8631a6",
      sizes: [
        {
          size: "5lb",
          price: 1750000,
          discountPrice: 1650000,
          imageUrl: "https://www.wheystore.vn/images/products/2023/11/22/resized/rule1-protein-5lbs_1700622059.jpg.webp",
          imageUrls: [],
          weight: "2.3kg",
          flavors: [
            { flavor: "Double Chocolate", quantityInStock: 30, quantitySold: 12, active: true },
            { flavor: "Vanilla Ice Cream", quantityInStock: 25, quantitySold: 7, active: true },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Mass Gainer XXL",
      description: "Tăng cân nhanh chóng với công thức cao năng lượng.",
      brand: "MuscleTech",
      categoryId: "69100ee708c7711e2a8631a7",
      sizes: [
        {
          size: "12lb",
          price: 2200000,
          discountPrice: 2000000,
          imageUrl: "https://www.wheystore.vn/images/products/2023/11/22/resized/rule1-protein-5lbs_1700622059.jpg.webp",
          imageUrls: [],
          weight: "5.4kg",
          flavors: [
            { flavor: "Chocolate", quantityInStock: 8, quantitySold: 15, active: true },
          ],
        },
      ],
    },
    {
      id: 4,
      name: "BCAA Energy",
      description: "Bổ sung amino acid thiết yếu và năng lượng.",
      brand: "Evlution Nutrition",
      categoryId: "69100ee708c7711e2a8631a8",
      sizes: [
        {
          size: "30 servings",
          price: 650000,
          discountPrice: 600000,
          imageUrl: "https://www.wheystore.vn/images/products/2023/11/22/resized/rule1-protein-5lbs_1700622059.jpg.webp",
          imageUrls: [],
          weight: "0.3kg",
          flavors: [
            { flavor: "Blue Raz", quantityInStock: 40, quantitySold: 20, active: true },
            { flavor: "Fruit Punch", quantityInStock: 35, quantitySold: 18, active: true },
          ],
        },
      ],
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [expandedRows, setExpandedRows] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const itemsPerPage = 5;

  const brands = ["all", ...new Set(products.map(p => p.brand))];

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = selectedBrand === "all" || product.brand === selectedBrand;
      return matchesSearch && matchesBrand;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        if (sortConfig.key === 'price') {
          aValue = Math.min(...a.sizes.map(s => s.discountPrice));
          bValue = Math.min(...b.sizes.map(s => s.discountPrice));
        } else if (sortConfig.key === 'stock') {
          aValue = a.sizes.reduce((sum, s) => sum + s.flavors.reduce((fSum, f) => fSum + f.quantityInStock, 0), 0);
          bValue = b.sizes.reduce((sum, s) => sum + s.flavors.reduce((fSum, f) => fSum + f.quantityInStock, 0), 0);
        } else if (sortConfig.key === 'sold') {
          aValue = a.sizes.reduce((sum, s) => sum + s.flavors.reduce((fSum, f) => fSum + f.quantitySold, 0), 0);
          bValue = b.sizes.reduce((sum, s) => sum + s.flavors.reduce((fSum, f) => fSum + f.quantitySold, 0), 0);
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [products, searchTerm, selectedBrand, sortConfig]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getTotalStock = (product) => {
    return product.sizes.reduce((sum, s) => 
      sum + s.flavors.reduce((fSum, f) => fSum + f.quantityInStock, 0), 0
    );
  };

  const getTotalSold = (product) => {
    return product.sizes.reduce((sum, s) => 
      sum + s.flavors.reduce((fSum, f) => fSum + f.quantitySold, 0), 0
    );
  };

  const getMinPrice = (product) => {
    return Math.min(...product.sizes.map(s => s.discountPrice));
  };

  return (
    <div className="product-management">
      <div className="product-management__container">
        {/* Header */}
        <div className="product-management__header">
          <h1 className="product-management__title">
            <Package className="product-management__icon" size={32} />
            Quản lý sản phẩm
          </h1>
          <p className="product-management__subtitle">
            Quản lý {filteredProducts.length} sản phẩm
          </p>
        </div>

        {/* Filters */}
        <div className="product-management__filters">
          <div className="search-box">
            <Search className="search-box__icon" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-box__input"
            />
          </div>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="brand-filter"
          >
            <option value="all">Tất cả thương hiệu</option>
            {brands.filter(b => b !== "all").map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="product-table">
            <thead>
              <tr>
                <th className="product-table__th product-table__th--toggle"></th>
                <th className="product-table__th">Sản phẩm</th>
                <th className="product-table__th">Thương hiệu</th>
                <th 
                  onClick={() => handleSort('price')}
                  className="product-table__th product-table__th--sortable"
                >
                  Giá thấp nhất {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('stock')}
                  className="product-table__th product-table__th--sortable product-table__th--center"
                >
                  Tồn kho {sortConfig.key === 'stock' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('sold')}
                  className="product-table__th product-table__th--sortable product-table__th--center"
                >
                  Đã bán {sortConfig.key === 'sold' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="product-table__th product-table__th--center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <React.Fragment key={product.id}>
                  <tr className={`product-table__row ${expandedRows[product.id] ? 'product-table__row--expanded' : ''}`}>
                    <td className="product-table__td product-table__td--center">
                      <button
                        onClick={() => toggleRow(product.id)}
                        className="toggle-btn"
                      >
                        {expandedRows[product.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </button>
                    </td>
                    <td className="product-table__td">
                      <div className="product-info">
                        <img
                          src={product.sizes[0]?.imageUrl}
                          alt={product.name}
                          className="product-info__image"
                        />
                        <div className="product-info__details">
                          <div className="product-info__name">{product.name}</div>
                          <div className="product-info__description">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="product-table__td">{product.brand}</td>
                    <td className="product-table__td product-table__td--price">
                      {getMinPrice(product).toLocaleString()} ₫
                    </td>
                    <td className="product-table__td product-table__td--center">
                      <span className={`stock-badge ${getTotalStock(product) > 20 ? 'stock-badge--high' : 'stock-badge--low'}`}>
                        {getTotalStock(product)}
                      </span>
                    </td>
                    <td className="product-table__td product-table__td--center">
                      <div className="sold-info">
                        <TrendingUp size={16} className="sold-info__icon" />
                        <span className="sold-info__value">{getTotalSold(product)}</span>
                      </div>
                    </td>
                    <td className="product-table__td product-table__td--center">
                      <div className="action-buttons">
                        <button className="action-btn action-btn--view">
                          <Eye size={18} />
                        </button>
                        <button className="action-btn action-btn--edit">
                          <Edit size={18} />
                        </button>
                        <button className="action-btn action-btn--delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {expandedRows[product.id] && (
                    <tr className="expanded-row">
                      <td colSpan="7" className="expanded-row__content">
                        <div className="size-list">
                          {product.sizes.map((size, idx) => (
                            <div key={idx} className="size-card">
                              <div className="size-card__content">
                                <img
                                  src={size.imageUrl}
                                  alt={size.size}
                                  className="size-card__image"
                                />
                                <div className="size-card__info">
                                  <h4 className="size-card__title">
                                    Size: {size.size} ({size.weight})
                                  </h4>
                                  <div className="size-card__prices">
                                    <div className="price-item">
                                      <div className="price-item__label">Giá gốc</div>
                                      <div className="price-item__value price-item__value--original">
                                        {size.price.toLocaleString()} ₫
                                      </div>
                                    </div>
                                    <div className="price-item">
                                      <div className="price-item__label">Giá giảm</div>
                                      <div className="price-item__value price-item__value--discount">
                                        {size.discountPrice.toLocaleString()} ₫
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flavors-section">
                                    <h5 className="flavors-section__title">Hương vị:</h5>
                                    <div className="flavor-list">
                                      {size.flavors.map((flavor, fIdx) => (
                                        <div key={fIdx} className={`flavor-card ${flavor.active ? 'flavor-card--active' : 'flavor-card--inactive'}`}>
                                          <div className="flavor-card__name">{flavor.flavor}</div>
                                          <div className="flavor-card__stats">
                                            Kho: {flavor.quantityInStock} | Bán: {flavor.quantitySold}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                
                                {size.imageUrls.length > 0 && (
                                  <div className="sub-images">
                                    <h5 className="sub-images__title">Ảnh phụ:</h5>
                                    <div className="sub-images__gallery">
                                      {size.imageUrls.map((url, urlIdx) => (
                                        <img
                                          key={urlIdx}
                                          src={url}
                                          alt={`Sub ${urlIdx}`}
                                          className="sub-images__item"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <div className="pagination__info">
              Hiển thị {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)} trong {filteredProducts.length} sản phẩm
            </div>
            <div className="pagination__controls">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`pagination__btn ${currentPage === 1 ? 'pagination__btn--disabled' : ''}`}
              >
                Trước
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`pagination__btn pagination__btn--page ${currentPage === i + 1 ? 'pagination__btn--active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`pagination__btn ${currentPage === totalPages ? 'pagination__btn--disabled' : ''}`}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}