const express = require('express');
const router = express.Router();

require("dotenv").config();
const axios = require('axios');
const categoryModel = require('../models/category.models.js'); // Điều chỉnh đường dẫn nếu cần
const userModel = require('../models/user.model.js')
const authMiddleware = require("../middlewares/authenticate");
const authenticate = require("../middlewares/authenticate");
const authAdminMiddleware = require("../middlewares/authorizeAdmin"); // Middleware này kiểm tra user có quyền admin hay không
const Wishlist = require('../models/whislist.model.js');
const reviewController = require("../controllers/reviewController.js")
const orderController = require("../controllers/orderController.js")
const userController = require("../controllers/userController.js")
const productModel = require('../models/product.model.js')
const orderModel = require('../models/order.models.js')
const productController = require('../controllers/productController.js')
const jwt = require("jsonwebtoken"); // Thêm JWT
const bcrypt = require("bcryptjs");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = require('../config/multer.js'); // Import multer config
const stripe = require('stripe')(process.env.SECRET_KEY_STRIPE);



router.get('/', authMiddleware, async (req, res) => {
  const errorMessage = req.query.errorMessage || null;
  try {
    const response = await fetch(`http://localhost:${process.env.PORT}/api/products`);
    const products = await response.json();
    res.render("home", { products, user: req.user, errorMessage }); // user sẽ là null nếu chưa đăng nhập

  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    res.render("home", { products: [], user: req.user, errorMessage });
  }
})
router.get('/contact', authMiddleware, async (req, res) => {
  res.render('contact', { user: req.user })

})
router.get('/about', authMiddleware, async (req, res) => {
  res.render('about', { user: req.user })

})
router.get('/cart', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.redirect('/?errorMessage=' + encodeURIComponent('You need to log in first'));
  }
  
  try {
    const userId = req.user.userId;

    const response = await axios.get(`http://localhost:${process.env.PORT}/api/cart?userId=${userId}`);
    const cartItems = response.data.cartItems;

    const updatedCartItems = await Promise.all(cartItems.map(async (item) => {
      try {
        const stockResponse = await axios.get(`http://localhost:${process.env.PORT}/api/products/${item.product_id}`);
        const stock = stockResponse.data.stock;

        return {
          ...item,
          stock: stock
        };
      } catch (error) {
        console.error(`Error fetching stock for product ID ${item.product_id}:`, error);
        return {
          ...item,
          stock: 0  // Default to 0 if there's an error fetching stock
        };
      }
    }));

    req.session.cartItems = updatedCartItems;
    res.render('cart', { user: req.user, cartItems: updatedCartItems });

  } catch (error) {
    console.error('Error loading cart items:', error);
    res.render('cart', { user: req.user, cartItems: [], errorMessage: 'Failed to load cart items' });
  }
});
router.get('/category/:categoryId', authMiddleware, async (req, res) => {
  const { categoryId } = req.params;

  try {
    // Gọi API để lấy danh sách sản phẩm theo danh mục
    const response = await fetch(`http://localhost:${process.env.PORT}/api/products/category/${categoryId}`);
    let products = await response.json();

    const response1 = await fetch(`http://localhost:${process.env.PORT}/api/products`);
    const featuredProducts = await response1.json();
    // Đảm bảo dữ liệu `products` là một mảng
    if (!Array.isArray(products)) {
      products = [];
    }

    // Lấy tên danh mục từ cơ sở dữ liệu
    let categoryName = await categoryModel.getCatNameById(categoryId);

    // Nếu không tìm thấy danh mục, đặt tên mặc định
    categoryName = categoryName || 'Category does not exsist';

    // Render trang với danh sách sản phẩm và tên danh mục
    res.render('products_by_categories', { products, categoryName, user: req.user, featuredProducts });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sản phẩm theo danh mục:', error);

    // Render trang với danh mục rỗng nếu có lỗi
    res.render('products_by_categories', { products: [], categoryName: 'Category does not exist', user: req.user,featuredProducts });
  }
})
router.get('/cart/checkout', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.redirect('/?errorMessage=' + encodeURIComponent('You need to log in first'));
  }

  // Lấy dữ liệu giỏ hàng từ session
  const cartItems = req.session.cartItems || [];

  if (cartItems.length === 0) {
    return res.render('checkout', {
      user: req.user,
      cartItems: [],
      errorMessage: 'Your cart is empty. Please add some items to your cart first.'
    });
  }

  // Truyền dữ liệu giỏ hàng vào view checkout
  res.render('checkout', { user: req.user, cartItems });
});

