const validateUserProfile = (req, res, next) => {
  const { username, phone, address, city, postalCode } = req.body;
  let errors = [];



  // Kiểm tra số điện thoại (10-15 chữ số)
  if (!/^\d{10,15}$/.test(phone)) {
    errors.push("Phone number must be between 10 and 15 digits.");
  }

  // Kiểm tra địa chỉ, thành phố, mã bưu điện không rỗng
  if (!address.trim()) {
    errors.push("Address cannot be empty.");
  }

  if (!city.trim()) {
    errors.push("City cannot be empty.");
  }

  if (!postalCode.trim() || isNaN(postalCode)) {
    errors.push("Postal code must be numeric and cannot be empty.");
  }

  // Nếu có lỗi, trả về phản hồi JSON hoặc render trang với thông báo lỗi
  if (errors.length > 0) {
    res.locals.errorMessage = errors.join(" ");
    return res.render("userprofile", { user: req.body }); // Render lại trang với errorMessage
  }

  next(); // Nếu hợp lệ, tiếp tục xử lý request
};

module.exports = validateUserProfile;
