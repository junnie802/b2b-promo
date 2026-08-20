-- 초기 관리자 계정 시드 (FR-1.0). 최초 비밀번호는 'ChangeMe123!', 로그인 후 마이페이지에서 변경 권장.
INSERT INTO users (email, password_hash, role, name, company_name)
VALUES (
    'admin@b2b-promo.local',
    '$2b$10$uwq6ON.76Dkxu8pZq9caPuQ0HOIe5dFKzvqagIWeeTEUBdzeIOzN6',
    'admin',
    '관리자',
    'b2b-promo'
)
ON CONFLICT (email) DO NOTHING;
