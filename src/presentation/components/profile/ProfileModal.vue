<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { WixBlogRepository } from '../../../infrastructure/repositories/wix-blog.repository'
import { ROUTES } from '../../../config/routes'
import { useRouter } from 'vue-router'

const emit = defineEmits(['close'])

const authStore = useAuthStore()
const router = useRouter()
const blogRepo = new WixBlogRepository()

const displayName = ref(authStore.user?.displayName || '')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const isGoogleUser = computed(() => authStore.user?.provider === 'google')

const showPasswordModal = ref(false)
const activeTab = ref('profile') // 'profile', 'liked', 'comments'

const likedBlogs = ref([])
const commentedBlogs = ref([])
const isLoadingBlogs = ref(false)

onMounted(async () => {
  // Prevent background scrolling when modal is open
  document.body.style.overflow = 'hidden'

  isLoadingBlogs.value = true
  try {
    // 1. ดึงบล็อกล่าสุดมาตรวจสอบ (ดึงมา 30 บทความล่าสุดเพื่อไม่ให้โหลดหนักเกินไป)
    const allBlogs = await blogRepo.getLatestBlogs()
    const blogsToCheck = allBlogs.slice(0, 30)
    
    // 2. เรียก API ตรวจสอบ Interaction ทีละบทความพร้อมๆ กัน
    const interactionsPromises = blogsToCheck.map(blog => 
      blogRepo.getUserInteractions(blog.id, authStore.token)
        .then(res => ({ blog, interactions: res }))
        .catch(() => ({ blog, interactions: { hasLiked: false, userComments: [] } }))
    )
    
    const results = await Promise.all(interactionsPromises)
    
    const liked = []
    const commented = []
    
    // 3. แยกผลลัพธ์เข้า Array ของ Liked และ Commented
    for (const result of results) {
      if (result.interactions && result.interactions.hasLiked) {
        liked.push(result.blog)
      }
      
      if (result.interactions && result.interactions.userComments && result.interactions.userComments.length > 0) {
        // ถ้ายูสเซอร์มีหลายคอมเมนต์ในโพสต์เดียวกัน ก็เอามาใส่ทีละอัน
        for (const comment of result.interactions.userComments) {
          commented.push({
            ...result.blog,
            userComment: comment.content,
            commentDate: new Date(comment.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          })
        }
      }
    }
    
    // เรียงคอมเมนต์ตามวันที่ล่าสุด
    commented.sort((a, b) => {
       const dateA = new Date(a.commentDate).getTime() || 0
       const dateB = new Date(b.commentDate).getTime() || 0
       return dateB - dateA
    })
    
    likedBlogs.value = liked
    commentedBlogs.value = commented
  } catch (err) {
    console.error(err)
  } finally {
    isLoadingBlogs.value = false
  }
})

onUnmounted(() => {
  // Restore background scrolling when modal is closed
  document.body.style.overflow = ''
})

const handleUpdateProfile = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    const result = await authStore.updateProfile(displayName.value, '', '')
    if (result.success) {
      successMessage.value = 'อัปเดตข้อมูลส่วนตัวสำเร็จ'
    } else {
      errorMessage.value = result.error || 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์'
    }
  } catch (error) {
    errorMessage.value = error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
  } finally {
    isLoading.value = false
  }
}

const handleChangePassword = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน'
    return
  }

  if (!currentPassword.value) {
    errorMessage.value = 'กรุณากรอกรหัสผ่านปัจจุบัน'
    return
  }

  isLoading.value = true
  try {
    const result = await authStore.updateProfile(displayName.value, currentPassword.value, newPassword.value)
    if (result.success) {
      successMessage.value = 'เปลี่ยนรหัสผ่านสำเร็จ'
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
      showPasswordModal.value = false
    } else {
      errorMessage.value = result.error || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน'
    }
  } catch (error) {
    errorMessage.value = error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
  } finally {
    isLoading.value = false
  }
}

