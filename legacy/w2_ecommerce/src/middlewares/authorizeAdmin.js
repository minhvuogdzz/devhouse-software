const jwt = require("jsonwebtoken");


const authAdminMiddleware = (req, res, next) => {
  // Nếu chưa đăng nhập hoặc không phải user
  if (!req.user) {
    return res.redirect("/login");
  }

  // Kiểm tra email có đúng admin không
  const { email } = req.user;
  if (email !== "admin@gmail.com") {
    return res.status(403).send("Bạn không có quyền truy cập trang này.");
  }

  // Cho phép đi tiếp
  next();
};

module.exports = authAdminMiddleware;