router.get('/product/:productId', authMiddleware, async (req, res) => {
  let prd = [];
  try {
    const productId = req.params.productId;
    // Gọi API lấy thông tin sản phẩm
    const response = await fetch(`http://localhost:${process.env.PORT}/api/products/${productId}`);
    const product = await response.json();

    if (response.status !== 200) {
      throw new Error(product.message || "Product not found");
    }

    // Lấy reviews từ hàm getReviewsByProductId
    const reviews = await reviewController.getReviewsByProduct(productId);
    prd = await productModel.getAll(); // Lấy tất cả sản phẩm để hiển thị ở sidebar

    // Render ra view với sản phẩm và reviews
    res.render('product_info', {
      user: req.user,
      product,
      prd,
      reviews
    });

  } catch (error) {
    console.error("Lỗi khi lấy thông tin sản phẩm:", error.message);
    res.render('product_info', {
      user: req.user,
      product: null,
      prd,
      reviews: null,
      errorMessage: error.message
    });
  }
});

router.get('/store', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.redirect('/?errorMessage=' + encodeURIComponent('You need to log in first'));
  }

  try {
    const products = await userModel.getProductsBySellerId(req.user.userId);
    const storeReviews = await reviewController.getReviewsBySeller(req.user.userId) || [];
    const bestReviews = storeReviews.slice(0, 5);
    const ratingNumber = storeReviews.length;

    return res.render('store', {
      products,
      ratingNumber,
      bestReviews,
      user: req.user
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error when fetching review.');
  }
});

router.get('/store/editproducts', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.redirect('/?errorMessage=' + encodeURIComponent('You need to log in first'));
  }
  try {
    const products = await userModel.getProductsBySellerId(req.user.userId);
    res.render('editproducts', { user: req.user, products: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error })
  }
});
//add product
router.post('/store/addproduct', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.user) {
    return res.redirect('/?errorMessage=' + encodeURIComponent('You need to log in first'));
  }
  try {
    const { name, price, stock, description, category_id } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!name || !price || !stock || !category_id) {
      throw new Error('Please fill in all required fields (Name, Price, Quantity, Category)');
    }

    // Kiểm tra ảnh có tồn tại không
    if (!req.file) {
      throw new Error('Please upload a product image!');
    }

    // Xử lý đường dẫn ảnh
    const imageUrl = `/uploads/${req.file.filename}`;

    const productData = {
      image_urls: imageUrl,
      name,
      description: description || '',
      price: parseFloat(price),
      stock: parseInt(stock),
      category_id: parseInt(category_id),
      seller_id: req.user.userId,
    };


    // Lưu sản phẩm vào DB
    const productId = await productModel.create(productData);

    const products = await userModel.getProductsBySellerId(req.user.userId);

    res.render('editproducts', {
      user: req.user,
      products: products
    });

  } catch (error) {
    console.error('Error adding product:', error);

    const products = await userModel.getProductsBySellerId(req.user.userId);

    res.render('editproducts', {
      user: req.user,
      products: products,
    });
  }
});


