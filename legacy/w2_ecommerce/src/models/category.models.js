const db = require('../config/db');

const category = {
  getCatNameById: async (catId) => {
    const sql = "SELECT name FROM categories WHERE id = ?";
    try {
      const [rows] = await db.promise().execute(sql, [catId]);
      // Nếu có dữ liệu, trả về tên của danh mục
      if (rows.length > 0) {
        return rows[0].name;
      }
      // Nếu không tìm thấy, trả về null
      return null;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = category;
