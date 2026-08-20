import { useEffect, useState } from 'react';

function RouletteModal({ prizeName, skipAnimation = false, onClose }) {
  const [phase, setPhase] = useState(skipAnimation ? 'result' : 'spinning');

  useEffect(() => {
    if (phase !== 'spinning') return undefined;
    const timer = setTimeout(() => setPhase('result'), 1600);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="roulette-overlay">
      <div className="roulette-modal">
        <div className="roulette-modal-header">
          <h2>경품 추첨</h2>
          <button type="button" onClick={onClose} aria-label="닫기">
            [X]
          </button>
        </div>

        {phase === 'spinning' && (
          <div className="roulette-spinning">
            <div className="roulette-wheel spinning">🎡</div>
            <p>(애니메이션 재생 중...)</p>
          </div>
        )}

        {phase === 'result' && (
          <div className="roulette-result">
            <p>🎉 축하합니다!</p>
            <p>당첨 경품: {prizeName}</p>
            <button type="button" className="btn-primary" onClick={onClose}>
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RouletteModal;
