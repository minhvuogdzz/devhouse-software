const express = require("express");
const adminController = require("../controllers/adminController");
const authenticate = require("../middlewares/authenticate");
const authorizeAdmin = require("../middlewares/authorizeAdmin"); // Middleware này kiểm tra user có quyền admin hay không
const { searchUsersByPhone } = require("../controllers/userController");

const router = express.Router();



// Lấy danh sách user (chỉ admin mới có quyền truy cập)
router.get("/user", authenticate, adminController.getAllUsers);

// Xóa user theo id (chỉ admin mới có quyền truy cập)
router.delete("/users/:id", authenticate,  adminController.deleteUser);

// Tìm kiếm người dùng theo số điện thoại
// router.get("/search_user", authenticate, authorizeAdmin, adminController.searchUsersByPhone);

module.exports = router;