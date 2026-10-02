// ReviewModel.js (Node.js Model)
const db = require('../config/db');

const Review = {
  // Lấy tất cả các đánh giá
  getAllReviews: async () => {
    const sql = "SELECT * FROM reviews";
    try {
      const [rows] = await db.promise().execute(sql);
      return rows;
    } catch (error) {
      throw error;
    }
  },
  // Lấy đánh giá theo Product ID
  // Lấy review theo productId (kèm thông tin user và product)
  getReviewByProductId: async (productId) => {
    const sql = `
    SELECT 
      r.id AS review_id,
      r.comment,
      r.rating,
      r.created_at,
      u.id AS user_id,
      u.username AS user_name,
      u.email,
      p.id AS product_id,
      p.name AS product_name,
      p.price,
      p.description
    FROM reviews r
    JOIN users u ON r.buyer_id = u.id
    JOIN products p ON r.product_id = p.id
    WHERE r.product_id = ?
  `;
    try {
      const [rows] = await db.promise().execute(sql, [productId]);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Lấy đánh giá theo ID
  getReviewById: async (id) => {
    const sql = "SELECT * FROM reviews WHERE id = ?";
    try {
      const [rows] = await db.promise().execute(sql, [id]);
      if (rows.length > 0) {
        return rows[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  getReviewsBySellerId: async(sellerId) => {
    const sql = `
      SELECT 
        p.seller_id,
        p.name AS product_name,
        u.username AS buyer_username, 
        r.rating,
        r.comment,
        r.created_at
      FROM products AS p
      JOIN reviews AS r ON r.product_id = p.id
      JOIN users AS u ON u.id = r.buyer_id
      WHERE p.seller_id = ?
      ORDER BY rating DESC
    `
    try {
      const [rows] = await db.promise().execute(sql, [sellerId]);
      console.log(rows)
      return rows.length > 0 ? rows : null;
    } catch (error) {
      throw error;
    }
  },

  // Thêm đánh giá mới
  create: async (productId, buyerId, rating, comment) => {
    const sql = "INSERT INTO reviews (product_id, buyer_id, rating, comment) VALUES (?, ?, ?, ?)";
    try {
      const [result] = await db.promise().execute(sql, [productId, buyerId, rating, comment]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật đánh giá
  updateReview: async (id, rating, comment) => {
    const sql = "UPDATE reviews SET rating = ?, comment = ? WHERE id = ?";
    try {
      const [result] = await db.promise().execute(sql, [rating, comment, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  // Xóa đánh giá
  deleteReview: async (id) => {
    const sql = "DELETE FROM reviews WHERE id = ?";
    try {
      const [result] = await db.promise().execute(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Review;
