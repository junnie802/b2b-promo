import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  usePromotionDetailQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
} from '../../../hooks/usePromotions';
import { getPromotionFormErrors } from '../../../utils/promotionFormValidation';

const TYPE_OPTIONS = [
  { value: 'discount', label: '가격할인' },
  { value: 'gift', label: '사은품증정' },
  { value: 'tasting', label: '신제품시식' },
];

function PromotionFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const detailQuery = usePromotionDetailQuery(id);
  const createMutation = useCreatePromotionMutation();
  const updateMutation = useUpdatePromotionMutation();
  const activeMutation = isEditMode ? updateMutation : createMutation;

  const [type, setType] = useState('discount');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hasGame, setHasGame] = useState(false);
  const [prizeNames, setPrizeNames] = useState(['']);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isEditMode || !detailQuery.data) return;
    const p = detailQuery.data;
    setType(p.type);
    setTitle(p.title);
    setDescription(p.description || '');
    setStartDate(p.start_date);
    setEndDate(p.end_date);
    setHasGame(p.has_game);
    if (p.prizes && p.prizes.length > 0) {
      setPrizeNames(p.prizes.map((prize) => prize.name));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailQuery.data]);

  if (isEditMode && detailQuery.isLoading) {
    return <p className="list-status-message">불러오는 중입니다...</p>;
  }
  if (isEditMode && detailQuery.isError) {
    return <p className="list-status-message">정보를 불러오지 못했습니다</p>;
  }

  const handleAddPrize = () => setPrizeNames((prev) => [...prev, '']);
  const handleRemovePrize = (index) =>
    setPrizeNames((prev) => prev.filter((_, i) => i !== index));
  const handlePrizeChange = (index, value) =>
    setPrizeNames((prev) => prev.map((name, i) => (i === index ? value : name)));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = getPromotionFormErrors({ type, title, start_date: startDate, end_date: endDate });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = { type, title, description, start_date: startDate, end_date: endDate };
    if (!isEditMode) {
      payload.has_game = hasGame;
    }
    if (hasGame) {
      payload.prizes = prizeNames.filter((name) => name.trim()).map((name) => ({ name }));
    }

    if (isEditMode) {
      updateMutation.mutate(
        { id, payload },
        { onSuccess: () => navigate('/admin/promotions') }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => navigate('/admin/promotions') });
    }
  };

  const serverErrorMessage = activeMutation.isError
    ? activeMutation.error?.response?.data?.error || '저장에 실패했습니다'
    : null;

  return (
    <div className="promotion-list-page">
      <Link to="/admin/promotions">← 목록으로</Link>
      <h1>{isEditMode ? '프로모션 수정' : '프로모션 등록'}</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label>유형</label>
          <div className="radio-group">
            {TYPE_OPTIONS.map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  checked={type === option.value}
                  onChange={(e) => setType(e.target.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
          {fieldErrors.type && <div className="field-error">{fieldErrors.type}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="title">제목</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          {fieldErrors.title && <div className="field-error">{fieldErrors.title}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="description">설명</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-field-row">
          <div className="form-field">
            <label htmlFor="start_date">시작일</label>
            <input
              id="start_date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            {fieldErrors.start_date && <div className="field-error">{fieldErrors.start_date}</div>}
          </div>
          <div className="form-field">
            <label htmlFor="end_date">종료일</label>
            <input
              id="end_date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            {fieldErrors.end_date && <div className="field-error">{fieldErrors.end_date}</div>}
          </div>
        </div>

        <div className="form-field">
          <label>
            <input
              type="checkbox"
              checked={hasGame}
              disabled={isEditMode}
              onChange={(e) => setHasGame(e.target.checked)}
            />
            게임 적용
          </label>
        </div>

        {hasGame && (
          <div className="prize-list-box">
            {prizeNames.map((name, index) => (
              <div className="prize-row" key={index}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handlePrizeChange(index, e.target.value)}
                  placeholder="경품명"
                />
                <button type="button" onClick={() => handleRemovePrize(index)}>
                  삭제
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddPrize}>
              + 경품 추가
            </button>
            <p className="field-error">※ 경품 1개 이상 등록해야 게시 가능(EX-3)</p>
          </div>
        )}

        {serverErrorMessage && <div className="apply-error-message">{serverErrorMessage}</div>}

        <div className="form-actions">
          <Link to="/admin/promotions" className="btn-secondary">
            취소
          </Link>
          <button type="submit" className="btn-primary" disabled={activeMutation.isPending}>
            저장
          </button>
        </div>
      </form>
    </div>
  );
}

export default PromotionFormPage;
