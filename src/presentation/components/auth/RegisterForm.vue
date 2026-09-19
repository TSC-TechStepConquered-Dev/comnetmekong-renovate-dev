<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { ROUTES } from '../../../config/routes'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const displayName = ref('')

const isLoading = ref(false)
const errorMessage = ref('')

const handleRegister = async () => {
  errorMessage.value = ''
  
  if (!username.value || !password.value || !confirmPassword.value || !displayName.value) {
    errorMessage.value = 'กรุณากรอกข้อมูลให้ครบถ้วน'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    return
  }

  isLoading.value = true
  
  const result = await authStore.register(username.value, password.value, displayName.value)
  
  isLoading.value = false
  
  if (result.success) {
    router.push(ROUTES.HOME)
  } else {
    errorMessage.value = result.error || 'การสมัครสมาชิกล้มเหลว'
  }
}

const handleGoogleCallback = async (response) => {
  try {
    console.log('Google response:', response)
    
    if (!response || !response.access_token) {
      alert('Error: ไม่พบข้อมูล Access Token จาก Google\n' + JSON.stringify(response))
      return
    }

    isLoading.value = true
    const result = await authStore.loginWithGoogle(response.access_token)
    isLoading.value = false
    
    if (result.success) {
      console.log('Login success, redirecting...')
      router.push(ROUTES.HOME).catch(err => {
        console.error('Router push error:', err)
        window.location.href = ROUTES.HOME
      })
    } else {
      alert('การเข้าสู่ระบบล้มเหลว:\n' + (result.error || 'Unknown error'))
    }
  } catch (err) {
    isLoading.value = false
    alert('เกิดข้อผิดพลาดที่ไม่คาดคิด:\n' + err.message)
    console.error(err)
  }
}
</script>

<template>
  <div class="w-full max-w-md p-8 space-y-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
    <div class="text-center">
      <h2 class="text-3xl font-bold text-stone-800 tracking-tight">สมัครสมาชิก</h2>
      <p class="mt-2 text-sm text-stone-600">
        ร่วมเป็นส่วนหนึ่งของเครือข่ายลุ่มน้ำโขง
      </p>
    </div>

    <form class="space-y-4" @submit.prevent="handleRegister">
      <!-- Error Message -->
      <div v-if="errorMessage" class="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
        {{ errorMessage }}
      </div>

      <div>
        <label for="displayName" class="block text-sm font-medium text-stone-700">ชื่อที่ใช้แสดง (Display Name)</label>
        <div class="mt-1">
          <input 
            id="displayName" 
            v-model="displayName" 
            type="text" 
            required 
            class="w-full px-4 py-2.5 text-stone-800 bg-white/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-all outline-none backdrop-blur-sm"
            placeholder="เช่น สมชาย ใจดี"
          />
        </div>
      </div>

      <div>
        <label for="username" class="block text-sm font-medium text-stone-700">ชื่อผู้ใช้ (Username)</label>
        <div class="mt-1">
          <input 
            id="username" 
            v-model="username" 
            type="text" 
            required 
            class="w-full px-4 py-2.5 text-stone-800 bg-white/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-all outline-none backdrop-blur-sm"
            placeholder="ตั้งชื่อผู้ใช้ภาษาอังกฤษหรือตัวเลข"
          />
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-stone-700">รหัสผ่าน</label>
        <div class="mt-1">
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            required 
            class="w-full px-4 py-2.5 text-stone-800 bg-white/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-all outline-none backdrop-blur-sm"
            placeholder="อย่างน้อย 6 ตัวอักษร"
          />
        </div>
      </div>

      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-stone-700">ยืนยันรหัสผ่าน</label>
        <div class="mt-1">
          <input 
            id="confirmPassword" 
            v-model="confirmPassword" 
            type="password" 
            required 
            class="w-full px-4 py-2.5 text-stone-800 bg-white/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-all outline-none backdrop-blur-sm"
            placeholder="กรอกรหัสผ่านอีกครั้ง"
          />
        </div>
      </div>
      <div class="pt-2">
        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            กำลังสมัครสมาชิก...
          </span>
          <span v-else>สร้างบัญชี</span>
        </button>
      </div>

      <div class="relative flex items-center py-2">
        <div class="flex-grow border-t border-stone-300"></div>
        <span class="flex-shrink-0 mx-4 text-stone-500 text-sm">หรือ</span>
        <div class="flex-grow border-t border-stone-300"></div>
      </div>

      <div class="mt-6">
        <div class="flex justify-center">
          <GoogleLogin :callback="handleGoogleCallback" popup-type="TOKEN">
            <button 
              type="button"
              :disabled="isLoading"
              class="w-full flex items-center justify-center gap-3 bg-white border border-stone-200 rounded-xl py-3 px-4 text-stone-700 font-medium hover:bg-stone-50 transition-all shadow-sm disabled:opacity-70"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              ดำเนินการต่อด้วย Google
            </button>
          </GoogleLogin>
        </div>
      </div>
    </form>

    <div class="text-center text-sm text-stone-600">
      มีบัญชีอยู่แล้ว? 
      <RouterLink :to="ROUTES.AUTH.LOGIN" class="font-medium text-amber-700 hover:text-amber-600 transition-colors">
        เข้าสู่ระบบ
      </RouterLink>
    </div>
  </div>
</template>
