-- schema.sql

DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS bespoke_requests;
DROP TABLE IF EXISTS client_diaries;
DROP TABLE IF EXISTS settings;

CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'clothing' or 'jewelry'
    image TEXT,
    tagline TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL, -- 'clothing' or 'jewelry'
    imageSrc TEXT,
    images TEXT, -- JSON array of strings
    price TEXT,
    description TEXT,
    isStarred BOOLEAN DEFAULT 0,
    starredAt INTEGER, -- timestamp
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user', -- 'user' or 'admin'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bespoke_requests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE client_diaries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO settings (key, value) VALUES (
    'global',
    '{"domain":"https://raani.pages.dev","seoTitle":"Raani Closet | Bespoke Vintage Elegance & High Jewels","seoDescription":"Raani Closet is an ultra-luxury bespoke boutique offering handcrafted vintage suits, haute couture, and exquisite high jewelry.","clothingLogo":"/raani-logo-new.png","jewelryLogo":"/raani-logo-new.png","clothingCategoryHeading":"Couture Collections","jewelryCategoryHeading":"Fine Jewelry Collections","clothingSubtext":"Bespoke Vintage Elegance","jewelrySubtext":"High Jewels & Heirlooms","clothingVideo":"","jewelryVideo":"","clothingCategories":[],"jewelryCategories":[],"products":[],"clientDiariesClothing":[],"clientDiariesJewelry":[]}'
);

