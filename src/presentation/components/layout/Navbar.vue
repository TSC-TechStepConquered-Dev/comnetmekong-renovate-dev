<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ROUTES } from '../../../config/routes'
import { useAuthStore } from '../../stores/auth'
import { useRoute } from 'vue-router'
import ProfileModal from '../profile/ProfileModal.vue'

const authStore = useAuthStore()
const route = useRoute()

const menuItems = [
  { name: 'หน้าแรก', path: ROUTES.HOME },
  { name: 'เกี่ยวกับเรา', path: ROUTES.ABOUT },
  { name: 'งานของเรา', path: ROUTES.OUR_WORK },
  { name: 'Hug Mekong Youth', path: ROUTES.MEKONG_YOUTH },
  { name: 'มัลติมีเดีย', path: '#' },
  { name: 'คนฮักโขง', path: '#' },
  { name: 'การบริจาค', path: '#' }
]

const showLogoutModal = ref(false)
const profileDropdownOpen = ref(false)

const toggleProfileDropdown = () => {
  profileDropdownOpen.value = !profileDropdownOpen.value
}

const closeNavDropdowns = (e) => {
  if (!e.target.closest('.profile-dropdown-wrapper')) {
    profileDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeNavDropdowns)
})

onUnmounted(() => {
  document.removeEventListener('click', closeNavDropdowns)
})

const handleLogoutClick = () => {
  profileDropdownOpen.value = false
  showLogoutModal.value = true
}

const confirmLogout = () => {
  showLogoutModal.value = false
  window.parent.postMessage({ type: 'REQUEST_WIX_LOGOUT' }, '*')
  authStore.logout()
}

const cancelLogout = () => {
  showLogoutModal.value = false
}

const requestWixLogin = () => {
  window.parent.postMessage({ type: 'REQUEST_WIX_LOGIN' }, '*')
}

const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const showProfileModal = ref(false)
const openProfileModal = () => {
  profileDropdownOpen.value = false
  mobileMenuOpen.value = false
  showProfileModal.value = true
}
</script>

