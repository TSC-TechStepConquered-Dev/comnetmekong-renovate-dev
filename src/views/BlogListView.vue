<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import { useBlogStore } from '../presentation/stores/blog'
import Navbar from '../presentation/components/layout/Navbar.vue'
import Footer from '../presentation/components/layout/Footer.vue'

const blogStore = useBlogStore()

useHead({
  title: 'บทความและข่าวสาร - COMNETMEKONG',
  meta: [
    { name: 'description', content: 'อ่านบทความ ข่าวสาร และเรื่องราวความเคลื่อนไหวจากเครือข่าย COMNETMEKONG' },
  ]
})

const blogs = ref([])
const loading = ref(true)

// Pagination state
const currentPage = ref(1)
const itemsPerPage = 15

const paginatedBlogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return blogs.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(blogs.value.length / itemsPerPage)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    scrollToTop()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    scrollToTop()
  }
}

const goToPage = (page) => {
  currentPage.value = page
  scrollToTop()
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(async () => {
  blogs.value = await blogStore.fetchLatestBlogs()
  loading.value = false
})
</script>

<template>
  <main class="min-h-screen bg-[#f4f1ea] font-sans">
    
    <!-- Navbar -->
    <div class="bg-stone-900 z-50">
      <Navbar />
    </div>

    <!-- Page Header -->
    <section class="bg-stone-900 pt-32 pb-32 px-4 text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 mt-8">ข่าวสารและเรื่องราว</h1>
      <p class="text-stone-400 max-w-2xl mx-auto text-lg">ติดตามเรื่องราววิถีชีวิต ชุมชน และความเคลื่อนไหวต่างๆ ในพื้นที่ลุ่มน้ำโขง</p>
    </section>

    <!-- Main Content -->
    <section class="max-w-7xl mx-auto px-4 md:px-8 -mt-20 relative z-10 pb-24">
      
      <!-- Loading Skeleton -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="i in itemsPerPage" :key="i" class="bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col border border-stone-100 animate-pulse">
          <div class="h-56 md:h-64 bg-stone-200"></div>
          <div class="p-6 md:p-8 flex flex-col flex-grow">
            <div class="w-32 h-3 bg-stone-200 rounded mb-4"></div>
            <div class="w-full h-6 bg-stone-200 rounded mb-2"></div>
            <div class="w-3/4 h-6 bg-stone-200 rounded mb-6"></div>
            <div class="w-full h-3 bg-stone-200 rounded mb-2"></div>
            <div class="w-full h-3 bg-stone-200 rounded mb-2"></div>
            <div class="w-4/5 h-3 bg-stone-200 rounded mb-6"></div>
            <div class="w-20 h-3 bg-stone-200 rounded mt-auto"></div>
          </div>
        </div>
      </div>

      <!-- CSS Grid for Blog Cards -->
      <div v-else-if="blogs.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <RouterLink 
          v-for="blog in paginatedBlogs" 
          :key="blog.id"
          :to="`/blogs/${blog.id}`"
          class="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col border border-stone-100"
        >
          <div class="relative h-56 md:h-64 overflow-hidden bg-stone-100">
            <img :src="blog.imageUrl" :alt="blog.title" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out">
          </div>
          <div class="p-6 md:p-8 flex flex-col flex-grow">
            <div class="flex items-center gap-3 text-xs font-semibold text-stone-500 mb-3 uppercase tracking-wider">
              <span class="text-amber-600">{{ blog.category }}</span>
              <span>•</span>
              <span>{{ blog.date }}</span>
            </div>
            <h3 class="text-xl md:text-2xl font-bold text-stone-800 leading-tight mb-4 group-hover:text-amber-700 transition-colors line-clamp-2">
              {{ blog.title }}
            </h3>
            <p class="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow font-light">
              {{ blog.summary }}
            </p>
            <div class="text-xs font-bold tracking-widest uppercase text-stone-900 group-hover:text-amber-600 transition-colors flex items-center gap-2 mt-auto">
              อ่านต่อ <span class="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </RouterLink>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20 bg-white rounded-3xl shadow-sm border border-stone-100">
        <div class="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
        </div>
        <h3 class="text-xl font-bold text-stone-700 mb-2">ไม่พบข่าวสาร</h3>
        <p class="text-stone-500">กำลังจะมีการอัปเดตเรื่องราวใหม่ในเร็วๆ นี้</p>
      </div>

      <!-- Pagination Controls -->
      <div v-if="!loading && totalPages > 1" class="flex justify-center items-center gap-2">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="w-10 h-10 rounded-full flex items-center justify-center border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        
        <div class="flex items-center gap-2 px-4">
          <button 
            v-for="page in totalPages" 
            :key="page"
            @click="goToPage(page)"
            class="w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors bg-white shadow-sm border border-stone-200"
            :class="currentPage === page ? 'bg-amber-600 text-white border-amber-600' : 'text-stone-600 hover:bg-stone-50'"
          >
            {{ page }}
          </button>
        </div>

        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="w-10 h-10 rounded-full flex items-center justify-center border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>

    </section>
    
    <Footer />
  </main>
</template>
