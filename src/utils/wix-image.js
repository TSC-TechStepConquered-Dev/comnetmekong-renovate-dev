/**
 * Convert wix:image:// protocol URL to standard https URL
 * @param {string} wixUrl - Wix image URL or standard URL
 * @param {boolean} [wrapBare=false] - If true, wrap unknown strings in wixstatic URL
 * @returns {string} Standard https URL or empty string
 */
export function convertWixImageUrl(wixUrl, wrapBare = false) {
  if (!wixUrl) return ''
  if (typeof wixUrl !== 'string') return ''
  if (wixUrl.startsWith('http')) return wixUrl
  if (wixUrl.startsWith('wix:image://v1/')) {
    const parts = wixUrl.split('/')
    if (parts.length >= 4) {
      return `https://static.wixstatic.com/media/${parts[3]}`
    }
  }
  if (wrapBare) {
    return `https://static.wixstatic.com/media/${wixUrl}`
  }
  return wixUrl
}
