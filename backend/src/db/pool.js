const { Pool, types } = require('pg');

// DATE 타입(OID 1082)을 JS Date로 파싱하면 로컬 타임존 기준으로 변환되어
// UTC 직렬화 시 날짜가 하루 밀리는 문제가 생긴다. DB가 반환한 'YYYY-MM-DD' 문자열을 그대로 사용한다.
types.setTypeParser(1082, (value) => value);

const pool = new Pool({ connectionString: process.env.DB_CONN_STRING });

// 유휴 커넥션이 끊기는 등의 에러는 pool 레벨 'error' 이벤트로 전달되는데,
// 리스너가 없으면 Node가 이를 unhandled exception으로 취급해 프로세스 전체가 죽는다.
pool.on('error', (err) => {
  console.error('Unexpected idle client error', err);
});

module.exports = pool;
