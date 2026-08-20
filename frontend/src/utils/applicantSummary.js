export function summarizeApplicants(applicants) {
  const total = applicants.length;
  const applied = applicants.filter((a) => a.status === 'applied').length;
  const cancelled = applicants.filter((a) => a.status === 'cancelled').length;
  return { total, applied, cancelled };
}
