const cart = require('../models/cart.models');

// Lấy giỏ hàng của người dùng
const getCartByUserId = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized: Please login first." });
    }

    const cartItems = await cart.getCartByUserId(userId);
    if (cartItems.length === 0) {
      return res.status(200).json({ msg: "Your cart is empty.", cartItems: [] });
    }

    res.status(200).json({ cartItems });
  } catch (error) {
    console.error('Error fetching cart:', error);

    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Thêm sản phẩm vào giỏ hàng
const addToCart = async (req, res) => {

  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;
    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized: Please login first." });
    }

    if (!productId || !quantity) {
      return res.status(400).json({ msg: "Product ID and quantity are required." });
    }

    await cart.addToCart(userId, productId, quantity);
    res.status(201).json({ msg: "Product added to cart successfully." });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized: Please login first." });
    }
    if (!productId) {
      return res.status(400).json({ msg: "Product ID is required." });
    }

    await cart.removeFromCart(userId, productId);
    
    res.status(200).json({ msg: "Product removed from cart successfully." });
    
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Xóa toàn bộ giỏ hàng
const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized: Please login first." });
    }

    await cart.clearCart(userId);
    res.status(200).json({ msg: "Cart cleared successfully." });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

module.exports = {
  getCartByUserId,
  addToCart,
  removeFromCart,
  clearCart,
};
