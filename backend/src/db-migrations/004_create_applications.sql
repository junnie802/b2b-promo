CREATE TABLE applications (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    promotion_id INTEGER NOT NULL REFERENCES promotions(id),
    buyer_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(10) NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'cancelled')),
    prize_id INTEGER REFERENCES prizes(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (promotion_id, buyer_id)
);
