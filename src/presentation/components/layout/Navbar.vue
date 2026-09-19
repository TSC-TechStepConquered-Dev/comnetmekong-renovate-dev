<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ROUTES } from '../../../config/routes'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const menuItems = [
  { name: 'หน้าแรก', path: ROUTES.HOME },
  { name: 'เกี่ยวกับเรา', path: '#' },
  { name: 'งานของเรา', path: '#' },
  { name: 'Hug Mekong Youth', path: '#' },
  { name: 'มัลติมีเดีย', path: '#' },
  { name: 'คนฮักโขง', path: '#' },
  { name: 'การบริจาค', path: '#' }
]

const activeMenu = ref(null)
let timeout = null

const handleMouseEnter = (name) => {
  clearTimeout(timeout)
  if (['เกี่ยวกับเรา', 'งานของเรา', 'มัลติมีเดีย'].includes(name)) {
    activeMenu.value = name
  } else {
    activeMenu.value = null
  }
}

const handleMenuClick = (name) => {
  if (['เกี่ยวกับเรา', 'งานของเรา', 'มัลติมีเดีย'].includes(name)) {
    activeMenu.value = activeMenu.value === name ? null : name
  } else {
    activeMenu.value = null
  }
}

const handleMouseLeave = () => {
  timeout = setTimeout(() => {
    activeMenu.value = null
  }, 150)
}

const cancelTimeout = () => {
  if (timeout) {
    clearTimeout(timeout)
  }
}

const showLogoutModal = ref(false)
const profileDropdownOpen = ref(false)

const toggleProfileDropdown = () => {
  profileDropdownOpen.value = !profileDropdownOpen.value
}

