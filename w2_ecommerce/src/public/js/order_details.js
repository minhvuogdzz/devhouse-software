function viewProduct(productId) {
  window.location.href = `/product/${productId}`;
} 

function getFormData(form) {
  const stars = form.querySelectorAll(".star");
  const ratingInput = form.querySelector("input[name='rating']");
  const commentInput = form.querySelector("textarea[name='comment']");
  const productId = form.dataset.productId;
  const rating = parseInt(ratingInput.value);
  const comment = commentInput.value;

  const formData = {
    product_id: productId,
    rating: rating,
    comment: comment
  };

  console.log(formData);

  return formData;
}

async function handleReviewSubmit(form) {
  const data = getFormData(form); 

  try {
    const res = await fetch("/api/reviews/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data) 
    });

    if (res.ok) {
      showToast("Review added successfully!", true);
      setTimeout(() => location.reload(), 2000);
    } else {
      const errorData = await res.json();
      showToast("Failed to submit review", false);
    }
  } catch (err) {
    console.error("Error while submitting review:", err);
    showToast("Error while submitting review", false);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll(".reviewForm");

  forms.forEach((form) => {
    const stars = form.querySelectorAll(".star");
    const ratingInput = form.querySelector("input[name='rating']");

    stars.forEach(star => {
      star.addEventListener("click", () => {
        const value = parseInt(star.dataset.value);
        ratingInput.value = value;

        stars.forEach((s, index) => {
          s.style.color = (index < value) ? "gold" : "gray";
        });
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleReviewSubmit(form);
    });
  });
});

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