// Route GET để render trang Settings
router.get('/settings', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.redirect('/?errorMessage=' + encodeURIComponent('You need to log in first'));
  }
  try {
    // Giả sử user đã có thông tin theme và language
    res.render('setting', {
      user: req.user,
      successMessage: null,
      errorMessage: null
    });
  } catch (error) {
    console.error('Error rendering settings:', error);
    res.status(500).render('error', {
      message: 'Failed to load settings.',
      error: error
    });
  }
});

router.post('/settings/update-password', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.redirect('/?errorMessage=' + encodeURIComponent('You need to log in first'));
  }
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Kiểm tra mật khẩu mới và xác nhận có khớp không
    if (newPassword !== confirmPassword) {
      throw new Error('New password and confirmation do not match');
    }

    // Lấy thông tin user từ database
    const user = await userModel.findById(req.user.userId);
    if (!user) {
      throw new Error('Not found user information');
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error('The current password is incorrect');
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu
    const updated = await userModel.updatePassword(req.user.userId, hashedNewPassword);
    if (!updated) {
      throw new Error('Can not update password');
    }

    res.render('setting', {
      user: req.user,
      successMessage: 'Update password successfully!',
      errorMessage: null
    });
  } catch (error) {
    res.render('setting', {
      user: req.user,
      successMessage: null,
      errorMessage: error.message || 'Can not update password'
    });
  }
});
router.get('/whistlist', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.redirect('/?errorMessage=' + encodeURIComponent('You need to log in first'));
  }

  try {
    const products = await Wishlist.getWishlistByUserId(req.user.userId);
    res.render('whistlist', { products: products, user: req.user });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).render('error', {
      message: 'Failed to load wishlist. Please try again later.',
      error: error
    });
  }
})

router.get('/search', authMiddleware, async (req, res) => {

  const searchQuery = req.query.q;

  if (!searchQuery) {
    return res.redirect('/?errorMessage=' + encodeURIComponent('Plese type keyword for searching'));
  }

  try {
    const response = await fetch(`http://localhost:${process.env.PORT}/api/products/search?q=${encodeURIComponent(searchQuery)}`);
    const products = await response.json();

    if (!Array.isArray(products) || products.length === 0) {
      return res.render('search_result', {
        products: [],
        user: req.user,
        errorMessage: 'Product not found',
        searchQuery,
      });
    }

    if (products.length === 1) {
      return res.redirect(`/product/${products[0].id}`); // Sử dụng 'id' thay vì 'productId'
    }

    res.render('search_result', {
      products,
      user: req.user,
      searchQuery,
    });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm sản phẩm:", error);
    res.render('search_result', {
      products: [],
      user: req.user,
      errorMessage: 'Error when searching product',
      searchQuery,
    });
  }
});

router.get('/orders', authMiddleware, async (req, res) => {
  const successMessage = req.query.successMessage || null;
  const cancelMessage = req.query.cancelMessage || null;
  if (!req.user) {
    return res.redirect('/?errorMessage=' + encodeURIComponent('You need to log in first'));
  }
  try {
    const orders = await orderController.getOrders(req, res); // Lấy danh sách đơn hàng
    // console.log(orders);
    res.render('order', { orders, user: req.user, successMessage: successMessage, cancelMessage: cancelMessage }); // Render trang order.ejs với data

  } catch (error) {
    res.redirect('/?errorMessage=' + encodeURIComponent(error));
  }
});

router.get('/orders/:id', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.redirect('/?errorMessage=' + encodeURIComponent('You need to log in first'));
  }
  try {
    const orderId = req.params.id;
    const orderDetails = await orderController.getOrderDetailsById(orderId);
    res.render('order_details', { orderDetails, user: req.user });
  } catch (err) {
    console.error("Error rendering order_details page: ", err);
  }
});

