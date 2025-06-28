
// const User = require("../models/user.model")
const User = require("../models/user.model")
const jwt = require("jsonwebtoken"); // Thêm JWT

// Get me with jwt 
const getMe = async(req,res) =>{

  try{
    if(!req.user){
      return res.status(401).json({msg : "Unauthorized"});
    }
    const user = await User.findByEmail(req.user.email);

    if(!user) return res.status(404).json({msg : "User not found!!"});

    res.status(200).json(user);

  }catch(err){
    res.status(500).json({msg : "Sever error",error: err.message });
  }

}
// Get /api/users/:id - Lấy thông tin từ user khác 
const getUserById = async(req,res) =>{
  try{
    const userId = req.params.id;
    const user = await User.findById(userId);

    if(!user){
      return res.status(404).json({msg : "User not found!!"});
    }

    res.status(200).json(user);
  }catch(error){
    res.status(500).json({msg : "Server Error!!", error: error.message});
  }

}
  const updateUserInfo = async (req, res) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ msg: "Unauthorized access" });
      }

      const { username, phone, address, city, postalCode } = req.body;
      if (![username, phone, address, city, postalCode].some(Boolean)) {
        return res.status(400).json({ msg: "No fields to update" });
      }

      const updatedUser = await User.updateUser(userId, {
        username,
        phone,
        address,
        city,
        postalCode,
      });

      if (!updatedUser || updatedUser.affectedRows === 0) {
        return res.status(404).json({ msg: "User not found" });
      }
      const token = jwt.sign({ userId: userId, role: req.user.role, email: req.user.email, username: username }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
  
      res.cookie("token", token, { httpOnly: true, maxAge: 3600000 }); // Lưu JWT vào cookie
      
      res.redirect("/profile");
      
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  };
// Endpoint tìm kiếm user theo số điện thoại
const searchUsersByPhone = async (req, res) => {
  const searchPhone = req.query.phone || '';
  try {
    const users = await User.searchByPhone(searchPhone);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {getMe,getUserById,updateUserInfo,searchUsersByPhone};