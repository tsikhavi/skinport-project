CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES products(id),
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (name, price) VALUES
  ('Product 1', 19.99),
  ('Product 2', 49.99),
  ('Product 3', 99.99);

INSERT INTO users (balance) VALUES (1000.00);