<template>
  <header class="absolute top-0 left-0 w-full z-50 px-4 py-6 md:px-8">
    <div class="max-w-7xl mx-auto relative">
      <!-- Main Header Pill -->
      <div class="relative z-20 flex items-center justify-between bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 shadow-lg transition-colors duration-300">
        
        <!-- Logo Area -->
        <RouterLink :to="ROUTES.HOME" class="flex items-center gap-3 group shrink-0">
          <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0">
            <img src="../../../assets/logo_2.avif" alt="Hugmekong Logo" class="w-8 h-8 object-contain" />
          </div>
          <div class="flex flex-col">
            <span class="text-white font-bold tracking-wider text-sm group-hover:text-amber-300 transition-colors">COMNETMEKONG</span>
            <span class="text-white/70 text-[10px] tracking-widest uppercase truncate hidden sm:block">Stories along the river</span>
          </div>
        </RouterLink>

        <!-- Main Navigation (Desktop) -->
        <nav class="hidden lg:flex items-center gap-0">
          <div 
            v-for="item in menuItems" 
            :key="item.name"
          >
            <RouterLink 
              v-if="item.path !== '#'"
              :to="item.path" 
              class="block px-4 py-3 text-sm font-medium transition-colors"
              :class="route.path === item.path ? 'text-amber-300' : 'text-white/90 hover:text-white'"
            >
              {{ item.name }}
            </RouterLink>
            <a 
              v-else
              :href="item.path"
              class="block px-4 py-3 text-sm font-medium transition-colors cursor-pointer text-white/90 hover:text-white"
            >
              {{ item.name }}
            </a>
          </div>
        </nav>

        <!-- Right Side: Login/User Area & Mobile Toggle -->
        <div class="flex items-center gap-2">
          
          <!-- Auth Area (Desktop & Mobile) -->
          <template v-if="authStore.isAuthenticated && authStore.user">
            <div class="relative profile-dropdown-wrapper flex items-center gap-2 cursor-pointer bg-white/10 hover:bg-white/20 border border-white/20 rounded-full pl-2 pr-1.5 py-1.5 transition-all"
                 @click.stop="toggleProfileDropdown">
              <span class="text-white text-sm font-medium hidden sm:block ml-2">{{ authStore.user.displayName }}</span>
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              
              <!-- Profile Dropdown (Desktop — Click + Hover) -->
              <Transition name="dropdown-fade">
                <div v-if="profileDropdownOpen" class="hidden lg:block absolute right-0 top-full mt-2 w-48 z-50">
                  <div class="bg-white rounded-xl shadow-xl border border-stone-100 py-2 overflow-hidden">
                    <button @click.stop="openProfileModal" class="w-full text-left block px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors">จัดการโปรไฟล์</button>
                    <button @click.stop="handleLogoutClick" class="w-full text-left block px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">ออกจากระบบ</button>
                  </div>
                </div>
              </Transition>
            </div>
          </template>
          <template v-else>
            <RouterLink 
              :to="ROUTES.AUTH.LOGIN"
              class="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-white"
              title="เข้าสู่ระบบ"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
            </RouterLink>
          </template>

          <!-- Hamburger Toggle (Mobile) -->
          <button @click="toggleMobileMenu" class="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-white">
            <svg v-if="!mobileMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu Dropdown -->
      <div 
        v-if="mobileMenuOpen"
        class="lg:hidden absolute left-4 right-4 top-full mt-4 z-30 bg-[#f4f1ea] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-scale-up"
      >
        <div class="p-6 space-y-4">
          <!-- Auth Mobile Section -->
          <div v-if="authStore.isAuthenticated && authStore.user" class="pb-4 mb-4 border-b border-stone-200">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold">
                  {{ authStore.user.displayName.charAt(0) }}
                </div>
                <div>
                  <div class="text-stone-800 font-bold">{{ authStore.user.displayName }}</div>
                  <div class="text-stone-500 text-xs">ผู้ใช้งาน</div>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="openProfileModal" class="flex-1 text-center px-4 py-2 text-sm bg-stone-100 text-stone-700 rounded-full font-medium hover:bg-stone-200">จัดการโปรไฟล์</button>
              <button @click="() => { mobileMenuOpen = false; handleLogoutClick(); }" class="flex-1 px-4 py-2 text-sm bg-red-50 text-red-600 rounded-full font-medium hover:bg-red-100">ออกจากระบบ</button>
            </div>
          </div>
          
          <RouterLink 
            v-for="item in menuItems" 
            :key="item.name"
            :to="item.path"
            class="block text-lg font-bold transition-colors"
            :class="route.path === item.path ? 'text-amber-600' : 'text-stone-700 hover:text-amber-600'"
            @click="mobileMenuOpen = false"
          >
            {{ item.name }}
          </RouterLink>
        </div>
      </div>
      
    </div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="fixed inset-0 z-[100] flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" @click="cancelLogout"></div>
      
      <!-- Modal Content -->
      <div class="relative bg-[#f4f1ea] rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-scale-up border border-stone-200">
        <h3 class="text-2xl font-bold text-center text-stone-800 mb-3 tracking-tight">ออกจากระบบ</h3>
        <p class="text-center text-stone-600 mb-8 leading-relaxed">คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบบัญชีของคุณ?</p>
        
        <div class="flex gap-3">
          <button @click="cancelLogout" class="flex-1 px-4 py-3 rounded-xl bg-white border border-stone-300 text-stone-700 font-medium hover:bg-stone-50 transition-colors">
            ยกเลิก
          </button>
          <button @click="confirmLogout" class="flex-1 px-4 py-3 rounded-xl bg-amber-700 text-white font-medium hover:bg-amber-800 transition-colors shadow-sm">
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>

    <!-- Profile Modal -->
    <ProfileModal v-if="showProfileModal" @close="showProfileModal = false" />
  </header>
</template>

<style scoped>
@keyframes scaleUp {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}
.animate-scale-up {
  animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.dropdown-fade-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-fade-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.95);
}
</style>
