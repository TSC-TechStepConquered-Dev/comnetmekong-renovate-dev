const BASE_URL = import.meta.env.VITE_WIX_BASE_URL || 'https://www.comnetmekong.org/_functions'

export class WixAuthRepository {
  // ... (keep login and register as is)
  async login(username, password) {
      let response;
      try {
        response = await fetch(`${BASE_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
      } catch (err) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (CORS หรือ Network Error)')
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'เข้าสู่ระบบไม่สำเร็จ')
      }

      const result = await response.json()
      if (result.status !== 'success') throw new Error(result.message)
      
      const userData = result.data || result.user || result.item || result;

      return {
        userId: userData.userId || userData.id || userData._id,
        username: userData.username || username,
        displayName: userData.displayName || userData.name || userData.username || username,
        token: userData.token || result.token
      }
  }

  async register(username, password, displayName) {
      let response;
      try {
        response = await fetch(`${BASE_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password, displayName })
        });
      } catch (err) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (CORS หรือ Network Error)')
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'สมัครสมาชิกไม่สำเร็จ')
      }

      const result = await response.json()
      if (result.status !== 'success') throw new Error(result.message)

      const userData = result.data || result.user || result.item || result;

      return {
        userId: userData.userId || userData.id || userData._id,
        username: userData.username || username,
        displayName: userData.displayName || userData.name || displayName || username,
        token: userData.token || result.token
      }
  }

  async logout() {
    return new Promise(resolve => setTimeout(resolve, 500))
  }

  async loginWithGoogle(googleToken) {
    try {
      // Endpoint ปลายทาง
      const GOOGLE_LOGIN_ENDPOINT = `${BASE_URL}/googleLogin` 

      // ส่ง accessToken ไปให้ Velo (http-functions.js) ที่ทำระบบรองรับไว้แล้ว
      const payload = { 
        accessToken: googleToken
      }

      const response = await fetch(GOOGLE_LOGIN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => null)

      if (!response) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (อาจติด CORS หรือ URL ผิด)')
      }

      const responseText = await response.text()
      let result;
      try {
        result = JSON.parse(responseText)
      } catch (e) {
        throw new Error(`เซิร์ฟเวอร์ตอบกลับผิดพลาด: ${response.status} - ${responseText.substring(0, 100)}`)
      }

      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || result.error || `HTTP Error ${response.status}`)
      }

      const userData = result.data || result.user || result.item || result;

      return {
        userId: userData.userId || userData.id || userData._id,
        username: userData.username || userData.email,
        displayName: userData.displayName || userData.name,
        token: userData.token || result.token || googleToken
      }
    } catch (error) {
      throw error
    }
  }
}
