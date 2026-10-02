CREATE DATABASE uet_store;
USE uet_store;

CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50)  NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);



CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image_urls TEXT, 
    category_id INT,
    seller_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'success') NOT NULL DEFAULT 'pending',
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    buyer_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE chatbot_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);


CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

--Chèn dữ liệu vào bảng users
INSERT INTO users (username, email, password, role, created_at, updated_at) VALUES
('admin', 'group11@gmail.com', 'admin', 'admin', '2025-03-05 12:44:00', '2025-03-05 12:44:00'),
('dodevice', 'dodevice@gmail.com', 'dodevice', 'user', '2025-03-05 12:44:00', '2025-03-05 12:44:00'),
('thanhlam', 'thanhlam@gmail.com', 'thanhlam', 'user', '2025-03-05 12:44:00', '2025-03-05 12:44:00'),
('thanhhung', 'thanhhung@gmail.com', 'thanhhung', 'user', '2025-03-05 12:44:00', '2025-03-05 12:44:00'),
('duonglong', 'duonglong@gmail.com', 'duonglong', 'user', '2025-03-05 12:44:00', '2025-03-05 12:44:00'),
('ngohieu', 'ngohieu@gmail.com', 'ngohieu', 'user', '2025-03-05 12:44:00', '2025-03-05 12:44:00');



-- Chèn dữ liệu vào bảng categories
INSERT INTO categories (name, description) VALUES
('Phones', 'Various smartphones and mobile devices.'),
('Computers', 'Desktops, laptops, and related accessories.'),
('SmartWatches', 'Smart wearable devices with multiple functionalities.'),
('Cameras', 'Digital cameras and photography equipment.'),
('Headphones', 'Audio devices including headphones and earphones.'),
('Gaming', 'Gaming consoles, accessories, and related products.');


-- Chèn dữ liệu vào bảng products
INSERT INTO products (name, description, price, stock, image_urls, category_id, seller_id, created_at, updated_at) VALUES
-- Phones
('iPhone 14 Pro Max', 'Apple iPhone 14 Pro Max với màn hình OLED 6.7 inch.', 1199.99, 50, 'https://example.com/iphone14.jpg', 1, 1, '2025-03-05 12:44:00', '2025-03-05 12:44:00'),
('Samsung Galaxy S23', 'Samsung Galaxy S23 với công nghệ màn hình Dynamic AMOLED.', 999.99, 40, 'https://example.com/galaxys23.jpg', 1, 2, '2025-03-05 12:44:00', '2025-03-05 12:44:00'),

-- Computers
('MacBook Pro 16', 'MacBook Pro 16 inch với chip M2 Pro.', 2499.99, 30, 'https://example.com/macbookpro.jpg', 2, 3, '2025-03-05 12:44:00', '2025-03-05 12:44:00'),
('Dell XPS 13', 'Dell XPS 13 với màn hình InfinityEdge.', 1299.99, 20, 'https://example.com/dellxps13.jpg', 2, 4, '2025-03-05 12:44:00', '2025-03-05 12:44:00'),

-- SmartWatches
('Apple Watch Series 8', 'Apple Watch với khả năng theo dõi sức khỏe.', 399.99, 70, 'https://example.com/applewatch8.jpg', 3, 5, '2025-03-05 12:44:00', '2025-03-05 12:44:00'),
('Samsung Galaxy Watch 5', 'Samsung Galaxy Watch 5 với khả năng chống nước.', 349.99, 60, 'https://example.com/galaxywatch5.jpg', 3, 6, '2025-03-05 12:44:00', '2025-03-05 12:44:00'),

-- Cameras
('Canon EOS R5', 'Máy ảnh Canon EOS R5 với độ phân giải 45MP.', 3899.99, 15, 'https://example.com/canoneosr5.jpg', 4, 1, '2025-03-05 12:44:00', '2025-03-05 12:44:00'),
('Sony Alpha a7 III', 'Máy ảnh không gương lật Sony Alpha a7 III.', 1999.99, 25, 'https://example.com/sonya7iii.jpg', 4, 2, '2025-03-05 12:44:00', '2025-03-05 12:44:00'),

-- Headphones
('Sony WH-1000XM5', 'Tai nghe chống ồn tốt nhất từ Sony.', 399.99, 80, 'https://example.com/sonywh1000xm5.jpg', 5, 3, '2025-03-05 12:44:00', '2025-03-05 12:44:00'),
('Bose QuietComfort 45', 'Tai nghe Bose với âm thanh chất lượng cao.', 329.99, 75, 'https://example.com/boseqc45.jpg', 5, 4, '2025-03-05 12:44:00', '2025-03-05 12:44:00'),

-- Gaming
('PlayStation 5', 'Máy chơi game PlayStation 5 của Sony.', 499.99, 100, 'https://example.com/ps5.jpg', 6, 5, '2025-03-05 12:44:00', '2025-03-05 12:44:00'),
('Xbox Series X', 'Máy chơi game Xbox Series X của Microsoft.', 499.99, 100, 'https://example.com/xboxseriesx.jpg', 6, 6, '2025-03-05 12:44:00', '2025-03-05 12:44:00');
