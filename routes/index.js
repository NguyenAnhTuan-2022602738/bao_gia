const express = require("express");
const router = express.Router();
const Product = require("../product"); // Sửa đường dẫn

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

function parsePrice(value) {
  if (typeof value === "string") {
    const cleanValue = value.replace(/,/g, '');
    const num = parseFloat(cleanValue);
    return isNaN(num) ? 0 : num;
  }
  return parseFloat(value);
}

router.get("/price/:type", async (req, res) => {
  const priceType = req.params.type.toUpperCase();
  if (!["BBCL", "BBPT", "BLVIP", "BL"].includes(priceType)) {
    return res.status(400).send("Invalid price type");
  }

  const searchTerm = (req.query.search || '').toLowerCase();
  const selectedGroup = req.query.group || '';

  try {
    let allProducts = await Product.find().lean();
    allProducts = allProducts.map(normalizeKeys);

    const allGroups = [...new Set(allProducts.map(p => p['NHÓM HÀNG']).filter(g => g))];

    let products = allProducts.map(product => {
      const newProduct = { ...product };
      newProduct[priceType] = parsePrice(product[priceType]);
      return newProduct;
    });

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
      allGroups,
      searchTerm,
      selectedGroup,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;