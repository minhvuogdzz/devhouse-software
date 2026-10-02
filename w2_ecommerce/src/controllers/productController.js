const Product = require("../models/product.model")



const productController = {
  // Get /api/products
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.getAll();
      res.status(200).json(products)
    } catch (err) {
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  },

  // Get /api/products/:id

  getProductById: async (req, res) => {
    try {
      const id = req.params.id;
      const product = await Product.getById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" })
      }
      res.status(200).json(product)
    } catch (err) {
      res.status(500)
    }
  },

  // Post /api/products - Add product (seller)

  createProduct: async (req, res) => {
    try {
      const productData = req.body;
      productData.seller_id = req.user.id;
      const productId = await Product.create(productData);
      res.status(201).json({ message: "Product created Successfully!!!", productId });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  // Put /api/products/:id - Update product (seller)
  updateProduct: async (req, res) => {
    try {
      const id = req.params.id;
      const productData = req.body;
      const affectedRows = await Product.update(id, productData);
      if (affectedRows == 0) {

        return res.status(404).json({ message: "Product not found or update failed!!!" });
      }
      res.status(200).json({ message: "Product updated successfully!!!" });

    } catch (err) {

      res.status(500).json({ message: "Server error", error: err.message });
    }
  },


  // Get products by category ID
  getProductsByCategory: async (req, res) => {
    const categoryId = req.params.categoryId;
    try {
      const products = await Product.getByCategory(categoryId);
      if (products.length === 0) {
        return res.status(404).json({ message: "No products found for this category." });
      }
      res.status(200).json(products);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  // Get /api/products/categories - Use for chatbot
  getAllCategories: async (req, res) => {
    try {
      const categories = await Product.getCategories();
      const formattedCategories = categories.reduce((obj, category) => {
        obj[category.id] = category.name;
        return obj;
      }, {});

      res.status(200).json(formattedCategories);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
  // Xóa sản phẩm theo userId và productId
  deleteProduct: async (req, res) => {
    const { userId, productId } = req.params;
    try {
      const affectedRows = await Product.deleteByUserAndProductId(userId, productId);
      if (affectedRows) {
        res.status(200).json({ message: "Product deleted successfully." });
      } else {
        res.status(404).json({ message: "Product not found or you are not authorized to delete this product." });
      }
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
  searchProducts: async (req, res) => {
    const searchQuery = req.query.q;
    if (!searchQuery) {
      return res.status(400).json({ message: "Please provide your key word" });
    }
    try {
      const products = await Product.searchByQuery(searchQuery);
      res.status(200).json(products); // Trả về danh sách sản phẩm, có thể rỗng
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
  getNumberProductByUser: async (req, res) => {
    try {
      const userId = req.params.id // Lấy userId từ URL
      // Gọi model để lấy số lượng sản phẩm
      const productCount = await Product.getNumberProductByUser(userId);

      res.status(200).json({ userId, productCount });
    } catch (error) {
      console.error("Error getting product count:", error);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  },
  // Xóa tất cả sản phẩm của một người bán theo userId
  deleteProductByUserId: async (req, res) => {

    const  userId  = req.user.userId; // Lấy userId từ URL
    const productId = req.params.id;
    try {
      const affectedRows = await Product.deleteByUserAndProductId(userId,productId);
      if (affectedRows) {
        res.status(200).json({ message: "All products of the seller have been deleted successfully." });
      } else {
        res.status(404).json({ message: "No products found for this seller." });
      }
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
};

module.exports = productController;

