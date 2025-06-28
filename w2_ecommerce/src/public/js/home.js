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


function viewProduct(productId) {
    window.location.href = `/product/${productId}`;
}

//slide
document.addEventListener("DOMContentLoaded", function () {
    const slides = document.querySelector(".slides");
    const totalSlides = 3; // Số slide gốc (không tính bản sao)
    let index = 1; // Bắt đầu từ slide gốc đầu tiên (sau bản sao cuối)

    // Đặt vị trí ban đầu là slide đầu tiên (sau bản sao cuối)
    slides.style.transform = `translateX(-${index * 100}vw)`;

    function moveToNextSlide() {
        index++;
        slides.style.transition = "transform 0.5s ease-in-out";
        slides.style.transform = `translateX(-${index * 100}vw)`;

        // Khi đến bản sao đầu tiên (index = totalSlides + 1), reset về slide đầu tiên
        if (index === totalSlides + 1) {
            setTimeout(() => {
                slides.style.transition = "none"; // Tắt transition để reset mượt
                index = 1; // Quay về slide đầu tiên (sau bản sao cuối)
                slides.style.transform = `translateX(-${index * 100}vw)`;
            }, 500); // Đợi transition hoàn tất (0.5s)
        }
    }

    // Chuyển slide tự động mỗi 3 giây
    setInterval(moveToNextSlide, 3000);
});
setTimeout(() => {
    let errorToast = document.getElementById("errorToast");
    if (errorToast) {
        errorToast.classList.remove("show");  // Bootstrap sẽ ẩn alert
        errorToast.classList.add("fade"); // Thêm hiệu ứng mờ dần
        setTimeout(() => errorToast.remove(), 500); // Xóa khỏi DOM sau 0.5s
    }
}, 1000); // Tự động tắt sau 1 giây