//admin
router.get('/admin', async (req, res) => {
  // Kiểm tra xác thực
  if (!req.user) {
    return res.redirect('/?errorMessage=' + encodeURIComponent('you need to login first'));
  }

  // Lấy các tham số query
  const type = req.query.type || 'users'; // Mặc định là users
  const searchEmail = req.query.email || ''; // Tìm kiếm theo số điện thoại (cho users)
  const searchQuery = req.query.q || ''; // Tìm kiếm chung (cho products)
  const buyer_id = req.query.buyer_id || ''; // Tìm kiếm theo buyer_id (cho orders)

  try {
    let data = [];
    let message = '';

    // Xử lý theo loại dữ liệu
    if (type === 'users') {
      if (searchEmail) {
        data = await userModel.searchByEmail(searchEmail);
      } else {
        data = await userModel.getAllUsers();
      }
    } else if (type === 'products') {
      if (searchQuery) {
        data = await productModel.searchByQuery(searchQuery); // Chỉ tìm theo tên
        message = `Found ${data.length} product: ${searchQuery}`;
      } else {
        data = await productModel.getAll();
      }
    } else if (type === 'orders') {
      if (buyer_id) {
        data = await orderModel.getOrdersByBuyer(buyer_id);
      } else {
        data = await orderModel.getAll();
      }
    }

    // Render template với dữ liệu
    res.render('admin', {
      data: data,
      type: type,
      user: req.user,
      searchEmail: searchEmail,
      searchQuery: searchQuery,
      buyer_id: buyer_id,
      message: message
    });
  } catch (error) {
    console.error(`Lỗi khi tải danh sách ${type}:`, error);
    res.render('admin', {
      data: [],
      type: type,
      user: req.user,
      searchEmail: searchEmail,
      searchQuery: searchQuery,
      buyer_id: buyer_id,
      errorMessage: `Error when loading list ${type}`
    });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.redirect('/?errorMessage=' + encodeURIComponent('You need to log in first'));
  }
  try {
    const user = await userModel.findByEmail(req.user?.email);
    if (!user) {
      return res.redirect('/?errorMessage=' + encodeURIComponent('You need to log in first'));
    }
    res.render('userprofile', { user });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).send("Server Error");
  }
});


// Xử lý tạo thanh toán
router.post('/orders/payment/:orderId', authMiddleware, async (req, res) => {
  const { orderId } = req.params;
  const { total_price } = req.body;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Order #${orderId}`,
          // buyer_name: `Buyer ${buyer_name}`
        },
        unit_amount: Math.round(total_price * 100),
        // 20 USD
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/orders/success/${orderId}`,
    cancel_url: `${req.protocol}://${req.get('host')}/orders/cancel/${orderId}`,
  });

  res.redirect(303, session.url); // Điều hướng đến Stripe checkout
});

router.get('/orders/success/:orderId', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.redirect('/?errorMessage=' + encodeURIComponent('You need to log in first'));
  }
  const orderId = req.params.orderId;

  try {
    // Gọi phương thức để cập nhật trạng thái đơn hàng
    const result = await orderModel.updateStatusToSuccess(orderId);

    // Nếu cập nhật thành công
    const successMessage = `Payment successful for the order: #${orderId}`;
    res.redirect(`/orders?successMessage=${encodeURIComponent(successMessage)}`);

  } catch (err) {
    // Nếu có lỗi trong quá trình cập nhật trạng thái
    console.error('Error updating order status:', err);

    // Trả về thông báo lỗi cho người dùng
    const errorMessage = 'Unable to update the order status or the order has already been processed';
    res.redirect(`/orders?successMessage=${encodeURIComponent(errorMessage)}`);
  }
});

router.get('/orders/cancel/:orderId', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.redirect('/?errorMessage=' + encodeURIComponent('You need to log in first'));
  }

  const orderId = req.params.orderId;
  const cancelMessage = `Cancel payment for order: #${orderId}`;

  // Sau khi hủy đơn hàng thành công, redirect với query string chứa thông báo
  res.redirect(`/orders?cancelMessage=${encodeURIComponent(cancelMessage)}`);
});

