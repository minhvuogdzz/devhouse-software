const express = require("express");
const reviewController = require("../controllers/reviewController");
const authenticate = require("../middlewares/authenticate"); // Middleware xác thực người dùng

const router = express.Router();

// POST /api/reviews - Thêm đánh giá mới (Buyer cần đăng nhập)
router.post("/", authenticate, reviewController.createReview);

// GET /api/reviews/:productId - Lấy danh sách đánh giá theo productId
router.get("/:productId", reviewController.getReviewsByProductId);

module.exports = router;