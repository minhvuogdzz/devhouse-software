
// Hàm cancelOrder gọi API để xóa đơn hàng
// Hàm cancelOrder gọi API để xóa đơn hàng
async function cancelOrder(orderId) {
  try {
      const response = await fetch(`/api/order/${orderId}`, {
          method: 'DELETE',  // Gửi yêu cầu DELETE đến API
          headers: {
              'Content-Type': 'application/json',
              // Thêm authorization token nếu cần
          },
      });

      const data = await response.json();

      if (response.ok && data.success) {
          showToast('Order canceled successfully!', true);  // Thay alert bằng showToast
          setTimeout(() => location.reload(), 2000); // Reload sau 2s
        } else {
          showToast('Failed to cancel order: ' + (data.message || 'Please try again.'), false);
          setTimeout(() => location.reload(), 2000); // Reload sau 2s
      }
  } catch (error) {
      console.error('Error canceling order:', error);
      showToast('An error occurred while canceling the order. Please try again.', false);
      setTimeout(() => location.reload(), 2000); // Reload sau 2s

  }
}

// Hàm hiển thị thông báo Toast
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
setTimeout(() => {
  let errorToast = document.getElementById("errorToast");
  if (errorToast) {
      errorToast.classList.remove("show");  // Bootstrap sẽ ẩn alert
      errorToast.classList.add("fade"); // Thêm hiệu ứng mờ dần
      setTimeout(() => errorToast.remove(), 500); // Xóa khỏi DOM sau 0.5s
  }
}, 1000); // Tự động tắt sau 1 giây