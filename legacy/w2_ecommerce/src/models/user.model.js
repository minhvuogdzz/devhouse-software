const db = require("../config/db");


const User = {
  create: async (userData) => {
    const { name, email, password, role } = userData;
    const sql = "INSERT INTO users(username, email, password, role) VALUES (?, ?, ?, ?)";

    try {
      // Sử dụng `await` để đợi kết quả từ MySQL
      const [result] = await db.promise().execute(sql, [name, email, password, role]);

      console.log(`Add user with email ${email} successfully!!`);
      return result.insertId;
    } catch (err) {
      console.error("Error inserting user:", err);
      throw err;
    }
  },
  checkUserAdmin: async (userId) => {
    try {
      const sql = "SELECT role FROM users WHERE id = ?";
      const [rows] = await db.promise().execute(sql, [userId]);
  
      if (rows.length > 0) {
        return rows[0].role === 'admin';
      } else {
        return false; // Không tìm thấy user
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra role:", error);
      throw error;
    }
  },
  // Cập nhật mật khẩu
  updatePassword: async (userId, newPassword) => {
    try {
      const sql = "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      const [result] = await db.promise().execute(sql, [newPassword, userId]);
      return result.affectedRows > 0; // Trả về true nếu cập nhật thành công
    } catch (error) {
      console.error('Lỗi khi cập nhật mật khẩu:', error);
      throw error;
    }
  },

  searchByPhone: async (phone) => {
    try {
      let sql = 'SELECT * FROM users';
      let params = [];
      if (phone) {
        sql += ' WHERE phone LIKE ?';
        params.push(`%${phone}%`);
      }
      const [users] = await db.promise().query(sql, params);
      return users;
    } catch (error) {
      console.error('Error searching users by phone:', error);
      throw error;
    }
  },

  findByEmail: async (email) => {
    try {
      const [rows] = await db.promise().execute("SELECT * FROM users WHERE email = ?", [email]);
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      throw err;
    }
  },
  searchByEmail: async (email) => {
    try {
        const sql = "SELECT * FROM users WHERE email LIKE ?";
        const [users] = await db.promise().execute(sql, [`%${email}%`]); 
        return users;
    } catch (error) {
        console.error("Lỗi khi tìm kiếm user theo email:", error);
        throw error;
    }
},

  findById: async (id) => {
    try {
      const [rows] = await db.promise().execute("SELECT * FROM users WHERE id = ?", [id]);
      console.log(rows, id);
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      throw err;
    }
  },
  // Lấy danh sách tất cả user
  getAllUsers: async () => {
    try {
      const [users] = await db.promise().query("SELECT * FROM users");
      return users;
    } catch (error) {
      throw error;
    }
  },
  // Xóa user theo id
  deleteUserById: async (id) => {
    try {
      const [result] = await db.promise().execute("DELETE FROM users WHERE id = ?", [id]);
      return result; // result.affectedRows sẽ cho biết có bao nhiêu dòng bị xóa
    } catch (error) {
      throw error;
    }
  },

  getNumberOfProductsBySellerId: async (sellerId) => {
    try {
      const [rows] = await db.promise().execute(
        "SELECT COUNT(*) AS count FROM products WHERE seller_id = ?",
        [sellerId]
      );
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  },

  getProductsBySellerId: async (sellerId) => {
    try {
      const [rows] = await db.promise().execute(
        "SELECT * FROM products WHERE seller_id = ?",
        [sellerId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },
  updateUser: async (id, userData) => {
    const { username, phone, address, city, postalCode } = userData;
    const sql = `UPDATE users SET 
      username = ?, 
      phone = ?, 
      address = ?, 
      city = ?, 
      postal_code = ?, 
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`;

    try {
      const [result] = await db.promise().execute(sql, [username, phone, address, city, postalCode, id]);
      return result;
    } catch (error) {
      throw error;
    }
  },



};


module.exports = User;