const handleLinkClick = (path) => {
  emit('close')
  router.push(path)
}
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity animate-fade-in" @click="$emit('close')"></div>
    
    <!-- Modal Content -->
    <div class="relative bg-[#f4f1ea] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scale-up border border-stone-200 overflow-hidden">
      
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-stone-200 bg-white flex justify-between items-center shrink-0">
        <h2 class="text-xl font-bold text-stone-800">จัดการโปรไฟล์</h2>
        <button @click="$emit('close')" class="text-stone-400 hover:text-stone-600 transition-colors p-2 bg-stone-100 hover:bg-stone-200 rounded-full">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Scrollable Body -->
      <div class="overflow-y-auto p-6 flex-1 scrollbar-custom overscroll-contain">
        <!-- Profile Header -->
        <div class="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-600 text-white flex items-center justify-center text-3xl sm:text-4xl font-bold shrink-0 shadow-md">
            {{ displayName.charAt(0) || 'U' }}
          </div>
          <div class="flex-1 text-center sm:text-left">
            <h1 class="text-2xl sm:text-3xl font-bold text-stone-800 mb-1">{{ displayName }}</h1>
            <p class="text-stone-500 mb-4 text-sm sm:text-base">สมาชิก COMNETMEKONG</p>
            <div class="flex flex-wrap gap-2 justify-center sm:justify-start">
              <button 
                v-if="!isGoogleUser"
                @click="showPasswordModal = true" 
                class="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full text-sm font-medium transition-colors"
              >
                เปลี่ยนรหัสผ่าน
              </button>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
          <button 
            @click="activeTab = 'profile'"
            class="px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors"
            :class="activeTab === 'profile' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'"
          >
            ข้อมูลส่วนตัว
          </button>
          <button 
            @click="activeTab = 'liked'"
            class="px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors"
            :class="activeTab === 'liked' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'"
          >
            บล็อกที่ถูกใจ
          </button>
          <button 
            @click="activeTab = 'comments'"
            class="px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors"
            :class="activeTab === 'comments' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'"
          >
            คอมเมนต์ของฉัน
          </button>
        </div>

        <!-- Messages -->
        <div v-if="errorMessage && !showPasswordModal" class="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 mb-6 flex items-start gap-2 animate-fade-in">
          <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>{{ errorMessage }}</span>
        </div>
        <div v-if="successMessage && !showPasswordModal" class="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium border border-green-100 mb-6 flex items-start gap-2 animate-fade-in">
          <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>{{ successMessage }}</span>
        </div>

        <!-- Tab Content: Profile -->
        <div v-if="activeTab === 'profile'" class="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 sm:p-8 animate-fade-in">
          <h2 class="text-xl font-bold text-stone-800 mb-6">ตั้งค่าบัญชี</h2>
          <form @submit.prevent="handleUpdateProfile" class="max-w-md">
            <div class="mb-6">
              <label for="displayName" class="block text-sm font-semibold text-stone-700 mb-2">ชื่อที่แสดง (Display Name)</label>
              <input 
                id="displayName"
                v-model="displayName"
                type="text" 
                required
                class="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none text-stone-800"
                placeholder="ชื่อที่ต้องการให้แสดงในระบบ"
              />
            </div>
            <button 
              type="submit" 
              :disabled="isLoading"
              class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-70 flex justify-center items-center gap-2"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              บันทึกการเปลี่ยนแปลง
            </button>
          </form>
        </div>

        <!-- Tab Content: Liked Blogs -->
        <div v-if="activeTab === 'liked'" class="animate-fade-in">
          <div v-if="isLoadingBlogs" class="text-center py-12">
            <div class="inline-block animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mb-4"></div>
            <p class="text-stone-500">กำลังโหลดข้อมูล...</p>
          </div>
          <div v-else-if="likedBlogs.length === 0" class="bg-white rounded-3xl p-10 text-center border border-stone-200">
            <svg class="w-12 h-12 sm:w-16 sm:h-16 text-stone-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            <h3 class="text-lg sm:text-xl font-bold text-stone-700 mb-2">ยังไม่มีบล็อกที่ถูกใจ</h3>
            <p class="text-stone-500 mb-6 text-sm sm:text-base">คุณยังไม่ได้กดถูกใจบทความใดๆ ลองเข้าไปอ่านและให้กำลังใจผู้เขียนสิ</p>
            <button @click="handleLinkClick(ROUTES.BLOGS)" class="inline-block px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors text-sm sm:text-base">ไปที่หน้าข่าวสาร</button>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div 
              v-for="blog in likedBlogs" 
              :key="blog.id"
              @click="handleLinkClick('/blogs/' + blog.id)"
              class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-stone-100 group flex flex-col cursor-pointer"
            >
              <div class="aspect-[16/9] overflow-hidden relative">
                <img :src="blog.imageUrl" :alt="blog.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-red-500 p-1.5 rounded-full shadow-sm">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </div>
              </div>
              <div class="p-4 sm:p-5 flex-1 flex flex-col">
                <h3 class="text-base sm:text-lg font-bold text-stone-800 mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">{{ blog.title }}</h3>
                <div class="mt-auto flex items-center justify-between text-xs text-stone-400 font-medium">
                  <span>{{ blog.date }}</span>
                  <span class="flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> {{ blog.views }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Content: My Comments -->
        <div v-if="activeTab === 'comments'" class="animate-fade-in">
          <div v-if="isLoadingBlogs" class="text-center py-12">
            <div class="inline-block animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mb-4"></div>
            <p class="text-stone-500">กำลังโหลดข้อมูล...</p>
          </div>
          <div v-else-if="commentedBlogs.length === 0" class="bg-white rounded-3xl p-10 text-center border border-stone-200">
            <svg class="w-12 h-12 sm:w-16 sm:h-16 text-stone-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <h3 class="text-lg sm:text-xl font-bold text-stone-700 mb-2">ยังไม่มีคอมเมนต์</h3>
            <p class="text-stone-500 mb-6 text-sm sm:text-base">คุณยังไม่ได้คอมเมนต์ในบทความใดๆ ร่วมแบ่งปันความคิดเห็นของคุณได้เลย</p>
            <button @click="handleLinkClick(ROUTES.BLOGS)" class="inline-block px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors text-sm sm:text-base">ไปที่หน้าข่าวสาร</button>
          </div>
          <div v-else class="space-y-4">
            <div v-for="blog in commentedBlogs" :key="blog.id" class="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-100">
              <div class="flex items-start gap-3 sm:gap-4 mb-4">
                <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-100 text-amber-700 flex flex-col items-center justify-center shrink-0">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap justify-between items-center mb-1 gap-2">
                    <h4 class="font-bold text-stone-800 text-sm sm:text-base">{{ displayName }}</h4>
                    <span class="text-[10px] sm:text-xs text-stone-400 font-medium">{{ blog.commentDate }}</span>
                  </div>
                  <p class="text-stone-600 text-xs sm:text-sm bg-stone-50 p-3 sm:p-4 rounded-xl rounded-tl-none break-words">{{ blog.userComment }}</p>
                </div>
              </div>
              <div class="pl-11 sm:pl-14">
                <div class="flex items-center gap-3 p-2 sm:p-3 rounded-xl bg-stone-50 border border-stone-100 cursor-pointer hover:bg-stone-100 transition-colors" @click="handleLinkClick('/blogs/' + blog.id)">
                  <img :src="blog.imageUrl" class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover shrink-0" alt="" />
                  <div class="flex-1 min-w-0">
                    <span class="text-[10px] sm:text-xs text-stone-400 block mb-0.5">คอมเมนต์ในบทความ:</span>
                    <span class="text-xs sm:text-sm font-bold text-stone-800 hover:text-amber-600 truncate block transition-colors">{{ blog.title }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Inner Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity animate-fade-in" @click="showPasswordModal = false"></div>
      
      <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm animate-scale-up border border-stone-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h3 class="text-lg font-bold text-stone-800">เปลี่ยนรหัสผ่าน</h3>
          <button @click="showPasswordModal = false" class="text-stone-400 hover:text-stone-600 transition-colors p-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="p-6">
          <div v-if="errorMessage && showPasswordModal" class="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100 mb-4 flex items-start gap-2 animate-fade-in">
            <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{{ errorMessage }}</span>
          </div>

          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <div>
              <label for="currentPassword" class="block text-xs font-semibold text-stone-700 mb-1.5">รหัสผ่านปัจจุบัน</label>
              <input 
                id="currentPassword"
                v-model="currentPassword"
                type="password" 
                required
                class="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none text-stone-800"
                placeholder="กรอกรหัสผ่านปัจจุบัน"
              />
            </div>

            <div>
              <label for="newPassword" class="block text-xs font-semibold text-stone-700 mb-1.5">รหัสผ่านใหม่</label>
              <input 
                id="newPassword"
                v-model="newPassword"
                type="password" 
                required
                class="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none text-stone-800"
                placeholder="อย่างน้อย 6 ตัวอักษร"
              />
            </div>

            <div>
              <label for="confirmPassword" class="block text-xs font-semibold text-stone-700 mb-1.5">ยืนยันรหัสผ่านใหม่</label>
              <input 
                id="confirmPassword"
                v-model="confirmPassword"
                type="password" 
                required
                class="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none text-stone-800"
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              />
            </div>

            <div class="flex gap-2 pt-2">
              <button 
                type="button" 
                @click="showPasswordModal = false"
                class="flex-1 px-3 py-2.5 text-sm rounded-xl bg-white border border-stone-300 text-stone-700 font-medium hover:bg-stone-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                :disabled="isLoading"
                class="flex-1 px-3 py-2.5 text-sm rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center"
              >
                <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ยืนยันการเปลี่ยน
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}

@keyframes scaleUp {
  0% { opacity: 0; transform: scale(0.95) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-custom::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-custom::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-custom::-webkit-scrollbar-thumb {
  background-color: #d6d3d1;
  border-radius: 10px;
}
</style>
