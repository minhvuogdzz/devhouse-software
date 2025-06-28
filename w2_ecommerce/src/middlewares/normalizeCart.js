function normalizeCartItems(cartItems) {
  // Kiểm tra nếu cartItems chỉ chứa một sản phẩm
  const isSingleProduct = cartItems[0] && !Array.isArray(cartItems[0].name);

  if (isSingleProduct) {
    // Nếu chỉ có một sản phẩm, chuyển các thuộc tính thành mảng
    cartItems[0].name = [cartItems[0].name];
    cartItems[0].quantity = [cartItems[0].quantity];
    cartItems[0].price = [cartItems[0].price];
    cartItems[0].productId = [cartItems[0].productId];
  }

  // Tiến hành xử lý các sản phẩm như bình thường, luôn giả định mỗi thuộc tính là mảng
  return cartItems[0].name.map((name, index) => ({
    name: name,
    quantity: cartItems[0].quantity[index],
    price: cartItems[0].price[index],
    productId: cartItems[0].productId[index]
  }));
}

module.exports = normalizeCartItems;