router.get('/errorPage', async (req, res) => {
  res.render('errorpage')
})



router.get('/adminv2',authAdminMiddleware, async (req, res) => {
  if (!req.user) {
    return res.redirect('/?errorMessage=' + encodeURIComponent('You need to log in first'));
  }
  try {
    const userResponse = await fetch(`http://localhost:${process.env.PORT}/api/admin/user`);
    const users = await userResponse.json();

    const ordersResponse = await fetch(`http://localhost:${process.env.PORT}/api/order/all`);
    const orders = await ordersResponse.json();

    const numberOfUser = users.length;
    const numberOfOrders = orders.length;
    let totalProductsSold = 0;
    let totalRevenue = 0;

    for (const order of orders) {
      const status = order.status;
      const orderId = order.id;
      if (status === 'success') {
        totalRevenue += parseFloat(order.total_price);
        const details = await orderController.getOrderDetailsById(orderId);
        for (const item of details.items) {
          totalProductsSold += item.quantity
        }
      }
    }

    const now = new Date();
    const past30Days = 30;
    
    const dailyLabels = Array.from({ length: past30Days }, (_, i) => {
      const date = new Date();
      date.setDate(now.getDate() - (past30Days - 1 - i));
      return date.toISOString().split('T')[0]; 
    });
    
    const dailyUsers = Array(past30Days).fill(0);
    const dailyOrders = Array(past30Days).fill(0);
    const dailyRevenue = Array(past30Days).fill(0);
    
    const getDateIndex = (dateString) => {
      return dailyLabels.indexOf(dateString);
    };
    
    for (const order of orders) {
      const orderDate = new Date(order.created_at);
      const orderDateString = orderDate.toISOString().split('T')[0];
      const index = getDateIndex(orderDateString);
    
      if (index !== -1) {
        dailyOrders[index] += 1;
        if (order.status === 'success') {
          const price = parseFloat(order.total_price || 0);
          dailyRevenue[index] += price;
        }
      }
    }
    
    for (const user of users) {
      const userDate = new Date(user.created_at);
      const userDateString = userDate.toISOString().split('T')[0];
      const index = getDateIndex(userDateString);
    
      if (index !== -1) {
        dailyUsers[index] += 1;
      }
    }
    
    res.render('adminv2', {
        user: req.user,
        totalUser: numberOfUser,
        orders: numberOfOrders,
        revenue: totalRevenue,
        avgPrice: 15.9,
        productsSold: totalProductsSold,
        mostRecentlyMonth: {
          label:dailyLabels,
          users: dailyUsers,
          revenue: dailyRevenue,
          orders: dailyOrders
        },
        monthlyEarnings: [
            { name: 'Total Income', value: 56241 },
            { name: 'Marketplace', value: 23651 },
            { name: 'Total Income', value: 89425 },
            { name: 'Marketplace', value: 56210 },
            { name: 'Last Month', value: 8974 },
            { name: 'Marketplace', value: 2548 },
            { name: 'Total Income', value: 6985 }
        ]
     });
  } catch (error) {
    console.error(`Lỗi khi tải danh sách :`, error);
    res.render('adminv2', {
      user: req.user,
      totalUser: 0,
      orders: 0,
      revenue: 0,
      avgPrice: 0,
      productsSold: 0,
      mostRecentlyMonth: {
        label:Array(31).fill(0),
        users: Array(31).fill(0),
        revenue: Array(31).fill(0),
        orders: Array(31).fill(0)
      },
      monthlyEarnings: [
          { name: 'Total Income', value: 0 },
          { name: 'Marketplace', value: 0 },
          { name: 'Total Income', value: 0 },
          { name: 'Marketplace', value: 0 },
          { name: 'Last Month', value: 0 },
          { name: 'Marketplace', value: 0 },
          { name: 'Total Income', value: 0 }
      ]
    });
  }
  
});


module.exports = router;