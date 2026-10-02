
const passwordInput = document.getElementById("password");
const seg1 = document.getElementById("seg1");
const seg2 = document.getElementById("seg2");
const seg3 = document.getElementById("seg3");
const strengthText = document.getElementById("password-strength-text");

// Các điều kiện bên phải
const lenCond = document.getElementById("len");
const upperCond = document.getElementById("upper");
const numCond = document.getElementById("num");

passwordInput.addEventListener("input", () => {
    const val = passwordInput.value;
    let strength = 0;

    const hasLength = val.length >= 8;
    const hasUpper = /[A-Z]/.test(val);
    const hasNumOrSpecial = /[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val);

    if (hasLength) strength++;
    if (hasUpper) strength++;
    if (hasNumOrSpecial) strength++;

    // Reset segments
    [seg1, seg2, seg3].forEach(seg => seg.className = "segment");
    strengthText.textContent = "";
    strengthText.className = "";

    if (val.length === 0) {
        [lenCond, upperCond, numCond].forEach(e => e.classList.remove("active"));
        return;
    }

    // Update progress bar
    if (strength === 1) {
        seg1.classList.add("active", "weak");
        strengthText.textContent = "weak";
        strengthText.classList.add("weak");
    } else if (strength === 2) {
        seg1.classList.add("active", "medium");
        seg2.classList.add("active", "medium");
        strengthText.textContent = "medium";
        strengthText.classList.add("medium");
    } else if (strength === 3) {
        seg1.classList.add("active", "strong");
        seg2.classList.add("active", "strong");
        seg3.classList.add("active", "strong");
        strengthText.textContent = "strong";
        strengthText.classList.add("strong");
    }

    // Update conditions
    lenCond.classList.toggle("active", hasLength);
    upperCond.classList.toggle("active", hasUpper);
    numCond.classList.toggle("active", hasNumOrSpecial);
});

