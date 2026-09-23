/**
 * Centralized environment configuration
 * ไฟล์นี้เป็นจุดเดียวที่อ่านค่า environment variables
 * ทุกไฟล์ควร import จากที่นี่แทนการอ่าน import.meta.env โดยตรง
 */

function requireEnv(key) {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(
      `❌ Missing environment variable: ${key}\n` +
      `กรุณาสร้างไฟล์ .env และกำหนดค่า ${key}\n` +
      `ดูตัวอย่างได้ที่ .env.example`
    )
  }
  return value
}

export const ENV = {
  /** Wix Backend API Base URL */
  WIX_BASE_URL: requireEnv('VITE_WIX_BASE_URL'),

  /** Google OAuth Client ID */
  GOOGLE_CLIENT_ID: requireEnv('VITE_GOOGLE_CLIENT_ID'),

  /** Wix Client ID */
  WIX_CLIENT_ID: requireEnv('VITE_WIX_CLIENT_ID'),
}
