const db = require("../config/db")

const Product = {
  //get all product
  getAll: async () => {
    const sql = "SELECT * FROM products";
    try {
      const [products] = await db.promise().query(sql);
      return products;
    } catch (err) {
      throw err;
    }
  },
  getById: async (id) => {
    const sql = "SELECT * FROM products WHERE id = ?";
    try {
      const [rows] = await db.promise().execute(sql, [id])
      return rows.length ? rows[0] : null;
    } catch (err) {

      console.log('Error: ', err);
      throw err;
    }
  },
  create: async (productData) => {
    const { name, description, price, stock, image_urls, category_id, seller_id } = productData;
    const sql = `INSERT INTO products (name, description, price, stock, image_urls, category_id, seller_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    try {
      id = await db.promise().execute(sql, [name, description, price, stock, image_urls, category_id, seller_id]);
      return id;
    } catch (error) {
      throw error;
    }
  },
  // Cập nhật sản phẩm (Seller)
  update: async (id, productData) => {
    // Tạo mảng chứa các trường cần update
    const updateFields = [];
    const values = [];

    // Kiểm tra và thêm các trường có giá trị hợp lệ vào updateFields và values
    if (productData.name !== undefined && productData.name !== null) {
      updateFields.push('name = ?');
      values.push(productData.name);
    }

    if (productData.description !== undefined && productData.description !== null) {
      updateFields.push('description = ?');
      values.push(productData.description);
    }

    if (productData.stock !== undefined && productData.stock !== null) {
      updateFields.push('stock = ?');
      values.push(productData.stock);
    }

    if (productData.price !== undefined && productData.price !== null) {
      updateFields.push('price = ?');
      values.push(productData.price);
    }

    if (productData.image_urls !== undefined && productData.image_urls !== null) {
      updateFields.push('image_urls = ?');
      values.push(productData.image_urls);
    }

    // Nếu không có trường nào cần cập nhật, trả về 0
    if (updateFields.length === 0) {
      return 0;
    }

    // Tạo câu lệnh SQL với các trường cần cập nhật
    const sql = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;

    // Thêm id vào cuối mảng values
    values.push(id);

    try {
      const [result] = await db.promise().execute(sql, values);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  },
  // Xóa sản phẩm (Seller)
  delete: async (id) => {
    const sql = "DELETE FROM products WHERE id = ?";
    try {
      const [result] = await db.promise().execute(sql, [id]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  },
  getByCategory: async (categoryId) => {
    const sql = "SELECT * FROM products WHERE category_id = ?";
    try {
      const [products] = await db.promise().execute(sql, [categoryId]);
      return products;
    } catch (err) {
      console.error('Error:', err);
      throw err;
    }
  },
  getCategories: async () => {
    const sql = "SELECT id, name FROM categories";
    try {
      const [categories] = await db.promise().query(sql);
      return categories
    } catch (err) {
      throw err;
    }
  },

  // Xóa sản phẩm theo userId và productId
  deleteByUserAndProductId: async (userId, productId) => {
    const sql = "DELETE FROM products WHERE seller_id = ? AND id = ?";
    try {
      // Thực thi câu lệnh SQL
      const [result] = await db.promise().execute(sql, [userId, productId]);

      // Kiểm tra số lượng dòng bị ảnh hưởng
      if (result.affectedRows > 0) {
        console.log(`Deleted ${result.affectedRows} product(s) with product_id ${productId} for seller_id ${userId}.`);
        return result.affectedRows; // Trả về số dòng đã xóa
      } else {
        console.log(`No product found with product_id ${productId} for seller_id ${userId}.`);
        return 0; // Nếu không có sản phẩm nào bị xóa, trả về 0
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error; // Ném lỗi ra ngoài để xử lý ở các tầng phía trên
    }
  },

  // search
  searchByQuery: async (searchQuery) => {
    const sql = `
      SELECT * FROM products 
      WHERE name LIKE ? OR description LIKE ?
    `;
    const searchTerm = `%${searchQuery}%`; // Tìm kiếm gần đúng
    try {
      const [products] = await db.promise().execute(sql, [searchTerm, searchTerm]);
      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  getNumberProductByUser: async (userId) => {
    const sql = "SELECT COUNT(*) AS productCount FROM products WHERE seller_id = ?";
    try {
      const [rows] = await db.promise().execute(sql, [userId]);
      return rows[0]?.productCount || 0;
    } catch (error) {
      console.error("Error getting product count:", error);
      throw error;
    }
  },


}

module.exports = Product;
