const multer = require('multer');
const path = require('path');

// Cấu hình lưu file ảnh vào thư mục uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/public/uploads'); // Lưu vào thư mục này trong source code
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Tạo tên file duy nhất
  }
});

// Middleware Multer
const upload = multer({ storage: storage });

module.exports = upload;
