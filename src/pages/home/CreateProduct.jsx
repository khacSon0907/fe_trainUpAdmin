import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Package,
  Tag,
  DollarSign,
  Weight,
  Palette,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
} from "lucide-react";
import categoryService from "../../services/categoryService";
import productService from "../../services/productService";
import mediaService from "../../services/mediaService";
import "../../styles/pages/home/CreateProduct.scss";

export default function CreateProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ===== EDIT MODE DETECTION =====
  const isEditMode = Boolean(location.state?.product?.id);
  const editProductId = location.state?.product?.id || null;

  const [product, setProduct] = useState({
    name: "",
    description: "",
    brand: "",
    categoryId: "",
    sizes: [],
  });
  const [categories, setCategories] = useState([]);
  const [previewMain, setPreviewMain] = useState({});
  const [previewGallery, setPreviewGallery] = useState({});
  const [expandedSizes, setExpandedSizes] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Validation errors - inline cho từng field
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    description: "",
    brand: "",
    categoryId: "",
    sizes: {} // { 0: { size: "", weight: "", price: "", discountPrice: "", imageUrl: "", flavors: "" } }
  });
  
  // Modal message - hiển thị giữa màn hình
  const [modalMessage, setModalMessage] = useState({
    show: false,
    type: "", // "success" | "error" | "warning"
    title: "",
    message: ""
  });

  // Debug: Log khi modalMessage thay đổi
  useEffect(() => {
    console.log("🔔 Modal state changed:", modalMessage);
    if (modalMessage.show) {
      console.log("✅ Modal SHOULD BE VISIBLE NOW!");
      console.log("   - Type:", modalMessage.type);
      console.log("   - Title:", modalMessage.title);
      console.log("   - Message:", modalMessage.message);
    }
  }, [modalMessage]);

  // Track actual file objects for upload
  const [mainImageFiles, setMainImageFiles] = useState({});
  const [galleryImageFiles, setGalleryImageFiles] = useState({});

  useEffect(() => {
    if (location.state?.product) {
      const prod = location.state.product;

      // Cập nhật preview ảnh chính và phụ từ product
      const main = {};
      const gallery = {};
      prod.sizes.forEach((size, i) => {
        main[i] = size.imageUrl;
        gallery[i] = size.imageUrls || [];
      });

      setPreviewMain(main);
      setPreviewGallery(gallery);

      setProduct(prod);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAll();
        setCategories(res.data.data || []);
      } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
      }
    };
    fetchCategories();
  }, []);

  // ===== Size =====
  const handleAddSize = () => {
    const newIndex = product.sizes.length;
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
    setExpandedSizes((prev) => ({ ...prev, [newIndex]: true }));
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

  const toggleSizeExpand = (i) => {
    setExpandedSizes((prev) => ({ ...prev, [i]: !prev[i] }));
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
      const currentGallery = previewGallery[index] || [];
      const remainingSlots = 4 - currentGallery.length;

      if (remainingSlots <= 0) {
        setModalMessage({
          show: true,
          type: "warning",
          title: "Giới hạn ảnh",
          message: "Đã đạt tối đa 4 ảnh phụ cho biến thể này!"
        });
        return;
      }

      const selectedFiles = Array.from(files).slice(0, remainingSlots);

      // Store file objects
      const currentGalleryFiles = galleryImageFiles[index] || [];
      const updatedGalleryFiles = [...currentGalleryFiles, ...selectedFiles];
      setGalleryImageFiles((prev) => ({
        ...prev,
        [index]: updatedGalleryFiles,
      }));

      // Create previews
      const readers = selectedFiles.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          })
      );

      Promise.all(readers).then((results) => {
        const updatedGallery = [...currentGallery, ...results];
        setPreviewGallery((prev) => ({
          ...prev,
          [index]: updatedGallery,
        }));
      });
    } else if (type === "main") {
      const file = files[0];

      // Store file object
      setMainImageFiles((prev) => ({
        ...prev,
        [index]: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewMain((prev) => ({ ...prev, [index]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMainImage = (index) => {
    setPreviewMain((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    setMainImageFiles((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const removeGalleryImage = (sizeIndex, imageIndex) => {
    const updatedGallery = [...(previewGallery[sizeIndex] || [])];
    updatedGallery.splice(imageIndex, 1);
    setPreviewGallery((prev) => ({
      ...prev,
      [sizeIndex]: updatedGallery,
    }));

    const updatedFiles = [...(galleryImageFiles[sizeIndex] || [])];
    updatedFiles.splice(imageIndex, 1);
    setGalleryImageFiles((prev) => ({
      ...prev,
      [sizeIndex]: updatedFiles,
    }));
  };

  // ===== Upload Image to S3 =====
  const uploadImageToS3 = async (file, mediaType = "PRODUCT") => {
    try {
      // Step 1: Get presigned URL from backend
      const uploadUrlResponse = await mediaService.generateUploadUrl(
        file.name,
        file.type,
        mediaType
      );

      console.log("📤 Upload URL Response:", uploadUrlResponse);

      const { preSignedUploadUrl, s3Key } = uploadUrlResponse;

      if (!preSignedUploadUrl || !s3Key) {
        throw new Error("Invalid upload response from server");
      }

      // Step 2: Upload file to S3 using presigned URL
      await mediaService.uploadFileToS3(preSignedUploadUrl, file, file.type);

      console.log("✅ File uploaded successfully:", s3Key);

      // Step 3: Return the permanent file URL
      return s3Key;
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      throw error;
    }
  };

  // ===== VALIDATION FUNCTIONS =====
  const validateForm = () => {
    const newFieldErrors = {
      name: "",
      description: "",
      brand: "",
      categoryId: "",
      sizes: {}
    };
    
    let hasError = false;

    // Validate tên sản phẩm (theo backend: 3-255 ký tự)
    if (!product.name?.trim()) {
      newFieldErrors.name = "Tên sản phẩm không được để trống";
      hasError = true;
    } else if (product.name.trim().length < 3) {
      newFieldErrors.name = "Tên sản phẩm phải từ 3-255 ký tự";
      hasError = true;
    } else if (product.name.trim().length > 255) {
      newFieldErrors.name = "Tên sản phẩm phải từ 3-255 ký tự";
      hasError = true;
    }

    // Validate mô tả (theo backend: 10-5000 ký tự)
    if (!product.description?.trim()) {
      newFieldErrors.description = "Mô tả sản phẩm không được để trống";
      hasError = true;
    } else if (product.description.trim().length < 10) {
      newFieldErrors.description = "Mô tả phải từ 10-5000 ký tự";
      hasError = true;
    } else if (product.description.trim().length > 5000) {
      newFieldErrors.description = "Mô tả phải từ 10-5000 ký tự";
      hasError = true;
    }

    // Validate thương hiệu (theo backend: 2-100 ký tự)
    if (!product.brand?.trim()) {
      newFieldErrors.brand = "Thương hiệu không được để trống";
      hasError = true;
    } else if (product.brand.trim().length < 2) {
      newFieldErrors.brand = "Thương hiệu phải từ 2-100 ký tự";
      hasError = true;
    } else if (product.brand.trim().length > 100) {
      newFieldErrors.brand = "Thương hiệu phải từ 2-100 ký tự";
      hasError = true;
    }

    // Validate danh mục
    if (!product.categoryId) {
      newFieldErrors.categoryId = "Vui lòng chọn danh mục";
      hasError = true;
    }

    // Validate số lượng biến thể (theo backend: ít nhất 1, tối đa 20)
    if (product.sizes.length === 0) {
      setModalMessage({
        show: true,
        type: "warning",
        title: "Thiếu biến thể sản phẩm",
        message: "Sản phẩm phải có ít nhất 1 biến thể!"
      });
      hasError = true;
    } else if (product.sizes.length > 20) {
      setModalMessage({
        show: true,
        type: "warning",
        title: "Quá nhiều biến thể",
        message: "Tối đa 20 biến thể cho mỗi sản phẩm!"
      });
      hasError = true;
    }

    // Validate từng biến thể
    product.sizes.forEach((size, index) => {
      const sizeErrors = {
        size: "",
        weight: "",
        price: "",
        discountPrice: "",
        imageUrl: "",
        flavors: ""
      };

      // Kiểm tra kích thước (định dạng: số + serving/servings)
      if (!size.size?.trim()) {
        sizeErrors.size = "Vui lòng nhập kích thước";
        hasError = true;
      } else {
        // Validate format: số + serving hoặc servings (vd: 1 serving, 2 servings)
        const sizePattern = /^\d+(\.\d+)?\s*(serving|servings)$/i;
        if (!sizePattern.test(size.size.trim())) {
          sizeErrors.size = "Size phải theo định dạng hợp lệ (vd: 1 serving, 2 servings)";
          hasError = true;
        }
      }

      // Kiểm tra trọng lượng (bắt buộc, định dạng: số + kg)
      if (!size.weight?.trim()) {
        sizeErrors.weight = "Vui lòng nhập trọng lượng";
        hasError = true;
      } else {
        const weightPattern = /^\d+(\.\d+)?\s*kg$/i;
        if (!weightPattern.test(size.weight.trim())) {
          sizeErrors.weight = "Trọng lượng phải theo định dạng hợp lệ (vd: 4.5kg)";
          hasError = true;
        }
      }

      // Kiểm tra giá gốc (phải > 0)
      if (!size.price) {
        sizeErrors.price = "Vui lòng nhập giá gốc";
        hasError = true;
      } else if (parseFloat(size.price) <= 0) {
        sizeErrors.price = "Giá gốc phải lớn hơn 0";
        hasError = true;
      }

      // Kiểm tra giá khuyến mãi (nếu có, phải > 0 và < giá gốc)
      if (size.discountPrice) {
        if (parseFloat(size.discountPrice) <= 0) {
          sizeErrors.discountPrice = "Giá giảm phải lớn hơn 0";
          hasError = true;
        } else if (parseFloat(size.discountPrice) >= parseFloat(size.price)) {
          sizeErrors.discountPrice = "Giá khuyến mãi phải nhỏ hơn giá gốc";
          hasError = true;
        }
      }

      // Kiểm tra ảnh chính
      if (!previewMain[index] && !mainImageFiles[index]) {
        sizeErrors.imageUrl = "Vui lòng chọn ảnh chính";
        hasError = true;
      }

      // Kiểm tra hương vị
      if (!size.flavors || size.flavors.length === 0) {
        sizeErrors.flavors = "Vui lòng thêm ít nhất 1 hương vị";
        hasError = true;
      } else {
        const emptyFlavors = size.flavors.filter(f => !f.flavor?.trim());
        if (emptyFlavors.length > 0) {
          sizeErrors.flavors = "Vui lòng nhập tên cho tất cả hương vị";
          hasError = true;
        }
      }

      newFieldErrors.sizes[index] = sizeErrors;
    });

    // Kiểm tra biến thể trùng lặp
    const variantKeys = product.sizes.map(size => size.size?.trim().toLowerCase()).filter(Boolean);
    const duplicates = variantKeys.filter((key, index) => variantKeys.indexOf(key) !== index);
    
    if (duplicates.length > 0) {
      product.sizes.forEach((size, index) => {
        if (duplicates.includes(size.size?.trim().toLowerCase())) {
          if (!newFieldErrors.sizes[index]) newFieldErrors.sizes[index] = {};
          newFieldErrors.sizes[index].size = "Kích thước này đã tồn tại";
          hasError = true;
        }
      });
    }

    setFieldErrors(newFieldErrors);
    return !hasError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;

    // Validate form
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setFieldErrors({ name: "", categoryId: "", sizes: {} }); // Reset errors
      setIsSubmitting(true);
      setUploadProgress(0);

      console.log(isEditMode ? "🔄 Starting product update..." : "🚀 Starting product creation...");

      // Upload all images and build product data with S3 URLs
      const updatedSizes = [];
      const totalImages =
        Object.keys(mainImageFiles).length +
        Object.values(galleryImageFiles).reduce(
          (acc, files) => acc + files.length,
          0
        );
      let uploadedCount = 0;

      for (let i = 0; i < product.sizes.length; i++) {
        const size = { ...product.sizes[i] };

        // ===== UPLOAD MAIN IMAGE =====
        if (mainImageFiles[i]) {
          // Có file mới → Upload lên S3
          console.log(`📸 Uploading new main image for size ${i + 1}...`);
          size.imageUrl = await uploadImageToS3(mainImageFiles[i], "PRODUCT");
          uploadedCount++;
          setUploadProgress(Math.round((uploadedCount / totalImages) * 100));
        } else if (previewMain[i]) {
          // Không có file mới nhưng có preview (đang edit) → Giữ nguyên URL cũ
          size.imageUrl = previewMain[i];
        } else {
          // Không có gì → Để trống
          size.imageUrl = "";
        }

        // ===== UPLOAD GALLERY IMAGES =====
        if (galleryImageFiles[i] && galleryImageFiles[i].length > 0) {
          // Có files mới → Upload lên S3
          console.log(
            `📸 Uploading ${galleryImageFiles[i].length} new gallery images for size ${i + 1}...`
          );
          const uploadedGalleryUrls = [];

          for (const file of galleryImageFiles[i]) {
            const url = await uploadImageToS3(file, "PRODUCT");
            uploadedGalleryUrls.push(url);
            uploadedCount++;
            setUploadProgress(Math.round((uploadedCount / totalImages) * 100));
          }

          // Merge với ảnh cũ (nếu có)
          const existingUrls = previewGallery[i]?.filter(url => 
            typeof url === 'string' && url.startsWith('http')
          ) || [];
          
          size.imageUrls = [...existingUrls, ...uploadedGalleryUrls];
        } else if (previewGallery[i]) {
          // Không có file mới nhưng có preview → Giữ nguyên URLs cũ
          size.imageUrls = previewGallery[i];
        } else {
          // Không có gì → Để trống
          size.imageUrls = [];
        }

        // Convert string numbers to actual numbers
        size.price = size.price ? parseFloat(size.price) : 0;
        size.discountPrice = size.discountPrice
          ? parseFloat(size.discountPrice)
          : 0;

        // Process flavors
        size.flavors = size.flavors.map((flavor) => ({
          id: flavor.id || undefined, // Giữ ID nếu đang edit
          flavor: flavor.flavor,
          quantityInStock: flavor.quantityInStock
            ? parseInt(flavor.quantityInStock)
            : 0,
          active: flavor.active !== undefined ? flavor.active : true,
        }));

        updatedSizes.push(size);
      }

      // Build final product data
      const productData = {
        name: product.name,
        description: product.description,
        brand: product.brand,
        categoryId: product.categoryId,
        active: product.active !== undefined ? product.active : true,
        sizes: updatedSizes,
      };

      console.log("📤 Sending product data to API:", productData);

      // ===== CREATE OR UPDATE =====
      let response;
      if (isEditMode) {
        // UPDATE MODE
        console.log(`🔄 Updating product with ID: ${editProductId}`);
        response = await productService.updateProduct(editProductId, productData);
        console.log("🔍 FULL UPDATE RESPONSE:", response);
        console.log("🔍 response.data:", response.data);
        console.log("🔍 response.status:", response.status);
        
        // Success - Kiểm tra cả status code HTTP và response.data.code
        if (response.status === 200 || response.data?.code === 200) {
          console.log("✅ Product updated successfully:", response.data);
          const successModal = {
            show: true,
            type: "success",
            title: "Thành công!",
            message: "Cập nhật sản phẩm thành công!"
          };
          console.log("🔔 Setting modal state:", successModal);
          setModalMessage(successModal);
        }
      } else {
        // CREATE MODE
        response = await productService.createProduct(productData);
        console.log("🔍 FULL CREATE RESPONSE:", response);
        console.log("🔍 response.data:", response.data);
        console.log("🔍 response.status:", response.status);
        
        // Success - Kiểm tra cả status code HTTP và response.data.code
        if (response.status === 201 || response.data?.code === 201 || response.status === 200) {
          console.log("✅ Product created successfully:", response.data);
          const successModal = {
            show: true,
            type: "success",
            title: "Thành công!",
            message: "Tạo sản phẩm thành công!"
          };
          console.log("🔔 Setting modal state:", successModal);
          setModalMessage(successModal);
        }
      }
    } catch (error) {
      console.error(isEditMode ? "❌ Error updating product:" : "❌ Error creating product:", error);

      if (error.response) {
        const errorData = error.response.data;
        const statusCode = error.response.status;
        
        console.log("📋 Error Response:", errorData);
        
        // ===== XỬ LÝ LỖI VALIDATION (400) =====
        if (statusCode === 400 && errorData?.detail) {
          // Parse detail object: { "sizes[0].size": ["Size phải theo định dạng..."], ... }
          const detail = errorData.detail;
          const newFieldErrors = {
            name: "",
            description: "",
            brand: "",
            categoryId: "",
            sizes: {}
          };

          let hasInlineError = false;

          // Duyệt qua từng field lỗi
          Object.keys(detail).forEach(fieldPath => {
            const errorMessages = detail[fieldPath];
            const errorText = Array.isArray(errorMessages) ? errorMessages[0] : errorMessages;

            // Parse field path: "sizes[0].size" -> sizes, index 0, field size
            if (fieldPath.startsWith('sizes[')) {
              const match = fieldPath.match(/sizes\[(\d+)\]\.(.+)/);
              if (match) {
                const index = parseInt(match[1]);
                const field = match[2];
                
                if (!newFieldErrors.sizes[index]) {
                  newFieldErrors.sizes[index] = {};
                }
                newFieldErrors.sizes[index][field] = errorText;
                hasInlineError = true;
              }
            } else {
              // Lỗi field cấp cao: name, description, brand, categoryId
              newFieldErrors[fieldPath] = errorText;
              hasInlineError = true;
            }
          });

          if (hasInlineError) {
            setFieldErrors(newFieldErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Hiển thị modal tổng quan
            const errorModal = {
              show: true,
              type: "error",
              title: "Dữ liệu không hợp lệ",
              message: errorData?.message || "Vui lòng kiểm tra lại các trường đã đánh dấu đỏ"
            };
            console.log("🔔 Setting error modal:", errorModal);
            setModalMessage(errorModal);
            return;
          }
        }

        // ===== XỬ LÝ LỖI TRÙNG (409) =====
        if (statusCode === 409) {
          if (errorData?.message?.includes("tên") || errorData?.message?.includes("name")) {
            // Set inline error
            setFieldErrors(prev => ({
              ...prev,
              name: "Tên sản phẩm đã tồn tại trong hệ thống"
            }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Hiển thị modal giữa màn hình
            const duplicateModal = {
              show: true,
              type: "error",
              title: "Tên sản phẩm đã tồn tại!",
              message: "Tên sản phẩm này đã có trong hệ thống. Vui lòng chọn tên khác."
            };
            console.log("🔔 Setting duplicate product modal:", duplicateModal);
            setModalMessage(duplicateModal);
            return;
          }
          
          // Lỗi xung đột khác
          const conflictModal = {
            show: true,
            type: "error",
            title: "Xung đột dữ liệu",
            message: errorData?.message || "Sản phẩm đã tồn tại hoặc có xung đột dữ liệu"
          };
          console.log("🔔 Setting conflict modal:", conflictModal);
          setModalMessage(conflictModal);
          return;
        }

        // ===== XỬ LÝ CÁC LỖI KHÁC =====
        let errorMessage = "Có lỗi xảy ra";
        
        if (statusCode === 404) {
          errorMessage = "Không tìm thấy tài nguyên";
        } else if (statusCode === 500) {
          errorMessage = "Lỗi server: " + (errorData?.message || "Vui lòng thử lại sau");
        } else {
          errorMessage = errorData?.message || ("Có lỗi xảy ra khi " + (isEditMode ? "cập nhật" : "tạo") + " sản phẩm");
        }

        const generalErrorModal = {
          show: true,
          type: "error",
          title: "Lỗi!",
          message: errorMessage
        };
        console.log("🔔 Setting general error modal:", generalErrorModal);
        setModalMessage(generalErrorModal);
      } else if (error.request) {
        const networkErrorModal = {
          show: true,
          type: "error",
          title: "Lỗi kết nối",
          message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        };
        console.log("🔔 Setting network error modal:", networkErrorModal);
        setModalMessage(networkErrorModal);
      } else {
        const unknownErrorModal = {
          show: true,
          type: "error",
          title: "Lỗi!",
          message: error.message
        };
        console.log("🔔 Setting unknown error modal:", unknownErrorModal);
        setModalMessage(unknownErrorModal);
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="create-product-container">
      {/* Modal Message - Render ở cấp cao nhất để position:fixed hoạt động */}
      {modalMessage.show && (
        <div className="modal-overlay" onClick={(e) => {
          // Không cho đóng modal khi click overlay nếu đang thành công
          if (modalMessage.type !== "success") {
            setModalMessage({ ...modalMessage, show: false });
          }
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-icon ${modalMessage.type}`}>
              {modalMessage.type === "success" && <Check size={48} />}
              {modalMessage.type === "error" && <X size={48} />}
              {modalMessage.type === "warning" && <AlertCircle size={48} />}
            </div>
            <h2>{modalMessage.title}</h2>
            <p>{modalMessage.message}</p>
            <button 
              className="btn-close-modal"
              onClick={() => {
                if (modalMessage.type === "success") {
                  // Thành công → Redirect về /products
                  navigate("/products");
                } else {
                  // Thất bại/Warning → Đóng modal, ở lại trang
                  setModalMessage({ ...modalMessage, show: false });
                }
              }}
            >
              {modalMessage.type === "success" ? "OK" : "Đóng"}
            </button>
          </div>
        </div>
      )}

      {/* Header với gradient */}
      <div className="page-header-section">
        <div className="container">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Quay lại
          </button>
          <div className="header-content">
            <div className="header-icon">
              <Package size={32} />
            </div>
            <div className="header-text">
              <h1>{isEditMode ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}</h1>
              <p>
                {isEditMode 
                  ? "Cập nhật thông tin sản phẩm của bạn"
                  : "Điền đầy đủ thông tin để tạo sản phẩm hoàn chỉnh"
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <form onSubmit={handleSubmit} className="product-form">

          {/* Progress Steps */}
          <div className="progress-steps">
            <div className={`step ${product.name ? "completed" : "active"}`}>
              <div className="step-icon">
                {product.name ? <Check size={16} /> : "1"}
              </div>
              <span>Thông tin cơ bản</span>
            </div>
            <div className="step-line"></div>
            <div
              className={`step ${
                product.sizes.length > 0 ? "completed" : "inactive"
              }`}
            >
              <div className="step-icon">
                {product.sizes.length > 0 ? <Check size={16} /> : "2"}
              </div>
              <span>Biến thể</span>
            </div>
            <div className="step-line"></div>
            <div className="step inactive">
              <div className="step-icon">3</div>
              <span>Hoàn tất</span>
            </div>
          </div>

          {/* Basic Info Card */}
          <div className="form-card animate-slide-up">
            <div className="card-header">
              <div className="header-left">
                <div className="icon-wrapper">
                  <Package size={20} />
                </div>
                <div>
                  <h2>Thông tin cơ bản</h2>
                  <p className="card-subtitle">
                    Thông tin chung về sản phẩm của bạn
                  </p>
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Tên sản phẩm <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Nhập tên sản phẩm..."
                      value={product.name}
                      onChange={(e) => {
                        setProduct({ ...product, name: e.target.value });
                        if (fieldErrors.name) {
                          setFieldErrors({ ...fieldErrors, name: "" });
                        }
                      }}
                      className={`input-field ${fieldErrors.name ? 'error' : ''}`}
                    />
                    {fieldErrors.name && (
                      <span className="error-message">
                        <AlertCircle size={14} /> {fieldErrors.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Thương hiệu <span className="required">*</span></label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Nhập thương hiệu (2-100 ký tự)..."
                      value={product.brand}
                      onChange={(e) => {
                        setProduct({ ...product, brand: e.target.value });
                        if (fieldErrors.brand) {
                          setFieldErrors({ ...fieldErrors, brand: "" });
                        }
                      }}
                      className={`input-field ${fieldErrors.brand ? 'error' : ''}`}
                    />
                    {fieldErrors.brand && (
                      <span className="error-message">
                        <AlertCircle size={14} /> {fieldErrors.brand}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả sản phẩm <span className="required">*</span></label>
                <div className="textarea-wrapper">
                  <textarea
                    rows="4"
                    placeholder="Mô tả chi tiết về sản phẩm, tính năng nổi bật (10-5000 ký tự)..."
                    value={product.description}
                    onChange={(e) => {
                      setProduct({ ...product, description: e.target.value });
                      if (fieldErrors.description) {
                        setFieldErrors({ ...fieldErrors, description: "" });
                      }
                    }}
                    className={`textarea-field ${fieldErrors.description ? 'error' : ''}`}
                  ></textarea>
                  <div className="char-count">
                    {product.description.length} ký tự
                  </div>
                  {fieldErrors.description && (
                    <span className="error-message">
                      <AlertCircle size={14} /> {fieldErrors.description}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>
                  Danh mục <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    value={product.categoryId}
                    onChange={(e) => {
                      setProduct({ ...product, categoryId: e.target.value });
                      if (fieldErrors.categoryId) {
                        setFieldErrors({ ...fieldErrors, categoryId: "" });
                      }
                    }}
                    className={`select-field ${fieldErrors.categoryId ? 'error' : ''}`}
                  >
                    <option value="">Chọn danh mục sản phẩm</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.categoryId && (
                    <span className="error-message">
                      <AlertCircle size={14} /> {fieldErrors.categoryId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sizes Section */}
          <div className="form-card animate-slide-up">
            <div className="card-header">
              <div className="header-left">
                <div className="icon-wrapper">
                  <Tag size={20} />
                </div>
                <div>
                  <h2>Biến thể sản phẩm</h2>
                  <p className="card-subtitle">
                    Thêm các phiên bản khác nhau của sản phẩm
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-add-variant"
                onClick={handleAddSize}
              >
                <Plus size={18} />
                Thêm biến thể
              </button>
            </div>

            <div className="card-body">
              {product.sizes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Package size={64} />
                  </div>
                  <h3>Chưa có biến thể nào</h3>
                  <p>
                    Thêm các biến thể như kích thước, màu sắc để khách hàng có
                    nhiều lựa chọn hơn
                  </p>
                  <button
                    type="button"
                    className="btn-add-first"
                    onClick={handleAddSize}
                  >
                    <Plus size={20} />
                    Thêm biến thể đầu tiên
                  </button>
                </div>
              ) : (
                <div className="variants-list">
                  {product.sizes.map((size, i) => (
                    <div
                      key={i}
                      className={`variant-card ${
                        expandedSizes[i] ? "expanded" : ""
                      }`}
                    >
                      <div
                        className="variant-header"
                        onClick={() => toggleSizeExpand(i)}
                      >
                        <div className="variant-header-left">
                          <div className="variant-number">#{i + 1}</div>
                          <div className="variant-summary">
                            <h4>{size.size || `Biến thể ${i + 1}`}</h4>
                            <div className="variant-meta">
                              {size.price && (
                                <span className="price-tag">
                                  {parseInt(size.price).toLocaleString()}đ
                                </span>
                              )}
                              {size.flavors.length > 0 && (
                                <span className="flavor-count">
                                  {size.flavors.length} hương vị
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="variant-actions">
                          <button
                            type="button"
                            className="btn-icon btn-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  "Bạn có chắc muốn xóa biến thể này?"
                                )
                              ) {
                                handleRemoveSize(i);
                              }
                            }}
                            title="Xóa biến thể"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button type="button" className="btn-icon btn-toggle">
                            {expandedSizes[i] ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )}
                          </button>
                        </div>
                      </div>

                      {expandedSizes[i] && (
                        <div className="variant-body">
                          {/* Size Details */}
                          <div className="section-block">
                            <h5 className="section-title">
                              <Tag size={16} />
                              Chi tiết biến thể
                            </h5>
                            <div className="form-grid">
                              <div className="form-group">
                                <label>Kích thước <span className="required">*</span></label>
                                <input
                                  type="text"
                                  placeholder="VD: 1 serving, 2 servings..."
                                  value={size.size}
                                  onChange={(e) => {
                                    handleSizeChange(i, "size", e.target.value);
                                    if (fieldErrors.sizes[i]?.size) {
                                      const newSizeErrors = { ...fieldErrors.sizes };
                                      newSizeErrors[i].size = "";
                                      setFieldErrors({ ...fieldErrors, sizes: newSizeErrors });
                                    }
                                  }}
                                  className={`input-field ${fieldErrors.sizes[i]?.size ? 'error' : ''}`}
                                />
                                {fieldErrors.sizes[i]?.size && (
                                  <span className="error-message">
                                    <AlertCircle size={14} /> {fieldErrors.sizes[i].size}
                                  </span>
                                )}
                              </div>

                              <div className="form-group">
                                <label>Trọng lượng <span className="required">*</span></label>
                                <input
                                  type="text"
                                  placeholder="VD: 4.5kg, 10kg..."
                                  value={size.weight}
                                  onChange={(e) => {
                                    handleSizeChange(i, "weight", e.target.value);
                                    if (fieldErrors.sizes[i]?.weight) {
                                      const newSizeErrors = { ...fieldErrors.sizes };
                                      newSizeErrors[i].weight = "";
                                      setFieldErrors({ ...fieldErrors, sizes: newSizeErrors });
                                    }
                                  }}
                                  className={`input-field ${fieldErrors.sizes[i]?.weight ? 'error' : ''}`}
                                />
                                {fieldErrors.sizes[i]?.weight && (
                                  <span className="error-message">
                                    <AlertCircle size={14} /> {fieldErrors.sizes[i].weight}
                                  </span>
                                )}
                              </div>

                              <div className="form-group">
                                <label>Giá gốc <span className="required">*</span></label>
                                <div className="input-with-icon">
                                  <DollarSign size={16} className="input-icon" />
                                  <input
                                    type="number"
                                    placeholder="0"
                                    value={size.price}
                                    onChange={(e) => {
                                      handleSizeChange(i, "price", e.target.value);
                                      if (fieldErrors.sizes[i]?.price) {
                                        const newSizeErrors = { ...fieldErrors.sizes };
                                        newSizeErrors[i].price = "";
                                        setFieldErrors({ ...fieldErrors, sizes: newSizeErrors });
                                      }
                                    }}
                                    min="0"
                                    step="0.01"
                                    className={`input-field ${fieldErrors.sizes[i]?.price ? 'error' : ''}`}
                                  />
                                  <span className="input-suffix">đ</span>
                                </div>
                                {fieldErrors.sizes[i]?.price && (
                                  <span className="error-message">
                                    <AlertCircle size={14} /> {fieldErrors.sizes[i].price}
                                  </span>
                                )}
                              </div>

                              <div className="form-group">
                                <label>Giá khuyến mãi</label>
                                <div className="input-with-icon">
                                  <DollarSign size={16} className="input-icon" />
                                  <input
                                    type="number"
                                    placeholder="0"
                                    value={size.discountPrice}
                                    onChange={(e) => {
                                      handleSizeChange(i, "discountPrice", e.target.value);
                                      if (fieldErrors.sizes[i]?.discountPrice) {
                                        const newSizeErrors = { ...fieldErrors.sizes };
                                        newSizeErrors[i].discountPrice = "";
                                        setFieldErrors({ ...fieldErrors, sizes: newSizeErrors });
                                      }
                                    }}
                                    min="0"
                                    step="0.01"
                                    className={`input-field ${fieldErrors.sizes[i]?.discountPrice ? 'error' : ''}`}
                                  />
                                  <span className="input-suffix">đ</span>
                                </div>
                                {fieldErrors.sizes[i]?.discountPrice && (
                                  <span className="error-message">
                                    <AlertCircle size={14} /> {fieldErrors.sizes[i].discountPrice}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Images Section */}
                          <div className="section-block">
                            <h5 className="section-title">
                              <ImageIcon size={16} />
                              Hình ảnh sản phẩm
                            </h5>

                            <div className="images-grid">
                              {/* Main Image */}
                              <div className="main-image-section">
                                <label className="image-section-label">
                                  Ảnh chính <span className="required">*</span>
                                </label>
                                <input
                                  type="file"
                                  id={`main-image-${i}`}
                                  accept="image/*"
                                  onChange={(e) => {
                                    handleImagePreview(i, e.target.files, "main");
                                    if (fieldErrors.sizes[i]?.imageUrl) {
                                      const newSizeErrors = { ...fieldErrors.sizes };
                                      newSizeErrors[i].imageUrl = "";
                                      setFieldErrors({ ...fieldErrors, sizes: newSizeErrors });
                                    }
                                  }}
                                  style={{ display: "none" }}
                                />
                                {previewMain[i] ? (
                                  <div className="image-preview-main">
                                    <img src={previewMain[i]} alt="Main preview" />
                                    <div className="image-overlay">
                                      <button
                                        type="button"
                                        className="btn-remove-image"
                                        onClick={() => removeMainImage(i)}
                                      >
                                        <X size={18} />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <label
                                    htmlFor={`main-image-${i}`}
                                    className={`upload-box ${fieldErrors.sizes[i]?.imageUrl ? 'error' : ''}`}
                                  >
                                    <ImageIcon size={40} />
                                    <span className="upload-text">Tải ảnh chính</span>
                                    <small className="upload-hint">
                                      JPG, PNG tối đa 5MB
                                    </small>
                                  </label>
                                )}
                                {fieldErrors.sizes[i]?.imageUrl && !previewMain[i] && (
                                  <span className="error-message">
                                    <AlertCircle size={14} /> {fieldErrors.sizes[i].imageUrl}
                                  </span>
                                )}
                              </div>

                              {/* Gallery Images */}
                              <div className="gallery-section">
                                <label className="image-section-label">
                                  Ảnh phụ (tối đa 4 ảnh)
                                </label>
                                <input
                                  type="file"
                                  id={`gallery-images-${i}`}
                                  multiple
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleImagePreview(i, e.target.files, "gallery")
                                  }
                                  style={{ display: "none" }}
                                />
                                <div className="gallery-grid">
                                  {(previewGallery[i] || []).map((url, idx) => (
                                    <div key={idx} className="gallery-item">
                                      <img src={url} alt={`Gallery ${idx + 1}`} />
                                      <div className="image-overlay">
                                        <button
                                          type="button"
                                          className="btn-remove-image"
                                          onClick={() =>
                                            removeGalleryImage(i, idx)
                                          }
                                        >
                                          <X size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                  {(!previewGallery[i] ||
                                    previewGallery[i].length < 4) && (
                                    <label
                                      htmlFor={`gallery-images-${i}`}
                                      className="gallery-upload-box"
                                    >
                                      <Plus size={28} />
                                      <span>Thêm ảnh</span>
                                    </label>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Flavors Section */}
                          <div className="section-block">
                            <div className="section-header">
                              <h5 className="section-title">
                                <Palette size={16} />
                                Hương vị
                              </h5>
                              <button
                                type="button"
                                className="btn-add-small"
                                onClick={() => handleAddFlavor(i)}
                              >
                                <Plus size={16} />
                                Thêm hương vị
                              </button>
                            </div>

                            {size.flavors.length === 0 ? (
                              <div className="empty-flavors">
                                <Palette size={32} className="empty-icon-small" />
                                <p>Chưa có hương vị nào</p>
                                {fieldErrors.sizes[i]?.flavors && (
                                  <span className="error-message">
                                    <AlertCircle size={14} /> {fieldErrors.sizes[i].flavors}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <>
                                <div className="flavors-grid">
                                {size.flavors.map((flavor, j) => (
                                  <div key={j} className="flavor-card">
                                    <div className="flavor-card-header">
                                      <span className="flavor-index">
                                        Hương vị {j + 1}
                                      </span>
                                      <button
                                        type="button"
                                        className="btn-icon-small btn-delete"
                                        onClick={() => handleRemoveFlavor(i, j)}
                                        title="Xóa hương vị"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                    <div className="flavor-card-body">
                                      <div className="form-group">
                                        <label>Tên hương vị <span className="required">*</span></label>
                                        <input
                                          type="text"
                                          placeholder="VD: Vani, Chocolate..."
                                          value={flavor.flavor}
                                          onChange={(e) =>
                                            handleFlavorChange(
                                              i,
                                              j,
                                              "flavor",
                                              e.target.value
                                            )
                                          }
                                          className="input-field-small"
                                        />
                                      </div>
                                      <div className="form-row-small">
                                        <div className="form-group">
                                          <label>Tồn kho</label>
                                          <input
                                            type="number"
                                            placeholder="0"
                                            value={flavor.quantityInStock}
                                            onChange={(e) =>
                                              handleFlavorChange(
                                                i,
                                                j,
                                                "quantityInStock",
                                                e.target.value
                                              )
                                            }
                                            className="input-field-small"
                                          />
                                        </div>
                                        <div className="form-group">
                                          <label>Đã bán</label>
                                          <input
                                            type="number"
                                            placeholder="0"
                                            value={flavor.quantitySold}
                                            onChange={(e) =>
                                              handleFlavorChange(
                                                i,
                                                j,
                                                "quantitySold",
                                                e.target.value
                                              )
                                            }
                                            className="input-field-small"
                                          />
                                        </div>
                                      </div>
                                      <label className="checkbox-label">
                                        <input
                                          type="checkbox"
                                          checked={flavor.active}
                                          onChange={(e) =>
                                            handleFlavorChange(
                                              i,
                                              j,
                                              "active",
                                              e.target.checked
                                            )
                                          }
                                        />
                                        <span className="checkbox-text">
                                          Đang hoạt động
                                        </span>
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {fieldErrors.sizes[i]?.flavors && size.flavors.length > 0 && (
                                <span className="error-message">
                                  <AlertCircle size={14} /> {fieldErrors.sizes[i].flavors}
                                </span>
                              )}
                            </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Section */}
          <div className="form-actions-card">
            <div className="action-buttons">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  if (window.confirm("Bạn có chắc muốn hủy bỏ các thay đổi?")) {
                    navigate(-1);
                  }
                }}
                disabled={isSubmitting}
              >
                <X size={20} />
                <span>Hủy bỏ</span>
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    <span>
                      {uploadProgress > 0
                        ? `Đang tải ${uploadProgress}%...`
                        : "Đang xử lý..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    <span>{isEditMode ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}</span>
                  </>
                )}
              </button>
            </div>

            {isSubmitting && uploadProgress > 0 && (
              <div className="upload-progress-section">
                <div className="progress-info">
                  <span className="progress-label">Đang tải lên hình ảnh</span>
                  <span className="progress-percentage">{uploadProgress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}