# MVD Photo Picker Suite - Deployment Guide (DevOps)

Tài liệu hướng dẫn triển khai bộ giải pháp **MVD Photo Picker Suite** (Web Showcase, Admin Dashboard, Backend API) cho đội ngũ DevOps.

---

## 📦 Kiến trúc các thành phần

| Dịch vụ | Thư mục | Công nghệ | Cổng Container | Cổng Host mặc định |
| :--- | :--- | :--- | :--- | :--- |
| **Backend API** | `./backend` | NestJS, Prisma ORM, MongoDB | `3000` | `3000` |
| **Admin Dashboard** | `./admin` | Next.js Static Export, Nginx Alpine | `80` | `3001` |
| **Trang Web Giới Thiệu** | `./web` | React + Vite, Nginx Alpine | `80` | `8080` |

---

## 🔌 Danh mục các API Bên Thứ 3 (Third-Party Services)

Trong file `.env`, hệ thống tích hợp sẵn các dịch vụ sau:

1. **MongoDB Atlas (Database chính):**
   - Biến môi trường: `DATABASE_URL`
   - Đã cấu hình `binaryTargets` trong Prisma hỗ trợ cả Alpine và Debian (`linux-musl-openssl-3.0.x`, `debian-openssl-3.0.x`), **chạy mượt mà trong Docker mà không gặp lỗi Query Engine**.

2. **Cloudinary (CDN lưu trữ ảnh):**
   - Biến môi trường: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - Dùng để lưu trữ và phân phối ảnh showcase, album mẫu, ảnh benchmark độ phân giải cao.

3. **Cổng thanh toán SePay & VietQR:**
   - Biến môi trường: `SEPAY_WEBHOOK_API_KEY`, `BANK_BIN`, `BANK_ACCOUNT_NO`, `BANK_ACCOUNT_NAME`
   - Nhận Webhook chuyển khoản ngân hàng tự động từ SePay để kích hoạt License Key cho khách hàng.

4. **Dịch vụ gửi Email (OTP & cấp License):**
   - Biến môi trường: `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` (hoặc `RESEND_API_KEY` / `BREVO_API_KEY`)
   - Dùng để gửi mã OTP khi đăng nhập/đăng ký và gửi mã kích hoạt bản quyền về email người dùng.

5. **JWT Secret:**
   - Biến môi trường: `JWT_SECRET`
   - Mã hóa token phiên đăng nhập của Admin và Client Desktop App.

---

## 🚀 Hướng dẫn triển khai nhanh trên Server

### Bước 1: Chuẩn bị file môi trường
```bash
cd mvd-ecosystem
cp .env.example .env
# Kiểm tra và điều chỉnh các giá trị trong .env (domain thật, email, keys...)
nano .env
```

### Bước 2: Khởi chạy cụm Docker Compose
```bash
docker compose up -d --build
```

Kiểm tra trạng thái các container:
```bash
docker compose ps
docker compose logs -f backend
```

---

## 🌐 Cấu hình Nginx Reverse Proxy & Domain trên Server

Cấu hình reverse proxy trên máy chủ để trỏ tên miền vào các port tương ứng:

```nginx
# 1. Backend API (ví dụ: api.mvdstudio.vn)
server {
    server_name api.mvdstudio.vn;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 2. Admin Dashboard (ví dụ: admin.mvdstudio.vn)
server {
    server_name admin.mvdstudio.vn;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 3. Web Giới Thiệu (ví dụ: mvdstudio.vn)
server {
    server_name mvdstudio.vn;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Cấp chứng chỉ SSL bằng Certbot:
```bash
certbot --nginx -d api.mvdstudio.vn -d admin.mvdstudio.vn -d mvdstudio.vn
```
