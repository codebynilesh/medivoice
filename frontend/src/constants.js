export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
];

export function statusTone(status) {
  switch (status) {
    case 'APPROVED':
      return 'ok';
    case 'REJECTED':
      return 'bad';
    case 'REVIEW_REQUIRED':
      return 'warn';
    default:
      return 'neutral';
  }
}
