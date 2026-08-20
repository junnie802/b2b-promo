-- b2b-promo 데이터베이스 스키마 (PostgreSQL 17), docs/8-erd.md 기반
-- 실행 순서: users → promotions → prizes → applications → refresh_tokens

CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'buyer')),
    name VARCHAR(100) NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE promotions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type VARCHAR(10) NOT NULL CHECK (type IN ('discount', 'gift', 'tasting')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(10) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended')),
    has_game BOOLEAN NOT NULL DEFAULT false,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE prizes (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    promotion_id INTEGER NOT NULL REFERENCES promotions(id),
    name VARCHAR(200) NOT NULL
);

CREATE TABLE applications (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    promotion_id INTEGER NOT NULL REFERENCES promotions(id),
    buyer_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(10) NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'cancelled')),
    prize_id INTEGER REFERENCES prizes(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (promotion_id, buyer_id)
);

CREATE TABLE refresh_tokens (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(512) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
