# MVD Photo Picker Suite - Deployment Guide (DevOps)

Tài liệu hướng dẫn triển khai bộ giải pháp **MVD Photo Picker Suite** (Web, Admin, Backend API) cho đội ngũ DevOps.

---

## 📦 Kiến trúc các thành phần

| Dịch vụ | Thư mục | Công nghệ | Cổng Container | Cổng Host mặc định |
| :--- | :--- | :--- | :--- | :--- |
| **Backend API** | `./backend` | NestJS, Prisma ORM, MongoDB | `3000` | `3000` |
| **Admin Dashboard** | `./admin` | Next.js Static Export, Nginx Alpine | `80` | `3001` |
| **Trang Web Giới Thiệu** | `./web` | React + Vite, Nginx Alpine | `80` | `8080` |

---

## 🗄️ Cấu hình MongoDB Atlas (Đã kiểm tra tương thích 100%)

Prisma Client trong Backend đã được build sẵn với `binaryTargets`:
```prisma
binaryTargets = ["native", "rhel-openssl-3.0.x", "linux-musl-openssl-3.0.x", "debian-openssl-3.0.x"]
```
Đảm bảo kết nối tới **MongoDB Atlas** mượt mà trên môi trường Docker Alpine mà không bị lỗi thiếu engine.

Chuỗi kết nối trong file `.env`:
```env
DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/photodb?retryWrites=true&w=majority
```

---

## 🚀 Hướng dẫn triển khai nhanh trên Server

### Bước 1: Chuẩn bị file môi trường
```bash
cd mvd-ecosystem
cp .env.example .env
# Chỉnh sửa .env với domain thật, DATABASE_URL MongoDB Atlas, JWT_SECRET, Cloudinary
nano .env
```

### Bước 2: Khởi chạy Docker Compose
```bash
docker compose up -d --build
```

Kiểm tra trạng thái container và logs:
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
