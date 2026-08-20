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