const closeNavDropdowns = (e) => {
  if (!e.target.closest('.profile-dropdown-wrapper')) {
    profileDropdownOpen.value = false
  }
  if (!e.target.closest('.mega-menu-trigger') && !e.target.closest('.mega-menu-content')) {
    activeMenu.value = null
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
</script>

<template>
  <header class="absolute top-0 left-0 w-full z-50 px-4 py-6 md:px-8" @mouseleave="handleMouseLeave">
    <div class="max-w-7xl mx-auto relative">
      <!-- Main Header Pill -->
      <div class="relative z-20 flex items-center justify-between bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 shadow-lg transition-colors duration-300"
           :class="{'bg-black/40': activeMenu}">
        
        <!-- Logo Area -->
        <RouterLink :to="ROUTES.HOME" class="flex items-center gap-3 group shrink-0" @mouseenter="activeMenu = null">
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
            class="mega-menu-trigger"
            @mouseenter="handleMouseEnter(item.name)"
          >
            <RouterLink 
              v-if="item.path !== '#'"
              :to="item.path" 
              class="block px-4 py-3 text-sm font-medium transition-colors text-white/90 hover:text-white"
            >
              {{ item.name }}
            </RouterLink>
            <button 
              v-else
              @click.stop="handleMenuClick(item.name)"
              class="block px-4 py-3 text-sm font-medium transition-colors cursor-pointer"
              :class="activeMenu === item.name ? 'text-amber-300' : 'text-white/90 hover:text-white'"
            >
              {{ item.name }}
            </button>
          </div>
        </nav>

        <!-- Right Side: Login/User Area & Mobile Toggle -->
        <div class="flex items-center gap-2" @mouseenter="activeMenu = null">
          
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
                    <RouterLink to="#" class="block px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors" @click.stop="profileDropdownOpen = false">โปรไฟล์ของฉัน</RouterLink>
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
          <div v-if="authStore.isAuthenticated && authStore.user" class="pb-4 mb-4 border-b border-stone-200 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold">
                {{ authStore.user.displayName.charAt(0) }}
              </div>
              <div>
                <div class="text-stone-800 font-bold">{{ authStore.user.displayName }}</div>
                <div class="text-stone-500 text-xs">ผู้ใช้งาน</div>
              </div>
            </div>
            <button @click="() => { mobileMenuOpen = false; handleLogoutClick(); }" class="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-full font-medium">ออกจากระบบ</button>
          </div>
          
          <RouterLink 
            v-for="item in menuItems" 
            :key="item.name"
            :to="item.path"
            class="block text-lg font-bold text-stone-700 hover:text-amber-600 transition-colors"
            @click="mobileMenuOpen = false"
          >
            {{ item.name }}
          </RouterLink>
        </div>
      </div>

      <!-- Mega Menu Dropdown -->
      <div 
        class="mega-menu-content hidden lg:block absolute left-0 top-full mt-2 w-full z-10 transition-all duration-300 ease-out origin-top"
        :class="activeMenu ? 'opacity-100 translate-y-0 visible pointer-events-auto' : 'opacity-0 -translate-y-4 invisible pointer-events-none'"
        @mouseenter="cancelTimeout"
      >
        <div class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-10 mx-auto w-full max-w-5xl">
          
          <!-- Content changes based on active menu -->
          <div v-if="activeMenu === 'เกี่ยวกับเรา'" class="grid grid-cols-3 gap-8">
            <div>
              <h3 class="text-sm font-bold text-stone-900 mb-4 uppercase tracking-wider">องค์กรของเรา</h3>
              <ul class="space-y-3">
                <li><a href="#" class="text-sm text-stone-600 hover:text-amber-600 transition-colors">ประวัติความเป็นมา</a></li>
                <li><a href="#" class="text-sm text-stone-600 hover:text-amber-600 transition-colors">วิสัยทัศน์และพันธกิจ</a></li>
                <li><a href="#" class="text-sm text-stone-600 hover:text-amber-600 transition-colors">โครงสร้างองค์กร</a></li>
              </ul>
            </div>
            <div>
              <h3 class="text-sm font-bold text-stone-900 mb-4 uppercase tracking-wider">คณะทำงาน</h3>
              <ul class="space-y-3">
                <li><a href="#" class="text-sm text-stone-600 hover:text-amber-600 transition-colors">คณะกรรมการบริหาร</a></li>
                <li><a href="#" class="text-sm text-stone-600 hover:text-amber-600 transition-colors">ทีมงานพื้นที่</a></li>
                <li><a href="#" class="text-sm text-stone-600 hover:text-amber-600 transition-colors">ติดต่อเรา</a></li>
              </ul>
            </div>
            <div class="bg-stone-50 rounded-2xl p-6 border border-stone-100">
              <h3 class="text-sm font-bold text-stone-900 mb-2">เครือข่ายลุ่มน้ำโขง</h3>
              <p class="text-sm text-stone-500 leading-relaxed">ร่วมขับเคลื่อนประเด็นสิทธิและสิ่งแวดล้อมไปกับเรา</p>
            </div>
          </div>

          <div v-else-if="activeMenu === 'งานของเรา'" class="grid grid-cols-4 gap-8">
            <div>
              <h3 class="text-sm font-bold text-stone-900 mb-4 uppercase tracking-wider">ประเด็นหลัก</h3>
              <ul class="space-y-3">
                <li><a href="#" class="text-sm text-stone-600 hover:text-amber-600 transition-colors">สิทธิชุมชน</a></li>
                <li><a href="#" class="text-sm text-stone-600 hover:text-amber-600 transition-colors">การจัดการทรัพยากรน้ำ</a></li>
                <li><a href="#" class="text-sm text-stone-600 hover:text-amber-600 transition-colors">ความหลากหลายทางชีวภาพ</a></li>
              </ul>
            </div>
            <div>
              <h3 class="text-sm font-bold text-stone-900 mb-4 uppercase tracking-wider">พื้นที่ปฏิบัติงาน</h3>
              <ul class="space-y-3">
                <li><a href="#" class="text-sm text-stone-600 hover:text-amber-600 transition-colors">ภาคเหนือ</a></li>
                <li><a href="#" class="text-sm text-stone-600 hover:text-amber-600 transition-colors">ภาคอีสาน</a></li>
              </ul>
            </div>
            <div class="col-span-2">
              <h3 class="text-sm font-bold text-stone-900 mb-4 uppercase tracking-wider">แคมเปญล่าสุด</h3>
              <div class="grid grid-cols-2 gap-4">
                <a href="#" class="block p-4 rounded-xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-200">
                  <span class="block text-sm font-semibold text-stone-800 mb-1">ปกป้องป่าบุ้งป่าทาม</span>
                  <span class="block text-xs text-stone-500">เรียนรู้ความสำคัญของพื้นที่ชุ่มน้ำ</span>
                </a>
                <a href="#" class="block p-4 rounded-xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-200">
                  <span class="block text-sm font-semibold text-stone-800 mb-1">พลังงานทางเลือก</span>
                  <span class="block text-xs text-stone-500">เพื่อความยั่งยืนของชุมชน</span>
                </a>
              </div>
            </div>
          </div>

          <div v-else class="flex items-center justify-center py-8">
            <p class="text-stone-500">หัวข้อย่อยสำหรับเมนู {{ activeMenu }} (รอการเพิ่มเติมข้อมูล)</p>
          </div>

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
