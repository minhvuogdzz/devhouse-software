const express = require('express')
const productController = require('../controllers/productController')
const authenticate = require('../middlewares/authenticate')
const upload = require('../config/multer.js'); // Import multer config
const productModel = require('../models/product.model.js')

const router = express.Router();


router.get('/search', productController.searchProducts);

router.get('/',productController.getAllProducts);

router.get('/categories', productController.getAllCategories);

router.get('/:id',productController.getProductById);

router.post('/',authenticate,productController.createProduct);

router.put('/:productId', authenticate, upload.single('image'), async (req, res) => {
  try {
      const productId = req.params.productId;
      const { name, description, price } = req.body;

      // Nếu có file ảnh mới thì cập nhật đường dẫn, nếu không giữ nguyên
      let imageUrl = req.body.image_urls; 
      if (req.file) {
          imageUrl = `/uploads/${req.file.filename}`;
      }

      // Cập nhật sản phẩm
      const updatedProduct = {
          name,
          description,
          price: parseFloat(price),
          image_urls: imageUrl,
      };
      console.log(req.body)
      await productModel.update(productId, updatedProduct);

      res.json({ success: true, message: 'Product updated successfully!' });
  } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

router.get('/category/:categoryId', productController.getProductsByCategory);

router.get('/count/:id',authenticate, productController.getNumberProductByUser);

router.post('/:id',authenticate, productController.deleteProductByUserId);

module.exports = router;