const User = require('../models/user.model')



const adminController = {
  // Get /api/admin/user - Lấy danh sách user

  getAllUsers: async (req,res) =>{
    try{
      const users = await User.getAllUsers();
      res.status(200).json(users);

    }catch(error){
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  deleteUser: async(req,res) =>{
    try{
      const userId = req.params.id;
      const result = await User.deleteUserById(userId);

      if(result.affectedRows > 0){
        res.status(200).json({ message: "User deleted successfully!!"});
      } else {
        res.status(404).json({ message: "User not found!!"});
      }

    }catch(error){
      res.status(500).json({message: "Sever error", error: error.message});
    }
  },

  searchUsersByPhone : async (req, res) => {
    const searchPhone = req.query.phone || '';
    
    try {
      const users = await User.searchByPhone(searchPhone);
      res.render('admin', {
        data: users,
        type: 'users',
        user: req.user,
        searchPhone: searchPhone,
        searchQuery: '',
        message: searchPhone ? `Tìm thấy ${users.length} người dùng với số điện thoại: ${searchPhone}` : 'Hiển thị tất cả người dùng'
      });
    } catch (error) {
      console.error('Lỗi khi tìm kiếm người dùng:', error);
      res.render('admin', {
        data: [],
        type: 'users',
        user: req.user,
        searchPhone: searchPhone,
        searchQuery: '',
        errorMessage: 'Lỗi khi tìm kiếm người dùng'
      });
    }
  }
}

module.exports = adminController;