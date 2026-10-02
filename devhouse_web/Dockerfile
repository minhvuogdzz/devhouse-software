FROM node:20-alpine
# Cài bash (tùy chọn), cần thiết cho một số dev tool
RUN apk add --no-cache bash
# Tạo thư mục làm việc
WORKDIR /app
# Copy mã nguồn vào container
COPY . .
# Cài dependencies
RUN yarn install
# Mở cổng cho Vite
EXPOSE 5173
# Chạy Vite dev server
CMD ["yarn", "dev"]