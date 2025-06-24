const express = require("express");
const router = express.Router();
const Product = require("../models/product");

function getPriceTypeLabel(type) {
  switch (type) {
    case "BBCL":
      return "Bán buôn chiến lược";
    case "BBPT":
      return "Bán buôn phổ thông";
    case "BLVIP":
      return "Bán lẻ VIP";
    case "BL":
      return "Bán lẻ";
    default:
      return "";
  }
}

// Hàm chuẩn hóa key về đúng định dạng
function normalizeKeys(obj) {
  const keyMap = {
    "stt": "STT",
    "nhóm hàng": "NHÓM HÀNG",
    "nhom hang": "NHÓM HÀNG",
    "tên hàng": "TÊN HÀNG",
    "ten hang": "TÊN HÀNG",
    "dvt": "ĐVT",
    "bbcl": "BBCL",
    "bbpt": "BBPT",
    "blvip": "BLVIP",
    "bl": "BL"
  };
  const newObj = {};
  Object.keys(obj).forEach(key => {
    const normKey = key.trim().toLowerCase().replace(/\s+/g, ' ');
    const mappedKey = keyMap[normKey] || key.trim().replace(/\s+/g, '');
    newObj[mappedKey] = obj[key];
  });
  return newObj;
}

// Hàm chuyển đổi chuỗi giá (có dấu phẩy) thành số
function parsePrice(value) {
  if (typeof value === "string") {
    const cleanValue = value.replace(/,/g, ''); // Xóa tất cả dấu phẩy
    const num = parseFloat(cleanValue); // Chuyển đổi sang số
    return isNaN(num) ? 0 : num; // Trả về 0 nếu không thể chuyển đổi
  }
  return parseFloat(value); // Nếu đã là số, giữ nguyên
}

router.get("/price/:type", async (req, res) => {
  const priceType = req.params.type.toUpperCase();
  if (!["BBCL", "BBPT", "BLVIP", "BL"].includes(priceType)) {
    return res.status(400).send("Invalid price type");
  }

  // Lấy tham số query từ bộ lọc
  const searchTerm = (req.query.search || '').toLowerCase();
  const selectedGroup = req.query.group || '';

  try {
    let allProducts = await Product.find().lean(); // Lấy tất cả sản phẩm
    allProducts = allProducts.map(normalizeKeys);

    // Lấy tất cả các nhóm từ database
    const allGroups = [...new Set(allProducts.map(p => p['NHÓM HÀNG']).filter(g => g))];

    let products = allProducts.map(product => {
      const newProduct = { ...product };
      newProduct[priceType] = parsePrice(product[priceType]);
      return newProduct;
    });

    // Áp dụng bộ lọc
    if (searchTerm || selectedGroup) {
      products = products.filter(product => {
        const matchesSearch = !searchTerm || 
          (product['TÊN HÀNG'] || '').toLowerCase().includes(searchTerm) ||
          (product['NHÓM HÀNG'] || '').toLowerCase().includes(searchTerm);
        const matchesGroup = !selectedGroup || product['NHÓM HÀNG'] === selectedGroup;
        return matchesSearch && matchesGroup;
      });
    }

    const totalProducts = products.length;
    const groups = totalProducts > 0 ? [...new Set(products.map(p => p['NHÓM HÀNG']))] : [];
    const totalGroups = groups.length;
    const averagePrice = totalProducts > 0
      ? Math.round(products.reduce((sum, p) => sum + p[priceType], 0) / totalProducts)
      : 0;

    console.log("Fetched and normalized products:", products);
    console.log("All groups:", allGroups);
    console.log("Calculated groups:", groups);
    console.log("Calculated averagePrice:", averagePrice);

    res.render("heheh", {
      products,
      priceType,
      priceTypeLabel: getPriceTypeLabel(priceType),
      totalProducts,
      totalGroups,
      averagePrice,
      allGroups, // Truyền tất cả các nhóm
      searchTerm,
      selectedGroup,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;