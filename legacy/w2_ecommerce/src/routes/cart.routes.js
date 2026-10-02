const express = require('express');
const router = express.Router();
const authenticate = require("../middlewares/authenticate");

const cartController = require('../controllers/cartController.js');

// Lấy danh sách sản phẩm trong giỏ hàng
router.get('/',authenticate, cartController.getCartByUserId);

// Thêm sản phẩm vào giỏ hàng
router.post('/add',authenticate, cartController.addToCart);

// Xóa sản phẩm khỏi giỏ hàng
router.post('/remove',authenticate ,cartController.removeFromCart);

// Xóa toàn bộ giỏ hàng
router.delete('/clear',authenticate, cartController.clearCart);

module.exports = router;
