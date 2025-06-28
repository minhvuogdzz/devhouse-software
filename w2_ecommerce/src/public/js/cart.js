// Cập nhật subtotal cho từng sản phẩm
function updateSubtotal(selectElement, price, itemId) {
    let quantity = parseInt(selectElement.value);
    let subtotalCell = selectElement.closest("tr").querySelector(".subtotal");
    let newSubtotal = quantity * price;
    subtotalCell.innerText = `$${newSubtotal.toFixed(2)}`;
    updateTotal();

    // Cập nhật số lượng lên server
    fetch(`/cart/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity })
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(err => console.error(err));
}
function validateAmount(productId, stock) {
    const input = document.getElementById(`amount-${productId}`);
    let value = input.value.trim();


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
// Xóa sản phẩm khỏi giỏ hàng
async function removeItem(itemId) {
    // Cảnh báo người dùng trước khi xóa
    try {
        console.log(itemId);

        // Gửi yêu cầu xóa sản phẩm đến server
        const response = await fetch('api/cart/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId: itemId })
        });

        // Kiểm tra trạng thái HTTP trả về từ server
        if (!response.ok) {
            throw new Error(`Lỗi HTTP: ${response.status}`);
        }

        // Xóa sản phẩm khỏi DOM
        const productRow = document.getElementById(`item-${itemId}`);
        if (productRow) {
            productRow.remove();
        }

        // Cập nhật lại tổng tiền
        updateTotal();

        // Hiển thị thông báo thành công
        showToast("✅ Xóa sản phẩm thành công!", true);
        setTimeout(() => location.reload(), 2000);
    } catch (err) {
        console.error("Lỗi:", err);

        // Hiển thị thông báo lỗi nếu có vấn đề xảy ra
        showToast("❌ Xóa sản phẩm thất bại!", false);
        setTimeout(() => location.reload(), 2000);
    }

}
// Cập nhật tổng tiền khi thay đổi số lượng
function updateTotal() {
    let total = 0;
    document.querySelectorAll(".subtotal").forEach(cell => {
        total += parseFloat(cell.innerText.replace("$", "")) || 0;
    });
    document.getElementById("total").innerText = `$${total.toFixed(2)}`;
    document.getElementById("grand-total").innerText = `$${total.toFixed(2)}`;
}

setTimeout(() => {
    let errorToast = document.getElementById("errorToast");
    if (errorToast) {
        errorToast.classList.remove("show");  // Bootstrap sẽ ẩn alert
        errorToast.classList.add("fade"); // Thêm hiệu ứng mờ dần
        setTimeout(() => errorToast.remove(), 500); // Xóa khỏi DOM sau 0.5s
    }
}, 1000); // Tự động tắt sau 1 giây