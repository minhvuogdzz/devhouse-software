const Order = require('../models/order.models')
const Product = require('../models/product.model')
const normalizeCartItems = require('../middlewares/normalizeCart')
const orderController = {


  // GET /api/orders
  getOrders: async (req) => {
    try {
      const buyer_id = req.user.userId;
      const orders = await Order.getOrdersByBuyer(buyer_id);
      return orders; // Chỉ return data, không dùng res.json()
    } catch (err) {
      console.error("Error fetching orders by buyers:", err);
      throw new Error("Unable to fetch orders. Please try again later."); // Ném lỗi để router xử lý
    }
  },

  // GET /api/orders/:id - Get detail of orders

  getOrderById: async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await Order.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found!!!" });
      }
      return res.status(200).json(order);
    } catch (error) {
      console.error("Error fetching order details: ", error);
      return res.status(500).json({ message: "Unable to fetch order details" });
    }

  },
    // POST /api/orders - Create a new order
    createOrder: async (req, res) => {
      try {
        const buyer_id = req.user.userId;
        const { subtotal, firstName, phone, streetAddress, city, postalCode, cartItems } = req.body;

        // Check if cartItems are provided and not empty
        if (!cartItems || cartItems.length === 0) {
          return res.status(400).json({ message: "No items in the cart." });
        }

        // Create the order
        // console.log(req.body);
        const orderId = await Order.addOrder(buyer_id, subtotal, firstName, phone, streetAddress, city, postalCode);

        // Add items to the order
        const normalizedCartItems = normalizeCartItems(cartItems);


        for (let item of normalizedCartItems) {
          const { productId, quantity } = item;
          // Ensure the product exists before adding to the order
          const product = await Product.getById(productId);
          if (!product) {
            return res.status(400).json({ message: `Product with ID ${productId} does not exist.` });
          }
          product.stock -= quantity;
          await Product.update(product.id, product)

          // Add the item to order_items table
          await Order.addOrderItems(orderId, productId, quantity);
        }

        res.redirect('/orders')
      } catch (err) {

        console.error("Error creating order: ", err);

        return res.status(500).json({ message: "Unable to create order. Please try again later." });
      }
    },

  //GET /api/orders/details/:id - get all order items from orderId
  getOrderDetailsById: async(orderId) => {
    try {
      const order = await Order.getOrderById(orderId);
      if (!order) {
        console.log("Order not found.");
      }
      
      const orderItems = await Order.getOrderItemsByOrderId(orderId);
      if (!orderItems || orderItems.length === 0) {
        console.log("No items found in this order.");
      }
      
      return {
        order: order,
        items: orderItems
      };
      
    } catch(err) {
      console.error("Error fetching all order items", err);
      console.log("Unable to fetch order details. Please try again later.");
    }
  },

  //GET /api/orders/all - get all orders
  getAllOrders: async(req, res) => {
    try {
      const orders = await Order.getAll();
      return res.status(200).json(orders);
    } catch(err) {
      console.error("Error fetching all orders: ", err);
      return res.status(500).json({message: "Unable to fetch all orders. Please try again later."});
    }
  },
  // DELETE /api/orders/:id - Delete order by userId and orderId
  deleteOrderByUserIdAndOrderId: async (req, res) => {
    const userId = req.user.userId;  // Assuming `userId` is available from authentication
    const orderId = req.params.id;
    console.log(userId,orderId);
    try {
      // Call the delete method from the Order model
      const result = await Order.deleteByUserIdAndOrderId(userId, orderId);
      // If result is successful, return success message
      
      return res.status(200).json(result);
    } catch (err) {
      console.error("Error deleting order:", err);
      return res.status(500).json({ message: "Unable to delete the order. Please try again later." });
    }
  }
}


module.exports = orderController;