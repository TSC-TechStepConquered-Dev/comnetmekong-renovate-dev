import { ENV } from '@/config/env'

const BASE_URL = ENV.WIX_BASE_URL

/**
 * Generic Wix content fetcher
 * ลดโค้ดซ้ำของ fetch + error handling + data extraction ที่เหมือนกันทุก View
 */
export class WixContentRepository {
  /**
   * Fetch items from a Wix endpoint
   * @param {string} endpoint - API endpoint path (e.g. '/donors', '/staff')
   * @param {Object} [options]
   * @param {string} [options.method='GET'] - HTTP method
   * @param {Object} [options.body] - Request body for POST
   * @returns {Promise<Array>} Array of raw items from the API
   */
  async fetchItems(endpoint, options = {}) {
    try {
      const fetchOptions = {
        method: options.method || 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
      if (options.body) {
        fetchOptions.body = JSON.stringify(options.body)
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, fetchOptions).catch(() => null)
      if (!response || !response.ok) return []

      const result = await response.json()
      const items = result.items || result.data || result

      return Array.isArray(items) ? items : []
    } catch {
      return []
    }
  }

  /**
   * Fetch a single data object from a Wix endpoint
   * @param {string} endpoint - API endpoint path
   * @returns {Promise<Object|null>} Data object or null
   */
  async fetchSingle(endpoint) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`).catch(() => null)
      if (!response || !response.ok) return null

      const result = await response.json()
      return result.data || result.item || result
    } catch {
      return null
    }
  }

  /**
   * Submit data via POST
   * @param {string} endpoint - API endpoint path
   * @param {Object} data - Data to submit
   * @returns {Promise<{ok: boolean, data?: Object, error?: string}>}
   */
  async submit(endpoint, data) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        return { ok: true, data: result }
      }

      const errorData = await response.json().catch(() => ({}))
      return { ok: false, error: errorData.message || `HTTP ${response.status}` }
    } catch {
      return { ok: false, error: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' }
    }
  }
}
