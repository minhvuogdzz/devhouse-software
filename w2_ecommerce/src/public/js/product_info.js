// Hàm hiển thị thông báo Toast
function showToast(message, isSuccess = true) {
  const toastElement = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  // Đổi màu dựa trên trạng thái thành công/thất bại
  if (isSuccess) {
    toastElement.classList.remove('text-bg-danger');
    toastElement.classList.add('text-bg-success');
  } else {
    toastElement.classList.remove('text-bg-success');
    toastElement.classList.add('text-bg-danger');
  }

  // Cập nhật thông báo
  toastMessage.textContent = message;
  // Khởi tạo Toast với tùy chọn tự động ẩn sau 2 giây (2000ms)
  const bsToast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: 2000
  });
  bsToast.show(); // Hiển thị toast
}
async function addToCart(productId, amount) {
  const quantity = parseInt(amount, 10);
  try {
    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    });

    const data = await response.json();
    console.log(data);

    if (response.ok && data.msg) {
      showToast(data.msg, true); // Hiển thị thông báo thành công
      // Reload sau 2s
      setTimeout(() => location.reload(), 2000);
    } else {
      showToast(data.msg || 'Failed to add to cart.', false);
    }
  } catch (err) {
    showToast('An error occurred. Please try again.', false);
    console.error(err);
  }
}
function checkStockLimit() {
  const quantityInput = document.getElementById('quantity');
  const addToCartBtn = document.getElementById('addToCartBtn');
  const stock = parseInt(quantityInput.getAttribute('data-stock'), 10);
  const currentQty = parseInt(quantityInput.value, 10);

  if (currentQty > stock) {
    addToCartBtn.disabled = true;
    addToCartBtn.textContent = `Only ${stock} left`;
    addToCartBtn.classList.add('btn-secondary');
    addToCartBtn.classList.remove('btn-danger');
  } else {
    addToCartBtn.disabled = false;
    addToCartBtn.textContent = 'Add To Cart';
    addToCartBtn.classList.add('btn-danger');
    addToCartBtn.classList.remove('btn-secondary');
  }
}

function increaseQuantity() {
  const quantityInput = document.getElementById('quantity');
  let quantity = parseInt(quantityInput.value, 10);
  quantityInput.value = quantity + 1;
  checkStockLimit();
}

function decreaseQuantity() {
  const quantityInput = document.getElementById('quantity');
  let quantity = parseInt(quantityInput.value, 10);
  if (quantity > 1) {
    quantityInput.value = quantity - 1;
    checkStockLimit();
  }
}

// Kiểm tra lần đầu khi trang load
document.addEventListener('DOMContentLoaded', () => {
  checkStockLimit();
  document.getElementById('quantity').addEventListener('input', checkStockLimit);
});
async function addWhistlist(productId) {

  try {
    const response = await fetch('/api/whistlist/add', { // Chú ý sửa đúng URL nếu cần
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }) // Truyền productId gọn
    });

    const data = await response.json();

    if (response.ok && data.msg) { // Kiểm tra OK và có message
      showToast(data.msg, true);
      setTimeout(() => location.reload(), 2000); // Reload sau 2s
    } else {
      showToast(data.msg || 'Failed to add to wishlist.', false);
    }
  } catch (err) { // Bắt lỗi chung cho các vấn đề khác
    showToast('An error occurred. Please try again.', false);
    console.error(err);
  }
}



setTimeout(() => {
  let errorToast = document.getElementById("errorToast");
  if (errorToast) {
    errorToast.classList.remove("show");  // Bootstrap sẽ ẩn alert
    errorToast.classList.add("fade"); // Thêm hiệu ứng mờ dần
    setTimeout(() => errorToast.remove(), 500); // Xóa khỏi DOM sau 0.5s
  }
}, 1000); // Tự động tắt sau 1 giây
function viewProduct(productId) {
  window.location.href = `/product/${productId}`;
}