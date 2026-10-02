const db = require('../config/db')


const Order = {


  // Thêm đơn hàng mới
  addOrder: async (buyer_id, total_price, full_name, phone, street, city, postal_code) => {
    console.log(buyer_id, total_price, full_name, phone, street, city, postal_code)
    const sql = `
      INSERT INTO orders (buyer_id, total_price, full_name, phone, street, city, postal_code)
      VALUES (?, ?, ?, ?, ?, ?, ?)`; // Trạng thái mặc định là 'pending'

    try {
      const [result] = await db.promise().execute(sql, [buyer_id, total_price, full_name, phone, street, city, postal_code]);
      return result.insertId; // Trả về id của đơn hàng vừa được tạo
    } catch (err) {
      throw err;
    }
  },
  // Xóa đơn hàng và các item của đơn hàng theo userId và orderId
  deleteByUserIdAndOrderId: async (userId, orderId) => {
    const sqlDeleteItems = `
    DELETE FROM order_items WHERE order_id = ?
  `; // Xóa các sản phẩm trong đơn hàng

    const sqlDeleteOrder = `
    DELETE FROM orders WHERE id = ? AND buyer_id = ?
  `; // Xóa đơn hàng

    try {
      // Xóa các item của đơn hàng
      await db.promise().execute(sqlDeleteItems, [orderId]);

      // Xóa đơn hàng nếu có
      const [result] = await db.promise().execute(sqlDeleteOrder, [orderId, userId]);

      // Nếu không có đơn hàng nào bị xóa, ném lỗi
      if (result.affectedRows === 0) {
        throw new Error('No order found or unauthorized to delete this order.');
      }

      return { success: true, message: 'Order and its items deleted successfully.' };
    } catch (err) {
      console.error('Error deleting order:', err);
      throw err;
    }
  },
  // Thêm sản phẩm vào đơn hàng
  addOrderItems: async (order_id, product_id, quantity) => {
    const sql = `
      INSERT INTO order_items (order_id, product_id, quantity)
      VALUES (?, ?, ?)`;

    try {
      await db.promise().execute(sql, [order_id, product_id, quantity]);
    } catch (err) {
      throw err;
    }
  },
  getOrdersByBuyer: async (buyer_id) => {
    try {
      const [rows] = await db.promise().query("SELECT * FROM orders WHERE buyer_id = ?", [buyer_id]);

      return rows.length > 0 ? rows : [];  // ✅ Trả về danh sách hoặc mảng rỗng nếu không có đơn hàng
    } catch (err) {
      console.error("Database error:", err);
      return null;  // ✅ Trả về null nếu có lỗi
    }
  },
  // get Detail order by Id
  getOrderById: async (id) => {
    const sql = "SELECT * FROM orders WHERE id = ?";
    try {
      const [rows] = await db.promise().execute(sql, [id]);
      return rows.length ? rows[0] : null;
    } catch (err) {
      throw err;
    }
  },

  // get all order_items 
  getOrderItemsByOrderId: async (orderId) => {
    const sql = `
      SELECT 
        oi.product_id,
        oi.quantity,
        p.name,
        p.price,
        p.image_urls
      FROM order_items AS oi
      JOIN products AS p on p.id = oi.product_id
      JOIN orders AS o on o.id = oi.order_id
      WHERE oi.order_id = ?
    `;
    try {
      const [rows] = await db.promise().execute(sql, [orderId]);
      return rows.length > 0 ? rows : [];
    } catch (err) {
      throw err;
    }
  },
  updateStatusToSuccess: async (orderId) => {
    const sql = `
      UPDATE orders 
      SET status = 'success' 
      WHERE id = ? AND status = 'pending'`;  // Chỉ cập nhật nếu trạng thái hiện tại là 'pending'
  
    try {
      const [result] = await db.promise().execute(sql, [orderId]);
      
      // Kiểm tra nếu có bản ghi bị ảnh hưởng (update thành công)
      if (result.affectedRows === 0) {
        throw new Error('No matching order found or order is already processed.');
      }
  
      return { success: true, message: 'Order status updated to success.' };
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  },
  // get all orders (for admin)
  getAll: async () => {
    const sql = "SELECT * FROM orders";
    try {
      const [rows] = await db.promise().query(sql);
      return rows.length > 0 ? rows : [];
    } catch (err) {
      throw err;
    }
  },
}
module.exports = Order;
