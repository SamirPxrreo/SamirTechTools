const path = require('path');

function sanitizePath(p) {
  if (typeof p !== 'string') return '';
  const normalized = path.normalize(p).trim();
  if (normalized.includes('..') || /[<>:"|?*\x00-\x1F]/.test(path.basename(normalized))) return '';
  return normalized;
}
function isValidWingetId(id) {
  if (typeof id !== 'string') return false;
  return /^[a-zA-Z0-9._-]{1,80}(\.[a-zA-Z0-9._-]{1,80})?$/.test(id) || /^msstore:[a-zA-Z0-9]+$/.test(id) || /^winget:[a-zA-Z0-9._-]+$/.test(id);
}
function isValidUrl(u) {
  try { const url = new URL(u); return ['https:', 'http:'].includes(url.protocol); } catch { return false; }
}

module.exports = { sanitizePath, isValidWingetId, isValidUrl };
