import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { WixAuthRepository } from '../../infrastructure/repositories/wix-auth.repository'
import { LoginUseCase } from '../../core/usecases/auth/login.usecase'
import { RegisterUseCase } from '../../core/usecases/auth/register.usecase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))
  const token = ref(localStorage.getItem('auth_token') || null)
  
  const isAuthenticated = computed(() => !!token.value)
  const currentUserId = computed(() => user.value?.userId)

  const authRepo = new WixAuthRepository()
  const loginUseCase = new LoginUseCase(authRepo)
  const registerUseCase = new RegisterUseCase(authRepo)

  async function login(username, password) {
    try {
      const result = await loginUseCase.execute(username, password)
      user.value = {
        userId: result.userId,
        username: result.username,
        displayName: result.displayName
      }
      token.value = result.token
      
      localStorage.setItem('auth_user', JSON.stringify(user.value))
      localStorage.setItem('auth_token', token.value)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async function register(username, password, displayName) {
    try {
      await registerUseCase.execute(username, password, displayName)
      
      // เมื่อสมัครสำเร็จ ให้ล็อกอินอัตโนมัติด้วย username และ password ที่เพิ่งสมัคร
      const loginResult = await login(username, password)
      
      if (!loginResult.success) {
        throw new Error(loginResult.error || 'สมัครสมาชิกสำเร็จ แต่เข้าสู่ระบบอัตโนมัติล้มเหลว')
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async function loginWithGoogle(googleToken) {
    try {
      // Direct call to repository for simplicity, or we could create a UseCase
      const result = await authRepo.loginWithGoogle(googleToken)
      user.value = {
        userId: result.userId,
        username: result.username,
        displayName: result.displayName
      }
      token.value = result.token
      
      localStorage.setItem('auth_user', JSON.stringify(user.value))
      localStorage.setItem('auth_token', token.value)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
  }

  async function updateProfile(displayName, currentPassword, newPassword) {
    try {
      if (!token.value) throw new Error('กรุณาเข้าสู่ระบบก่อน')
      const updatedUser = await authRepo.updateProfile(token.value, { displayName, currentPassword, newPassword })
      
      // Update local user state
      if (updatedUser) {
        user.value = {
          ...user.value,
          displayName: updatedUser.displayName,
          username: updatedUser.username || user.value.username
        }
        localStorage.setItem('auth_user', JSON.stringify(user.value))
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    currentUserId,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile
  }
})
