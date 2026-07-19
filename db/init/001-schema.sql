-- Runs automatically the first time the MySQL container starts with an
-- empty data directory (see docker-compose.yml). This is the same schema
-- that was created by hand in Hostinger's phpMyAdmin - kept in sync
-- manually, since there's no `prisma migrate` history to generate it from
-- (see prisma/schema.prisma's header comment for why).

CREATE TABLE trips (
  id VARCHAR(30) PRIMARY KEY,
  trip_name VARCHAR(255) NOT NULL,
  trip_date_from DATE NOT NULL,
  trip_date_to DATE NOT NULL,
  huf_to_gbp DECIMAL(10,6) NOT NULL,
  eur_to_gbp DECIMAL(10,6) NOT NULL,
  scenarios JSON NOT NULL,
  package_sale_price_gbp DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE line_items (
  id VARCHAR(30) PRIMARY KEY,
  trip_id VARCHAR(30) NOT NULL,
  category ENUM('accommodation','transportation','program') NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency ENUM('GBP','EUR','HUF') NOT NULL,
  pricing_type ENUM('group','perPerson') NULL,
  units INT NULL,
  nights INT NULL,
  CONSTRAINT fk_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE users (
  id VARCHAR(30) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
