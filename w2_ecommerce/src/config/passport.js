const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js'); // ✅ Import model User

require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,           // Lấy từ .env
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,   // Lấy từ .env
  callbackURL: "/api/auth/google/callback"          // URL chuyển hướng
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      // ✅ Lấy thông tin từ Google
      const userData = {
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value || null,   // Lấy avatar nếu có
      };

      // ✅ Kiểm tra xem người dùng đã tồn tại trong DB chưa
      let user = await User.findByEmail(userData.email);
      if (!user) {
        // ✅ Nếu chưa tồn tại => Tạo mới
        const insertId =  await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: "1",
          role: "user"
        });
        user = await User.findById(insertId);
        console.log("✅ Tạo mới người dùng",user);
      } else {
        console.log("✅ Người dùng đã tồn tại");
      }
      console.log(user);
      // ✅ Tạo JWT Token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, username: user.username },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );

      done(null, token); // Trả về JWT Token

    } catch (error) {
      console.error("🔥 Lỗi trong Google Auth:", error);
      done(error, false);
    }
  }
));