const Wishlist = require("../models/whislist.model");

// Lấy danh sách wishlist theo userId
const getWhistlistByUserId = async (req, res) => {
  try {
    const wishlist = await Wishlist.getWishlistByUserId(req.user.id);
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};
// Thêm sản phẩm vào wishlist
// Thêm sản phẩm vào wishlist với kiểm tra
const addToWhistlist = async (req, res) => {
  if (!req.user) {
   return res.redirect('/?errorMessage=' + encodeURIComponent('You need to log in first'));
  }
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ msg: "Product ID is required" });
    }

    // Kiểm tra nếu sản phẩm đã tồn tại
    const isExist = await Wishlist.isProductInWhistlist(req.user.userId, productId);
    if (isExist) {
      return res.status(400).json({ msg: "Product already in whistlist!!" });
    }
    await Wishlist.addToWishlist(req.user.userId, productId);
    return res.status(201).json({ msg: "Added to wishlist successfully!" });
  } catch (error) {
    return res.status(500).json({ msg: "Server Error", error: error.message });
  }
};
// Xóa sản phẩm khỏi wishlist
const removeFromWhistlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ msg: "Product ID is required" });
    }

    await Wishlist.removeFromWishlist(req.user.userId, productId);
    res.status(200).json({ msg: "Removed from wishlist successfully!" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

module.exports = {
  getWhistlistByUserId,
  addToWhistlist,
  removeFromWhistlist,
};