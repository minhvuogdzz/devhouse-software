const db = require('../config/db');

const cart = {
  getCartByUserId: async (userId) => {
    const sql = `
      SELECT ci.id AS cart_item_id, ci.quantity, 
             p.id AS product_id, p.name, p.price, p.image_urls
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `;
    try {
      const [rows] = await db.promise().execute(sql, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  addToCart: async (userId, productId, quantity = 1) => {
    const sql = `
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + ?
    `;
    try {
      await db.promise().execute(sql, [userId, productId, quantity, quantity]);
      return { message: "Product added to cart successfully." };
    } catch (error) {
      throw error;
    }
  },

  removeFromCart: async (userId, productId) => {
    const sql = "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?";
    try {
      await db.promise().execute(sql, [userId, productId]);
      return { message: "Product removed from cart successfully." };
    } catch (error) {
      throw error;
    }
  },

  clearCart: async (userId) => {
    const sql = "DELETE FROM cart_items WHERE user_id = ?";
    try {
      await db.promise().execute(sql, [userId]);
      return { message: "Cart cleared successfully." };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = cart;
