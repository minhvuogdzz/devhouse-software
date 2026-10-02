const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token; // Lấy token từ cookie

  if (!token) {

    req.user = null;

    next();
  } else {

    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      req.user = decoded; // Lưu thông tin user vào req để sử dụng sau này

      next(); // Cho phép request tiếp tục

    } catch (error) {

      console.error("JWT không hợp lệ:", error);

      res.clearCookie("token");

      return res.redirect("/login");
    }
  }

};

module.exports = authMiddleware;
