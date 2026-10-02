document.getElementById('edit-products-btn').addEventListener('click', function () {
  window.location.href = 'store/editproducts';
});
// Nếu có nhiều icon
document.querySelectorAll('.icon-circle').forEach(icon => {
  icon.addEventListener('click', function () {
    this.classList.toggle('clicked');
  });
});
function viewProduct(productId) {
  window.location.href = `/product/${productId}`;
}
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
function showToast(message, isSuccess = true) {
  const toastElement = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  const bsToast = new bootstrap.Toast(toastElement);

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
  bsToast.show(); // Hiển thị toast
}
