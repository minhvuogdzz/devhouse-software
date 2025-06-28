// Xử lý hiển thị form thêm sản phẩm
document.getElementById('add-product-btn').addEventListener('click', function (e) {
    e.preventDefault(); // Ngăn chuyển hướng mặc định
    const form = document.getElementById('add-product-form');
    const bsCollapse = new bootstrap.Collapse(form, { toggle: true });
});

// Xử lý chọn category cho form thêm sản phẩm
document.querySelectorAll('#add-product-form .category-btn').forEach(button => {
    button.addEventListener('click', function () {
        document.querySelectorAll('#add-product-form .category-btn').forEach(btn => btn.classList.remove('btn-primary'));
        this.classList.add('btn-primary');
    });
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




document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', function () {
        const productId = this.getAttribute('data-id');
        const form = document.getElementById(`edit-form-${productId}`);
        const bsCollapse = new bootstrap.Collapse(form, { toggle: true });
    });
});

// Xử lý chọn category
document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', function () {
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('btn-primary', 'btn-danger'));
        this.classList.add('btn-primary');
    });
});



async function RemoveProduct(productId) {
    try {
        // Gửi yêu cầu xóa sản phẩm theo productId

        const response = await fetch(`/api/products/${productId}`, {
            method: 'post', // Sử dụng phương thức DELETE
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        console.log(data);

        if (response.ok && data.success) {
            // Nếu xóa thành công, hiển thị thông báo thành công
            showToast(data.message || 'Product removed successfully!', true);

            // Reload trang sau 2s
            setTimeout(() => location.reload(), 2000);
        } else {
            // Nếu có lỗi, hiển thị thông báo thất bại
            showToast(data.message || 'Failed to remove product.', true);

            setTimeout(() => location.reload(), 2000);
        }
    } catch (err) {
        // Xử lý lỗi nếu có
        showToast('An error occurred. Please try again:', false);
        console.error(err);
    }
}
async function updateProduct(productId) {
    // Lấy các phần tử input/textarea cần thiết
    const nameEl = document.getElementById('edit-name-' + productId);
    const priceEl = document.getElementById('edit-price-' + productId);
    const descriptionEl = document.getElementById('edit-description-' + productId);
    const imageInput = document.getElementById('edit-image-' + productId);

    // Lấy giá trị hiện tại và giá trị ban đầu (data-original)
    const currentName = nameEl.value;
    const originalName = nameEl.dataset.original;

    const currentPrice = priceEl.value;
    const originalPrice = priceEl.dataset.original;

    const currentDescription = descriptionEl.value.trim();
    const originalDescription = descriptionEl.dataset.original.trim();

    // Kiểm tra nếu không có thay đổi và không chọn file ảnh mới
    if (
        currentName === originalName &&
        currentPrice === originalPrice &&
        currentDescription === originalDescription &&
        imageInput.files.length === 0
    ) {
        showToast('No changes detected with products!', false);
        return;
    }

    // Tạo FormData để gửi dữ liệu update
    const formData = new FormData();
    formData.append('name', currentName);
    formData.append('description', currentDescription);
    formData.append('price', currentPrice);

    // Nếu có file mới được chọn thì thêm vào formData
    if (imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
    }

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            body: formData,
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showToast(data.message || 'Product updated successfully!', true);
            setTimeout(() => location.reload(), 2000);
        } else {
            showToast(data.message || 'Failed to update product.', false);
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