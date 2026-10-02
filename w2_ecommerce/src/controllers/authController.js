const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model")
require("dotenv").config();


const SECRET_KEY = process.env.SECRET_KEY;

//Register user

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ Kiểm tra email đã tồn tại
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      // Trả về lỗi nếu đã tồn tại
      return { errorMessage: "Email đã tồn tại! Vui lòng đăng nhập." };
    }
    // ✅ Hash mật khẩu 
    const hashedPassword = await bcrypt.hash(password, 10);

    const role = "user";

    // ✅ Tạo user
    const userId = await User.create({ name, email, password: hashedPassword, role });

    const user = await User.findById(userId);

    return { user };  // Trả về user nếu thành công
  } catch (error) {

    console.error("🔥 Lỗi trong register:", error);
    
    return { errorMessage: "Lỗi server! Vui lòng thử lại." };
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with email
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "User isn't existed" })
    }
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ message: "Email or password is wrong!!Please check again" });

    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

    res.status(200).json({ msg: "Login successfully!!" });

  } catch (err) {
    res.status(500).json({ message: "Error from server!!", err });
  }
};




module.exports = { register, login };