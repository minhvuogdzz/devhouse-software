# Sử dụng Node.js bản LTS làm base image
FROM node:20-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy package.json và package-lock.json (nếu có) trước để tối ưu cache layer
COPY package*.json ./

# Cài đặt các dependency
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Expose cổng ứng dụng (ví dụ app lắng nghe ở cổng 3000)
EXPOSE 5000

# Lệnh khởi chạy ứng dụng
CMD ["npm", "start"]
