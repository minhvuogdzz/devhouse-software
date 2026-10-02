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
function validateAmount(productId, stock) {
    const input = document.getElementById(`amount-${productId}`);
    let value = input.value.trim(); // Loại bỏ khoảng trắng


    if (!/^\d+$/.test(value)) {
        showToast("Please enter a positive integer!", false);
    }
    else if (parseInt(value, 10) > stock) {
        input.value = stock;
        showToast(`Quantity cannot exceed${stock}!`, false);
    }
    else if (parseInt(value, 10) < 1) {
        input.value = 1;
        showToast("Value must be at least 1.", false);
    }
}
// Hàm xóa sản phẩm khỏi wishlist
async function removeWishlist(productId) {
    try {
        const response = await fetch('/api/whistlist/remove', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
        });

        const data = await response.json();

        if (response.ok && data.msg) {
            showToast(data.msg, true); // Hiển thị thông báo thành công
            setTimeout(() => location.reload(), 2000); // Reload sau 2s
        } else {
            showToast(data.msg || 'Failed to remove from wishlist.', false);
        }
    } catch (err) {
        showToast('An error occurred. Please try again.', false);
        console.error(err);
    }
}

// Hàm thêm sản phẩm vào giỏ hàng
async function addToCart(productId, amount) {
    const quantity = parseInt(amount, 10);
    console.log(amount)
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

            // Gọi hàm removeWishlist sau khi thêm vào giỏ hàng thành công
            await removeWishlist(productId);

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

setTimeout(() => {
    let errorToast = document.getElementById("errorToast");
    if (errorToast) {
        errorToast.classList.remove("show");  // Bootstrap sẽ ẩn alert
        errorToast.classList.add("fade"); // Thêm hiệu ứng mờ dần
        setTimeout(() => errorToast.remove(), 500); // Xóa khỏi DOM sau 0.5s
    }
}, 1000); // Tự động tắt sau 1 giây