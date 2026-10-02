// Xử lý sự kiện thêm vào wishlist
document.querySelectorAll('.add-to-wishlist').forEach(button => {
    button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        const icon = this.querySelector('i');
        
        // Thay đổi màu icon khi nhấn (từ trắng sang đỏ và ngược lại)
        icon.classList.toggle('text-danger');

        // Gọi hàm thêm vào wishlist
        addToWishlist(productId);
    });
});

// Hàm thêm sản phẩm vào wishlist
async function addToWishlist(productId) {
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

// Xử lý sự kiện thêm vào giỏ hàng
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        const icon = this.querySelector('i');
        
        // Thay đổi màu icon khi nhấn
        icon.classList.toggle('text-success');

        // Gọi hàm thêm vào giỏ hàng
        addToCart(productId);
    });
});



// Xử lý nút "Move All To Bag"
document.querySelector('.btn-outline-primary').addEventListener('click', function () {
    const productElements = document.querySelectorAll('.add-to-cart');

    productElements.forEach(button => {
        const productId = button.getAttribute('data-id');
        addToCart(productId);
        
        // Đổi màu icon để feedback UI
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.add('text-success');
        }
    });

    showToast("Tất cả sản phẩm đã được thêm vào giỏ hàng.", true);
});

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

// Hàm thêm sản phẩm vào giỏ hàng
async function addToCart(productId) {
    const quantity = 1;  // Mặc định quantity là 1

    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId,    // Truyền productId
                quantity      // Truyền quantity = 1 mặc định
            })
        });

        const data = await response.json();

        if (response.ok && data.msg) {
            showToast(data.msg, true);
        } else {
            showToast(data.msg || 'Thêm vào giỏ hàng thất bại.', false);
        }
    } catch (error) {
        console.error(error);
        showToast('Có lỗi xảy ra khi thêm vào giỏ hàng.', false);
    }
}


function viewProduct(productId) {
    window.location.href = `/product/${productId}`;
}