<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ENV } from '@/config/env'
import { useHead } from '@vueuse/head'
import Navbar from '../presentation/components/layout/Navbar.vue'
import Footer from '../presentation/components/layout/Footer.vue'

// SEO Meta
useHead({
  title: 'มัลติมีเดีย - COMNETMEKONG',
  meta: [
    {
      name: 'description',
      content:
        'คลังภาพถ่าย วิดีโอ และสื่อสร้างสรรค์ บอกเล่าเรื่องราวสายน้ำและวิถีชีวิตคนลุ่มน้ำโขง',
    },
  ],
})

// Typing Animation Logic (Hero Section)
const fullText = 'MULTIMEDIA.'
const displayedText = ref([])
let isTypingActive = false

const typeText = async () => {
  if (!isTypingActive) return

  displayedText.value = []

  // Type text
  for (let i = 0; i < fullText.length; i++) {
    if (!isTypingActive) return
    displayedText.value.push(fullText[i])
    await new Promise((resolve) => setTimeout(resolve, 140))
  }

  // Wait
  await new Promise((resolve) => setTimeout(resolve, 3000))

  // Untype text
  for (let i = fullText.length; i > 0; i--) {
    if (!isTypingActive) return
    displayedText.value.pop()
    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  // Wait before restarting
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (isTypingActive) {
    typeText()
  }
}

// Helpers
const convertWixImageUrl = (wixUrl) => {
  if (!wixUrl) return ''
  if (typeof wixUrl !== 'string') return ''
  if (wixUrl.startsWith('http')) return wixUrl
  if (wixUrl.startsWith('wix:image://v1/')) {
    const parts = wixUrl.split('/')
    if (parts.length >= 4) {
      return `https://static.wixstatic.com/media/${parts[3]}`
    }
  }
  return `https://static.wixstatic.com/media/${wixUrl}`
}

const stripHtml = (html) => {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

const formatVideoEmbedUrl = (url) => {
  if (!url) return ''
  if (typeof url !== 'string') return ''

  // YouTube URLs
  if (url.includes('youtube.com/watch')) {
    const match = url.match(/[?&]v=([^&]+)/)
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`
    }
  }
  if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/')
    if (parts[1]) {
      const cleanId = parts[1].split('?')[0]
      return `https://www.youtube.com/embed/${cleanId}?autoplay=1&rel=0`
    }
  }
  if (url.includes('youtube.com/embed/')) {
    return url.includes('autoplay') ? url : `${url}?autoplay=1&rel=0`
  }

  // Vimeo URLs
  if (url.includes('vimeo.com/')) {
    const match = url.match(/vimeo\.com\/(\d+)/)
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}?autoplay=1`
    }
  }

  return url
}

// MOCK DATA (Rich, evocative Mekong river multimedia)

// State
const mediaItems = ref([])
const loading = ref(true)
const activeFilter = ref('all') // 'all' | 'photo' | 'video'
const searchQuery = ref('')

// Modal & Lightbox State
const selectedItem = ref(null)
const activeGalleryIndex = ref(0)
const isLightboxOpen = ref(false)
const isVideoModalOpen = ref(false)

// Body scroll lock on modal open
watch([isLightboxOpen, isVideoModalOpen], ([lightbox, video]) => {
  if (lightbox || video) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'auto'
  }
})

// Data Fetching
const BASE_URL = ENV.WIX_BASE_URL

const fetchMultimedia = async () => {
  loading.value = true
  try {
    const res = await fetch(`${BASE_URL}/mekong_multimedia`).catch(() => null)
    if (!res || !res.ok) {
      mediaItems.value = []
      return
    }

    const data = await res.json()
    const rawItems = data.items || data.data || data

    if (Array.isArray(rawItems) && rawItems.length > 0) {
      mediaItems.value = rawItems.map((item) => {
        const cover = convertWixImageUrl(item.coverImage || item.thumbnail || item.image)
        let gallery = []

        // Parse gallery if exists
        if (Array.isArray(item.mediaGallery || item.gallery)) {
          gallery = (item.mediaGallery || item.gallery)
            .map((g) => {
              if (typeof g === 'object' && g !== null) {
                return {
                  url: convertWixImageUrl(g.src || g.url || g.image),
                  title: g.title || '',
                  description: stripHtml(g.description || ''),
                }
              }
              return {
                url: convertWixImageUrl(g),
                title: '',
                description: '',
              }
            })
            .filter((g) => g.url)
        }

        // If gallery is empty, provide cover image as single photo
        if (gallery.length === 0 && cover) {
          gallery.push({
            url: cover,
            title: item.title || '',
            description: item.description || '',
          })
        }

        let type = (item.type || '').toLowerCase()
        if (!type) {
          type = item.videoUrl ? 'video' : 'photo'
        }

        return {
          id: item._id || item.id,
          title: item.title || 'Untitled',
          description: stripHtml(item.description || ''),
          type: type,
          category: item.category || 'ทั่วไป',
          thumbnail: cover,
          videoUrl: item.videoUrl || '',
          gallery: gallery,
          location: item.location || '',
          date: item.date
            ? new Date(item.date).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : '',
        }
      })
    } else {
      mediaItems.value = []
    }
  } catch (err) {
    console.warn('Error fetching multimedia data', err)
    mediaItems.value = []
  } finally {
    loading.value = false
  }
}

// Filtered Media
const filteredItems = computed(() => {
  return mediaItems.value.filter((item) => {
    const matchesFilter = activeFilter.value === 'all' ? true : item.type === activeFilter.value

    const query = searchQuery.value.trim().toLowerCase()
    const matchesSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      (item.location && item.location.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query))

    return matchesFilter && matchesSearch
  })
})

// Action Handlers
const openMedia = (item) => {
  selectedItem.value = item
  if (item.type === 'video') {
    isVideoModalOpen.value = true
  } else {
    activeGalleryIndex.value = 0
    isLightboxOpen.value = true
  }
}

const closeModals = () => {
  isLightboxOpen.value = false
  isVideoModalOpen.value = false
  selectedItem.value = null
  activeGalleryIndex.value = 0
}

const nextImage = () => {
  if (!selectedItem.value || !selectedItem.value.gallery?.length) return
  activeGalleryIndex.value = (activeGalleryIndex.value + 1) % selectedItem.value.gallery.length
}

const prevImage = () => {
  if (!selectedItem.value || !selectedItem.value.gallery?.length) return
  activeGalleryIndex.value =
    (activeGalleryIndex.value - 1 + selectedItem.value.gallery.length) %
    selectedItem.value.gallery.length
}

const handleKeyDown = (e) => {
  if (isLightboxOpen.value) {
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'ArrowLeft') prevImage()
    if (e.key === 'Escape') closeModals()
  } else if (isVideoModalOpen.value) {
    if (e.key === 'Escape') closeModals()
  }
}

onMounted(() => {
  isTypingActive = true
  typeText()
  fetchMultimedia()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  isTypingActive = false
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <main class="min-h-screen bg-[#f4f1ea] font-sans text-stone-800">
    <!-- Navbar (Absolute positioned over hero) -->
    <Navbar />

    <!-- Hero Section (Aligned with /about and /our-work) -->
    <section
      class="relative w-full h-[65vh] min-h-[250px] flex items-center justify-center overflow-hidden"
    >
      <!-- Background Image -->
      <div class="absolute inset-0 z-0">
        <img
          src="../assets/about_bg.jpg"
          class="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
          alt="Mekong River Multimedia"
          loading="eager"
          decoding="async"
        />
        <!-- Dark overlay to make text and navbar readable -->
        <div class="absolute inset-0 bg-stone-900/50 mix-blend-multiply"></div>
      </div>

      <!-- Hero Content -->
      <div
        class="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full mt-8 text-center flex flex-col justify-center items-center h-full"
      >
        <!-- Title with Typing Animation -->
        <h1
          class="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-wider flex items-center justify-center min-w-[280px] md:min-w-[500px] mb-6"
          style="text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4)"
        >
          <span
            v-for="(char, i) in displayedText"
            :key="i"
            :class="i >= 5 ? 'text-[#FF5C39]' : 'text-white'"
            style="white-space: pre"
            >{{ char }}</span
          >
          <span class="text-white cursor-blink ml-1 -mt-2">|</span>
        </h1>

        <!-- Subtitle -->
        <p
          class="text-stone-200 text-lg md:text-xl font-medium max-w-3xl leading-relaxed whitespace-pre-line"
          style="text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6)"
        >
          คลังภาพถ่าย วิดีโอ และสื่อสร้างสรรค์ บอกเล่าเรื่องราวสายน้ำ วิถีชุมชน
          และธรรมชาติลุ่มน้ำโขง
        </p>
      </div>

      <!-- Bottom Gradient Blend -->
      <div
        class="absolute bottom-0 left-0 w-full h-12 md:h-24 bg-gradient-to-t from-[#f4f1ea] via-[#f4f1ea]/80 to-transparent z-10 pointer-events-none"
      ></div>
    </section>

    <!-- Main Content Section -->
    <section class="relative z-20 w-full bg-[#f4f1ea] py-16 md:py-24 px-4 md:px-8">
      <div class="max-w-7xl mx-auto flex flex-col gap-10">
        <!-- Header & Description -->
        <div
          class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-300/70 pb-8"
        >
          <div>
            <span class="text-xs md:text-sm uppercase tracking-widest text-[#FF5C39] font-bold"
              >Creative Media & Gallery</span
            >
            <h2
              class="text-3xl md:text-5xl font-black text-stone-900 tracking-tight mt-1 flex items-baseline gap-1"
            >
              MULTIMEDIA GALLERY<span class="text-[#FF5C39] text-4xl md:text-5xl leading-none"
                >.</span
              >
            </h2>
            <p class="text-stone-600 text-base md:text-lg mt-2 max-w-2xl">
              สำรวจเรื่องราวความเคลื่อนไหวผ่านภาพถ่ายคุณภาพสูง อัลบั้มกิจกรรม
              และวิดีโอสารคดีจากเครือข่ายคนฮักแม่น้ำโขง
            </p>
          </div>

          <!-- Quick Stats Pill -->
          <div
            class="flex items-center gap-4 bg-white/80 backdrop-blur-sm border border-stone-200/80 rounded-2xl px-5 py-3 shrink-0 shadow-sm"
          >
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="text-xs font-semibold uppercase tracking-wider text-stone-500"
                >สื่อทั้งหมด</span
              >
            </div>
            <span class="text-xl font-black text-stone-900">{{ mediaItems.length }} ชิ้น</span>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <!-- Filter Tabs -->
          <div
            class="flex items-center gap-2 bg-stone-200/70 p-1.5 rounded-full border border-stone-300/60 w-full sm:w-auto overflow-x-auto"
          >
            <button
              @click="activeFilter = 'all'"
              class="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer"
              :class="
                activeFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              "
            >
              ทั้งหมด (All)
            </button>
            <button
              @click="activeFilter = 'photo'"
              class="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer"
              :class="
                activeFilter === 'photo'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              "
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              ภาพถ่าย (Photos)
            </button>
            <button
              @click="activeFilter = 'video'"
              class="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer"
              :class="
                activeFilter === 'video'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              "
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              วิดีโอ (Videos)
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative w-full sm:w-72">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหาภาพหรือวิดีโอ..."
              class="w-full bg-white/90 border border-stone-300 rounded-full pl-10 pr-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF5C39] focus:border-transparent transition-all shadow-sm"
            />
            <svg
              class="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
          <div
            v-for="n in 6"
            :key="n"
            class="bg-stone-200/60 rounded-3xl h-96 animate-pulse p-4 flex flex-col gap-4"
          >
            <div class="w-full h-48 bg-stone-300 rounded-2xl"></div>
            <div class="h-6 bg-stone-300 rounded-md w-3/4"></div>
            <div class="h-4 bg-stone-300 rounded-md w-full"></div>
            <div class="h-4 bg-stone-300 rounded-md w-1/2 mt-auto"></div>
          </div>
        </div>

        <!-- Media Grid -->
        <div
          v-else-if="filteredItems.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <article
            v-for="(item, index) in filteredItems"
            :key="item.id || index"
            class="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1.5 cursor-pointer"
            @click="openMedia(item)"
          >
            <!-- Media Thumbnail Container -->
            <div class="relative w-full aspect-[16/10] bg-stone-200 overflow-hidden">
              <img
                :src="item.thumbnail"
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />

              <!-- Gradient overlay on thumbnail -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity"
              ></div>

              <!-- Badges (Top) -->
              <div class="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <!-- Category Tag -->
                <span
                  class="bg-black/50 backdrop-blur-md text-white text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20"
                >
                  {{ item.category }}
                </span>

                <!-- Type / Count Badge -->
                <div
                  v-if="item.type === 'video'"
                  class="bg-red-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm"
                >
                  <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>VIDEO</span>
                </div>

                <div
                  v-else
                  class="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/20"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{{ item.gallery?.length || 1 }} รูป</span>
                </div>
              </div>

              <!-- Center Play / Expand Indicator (Hover Effect) -->
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <!-- Video Play Button -->
                <div
                  v-if="item.type === 'video'"
                  class="w-14 h-14 rounded-full bg-[#FF5C39] text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#e04826] transition-all duration-300"
                >
                  <svg class="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>

                <!-- Gallery Expand Icon -->
                <div
                  v-else
                  class="w-12 h-12 rounded-full bg-white/90 text-stone-900 opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
              </div>

              <!-- Location Tag (Bottom on Image) -->
              <div
                v-if="item.location"
                class="absolute bottom-3 left-4 text-xs text-stone-200 flex items-center gap-1 font-medium"
              >
                <svg class="w-3.5 h-3.5 text-[#FF5C39]" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>{{ item.location }}</span>
              </div>
            </div>

            <!-- Card Body & Text Description -->
            <div class="p-6 flex flex-col flex-1">
              <div
                class="flex items-center justify-between text-xs text-stone-400 mb-2 font-medium"
              >
                <span>{{ item.date }}</span>
                <span
                  class="text-[#FF5C39] font-semibold group-hover:underline flex items-center gap-1"
                >
                  {{ item.type === 'video' ? 'รับชมวิดีโอ' : 'ดูอัลบั้มภาพ' }}
                  <span class="text-sm">→</span>
                </span>
              </div>

              <h3
                class="text-lg font-bold text-stone-900 group-hover:text-[#FF5C39] transition-colors line-clamp-2 leading-snug"
              >
                {{ item.title }}
              </h3>

              <!-- Text Description -->
              <p class="text-stone-600 text-sm mt-2.5 line-clamp-3 leading-relaxed flex-1">
                {{ item.description }}
              </p>
            </div>
          </article>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-20 bg-white/50 rounded-3xl border border-stone-200">
          <div
            class="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-stone-800">ไม่พบสื่อที่คุณค้นหา</h3>
          <p class="text-stone-500 text-sm mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูนะครับ</p>
          <button
            @click="searchQuery = ''; activeFilter = 'all'"
            class="mt-4 px-6 py-2 bg-stone-900 text-white text-sm font-semibold rounded-full hover:bg-stone-800 transition cursor-pointer"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      </div>
    </section>

    <!-- LIGHTBOX MODAL: สำหรับดูแกลเลอรี่รูปภาพ (แบบภาพเดี่ยว & หลายรูป) -->
    <div
      v-if="isLightboxOpen && selectedItem"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md transition-opacity duration-300 select-none"
      @click.self="closeModals"
    >
      <!-- Top Bar (Title & Close Button) -->
      <div
        class="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent"
      >
        <div class="text-white max-w-xl">
          <span class="text-xs uppercase tracking-widest text-[#FF5C39] font-bold">{{
            selectedItem.category
          }}</span>
          <h3 class="text-lg md:text-xl font-bold truncate">{{ selectedItem.title }}</h3>
          <div class="text-xs text-stone-400 flex items-center gap-3 mt-0.5">
            <span v-if="selectedItem.location"> {{ selectedItem.location }}</span>
            <span v-if="selectedItem.date"> {{ selectedItem.date }}</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Counter Badge -->
          <div
            class="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-white border border-white/20"
          >
            {{ activeGalleryIndex + 1 }} / {{ selectedItem.gallery?.length || 1 }}
          </div>

          <!-- Close Button -->
          <button
            @click="closeModals"
            class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer border border-white/20"
            title="ปิด (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Main Viewer Area -->
      <div
        class="relative w-full h-full flex flex-col items-center justify-center px-4 md:px-16 pt-20 pb-28"
      >
        <!-- Active Image -->
        <div class="relative max-w-5xl max-h-[68vh] w-full h-full flex items-center justify-center">
          <img
            :src="selectedItem.gallery[activeGalleryIndex]?.url || selectedItem.thumbnail"
            :alt="selectedItem.gallery[activeGalleryIndex]?.title || selectedItem.title"
            class="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-all duration-300"
          />
        </div>

        <!-- Single Photo Caption / Description Box -->
        <div class="mt-4 max-w-3xl text-center px-4">
          <p
            v-if="selectedItem.gallery[activeGalleryIndex]?.title"
            class="text-white text-base md:text-lg font-bold"
          >
            {{ selectedItem.gallery[activeGalleryIndex].title }}
          </p>
          <p class="text-stone-300 text-xs md:text-sm mt-1 leading-relaxed line-clamp-3">
            {{ selectedItem.gallery[activeGalleryIndex]?.description || selectedItem.description }}
          </p>
        </div>

        <!-- Left / Right Navigation Arrows (Show only if multiple images) -->
        <template v-if="selectedItem.gallery?.length > 1">
          <button
            @click.stop="prevImage"
            class="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 border border-white/20 cursor-pointer"
            title="รูปก่อนหน้า (←)"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            @click.stop="nextImage"
            class="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 border border-white/20 cursor-pointer"
            title="รูปถัดไป (→)"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </template>
      </div>

      <!-- Bottom Thumbnail Strip (If multiple images) -->
      <div
        v-if="selectedItem.gallery?.length > 1"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-xl w-full px-4 overflow-x-auto flex items-center justify-center gap-2 z-20 py-2"
      >
        <button
          v-for="(img, idx) in selectedItem.gallery"
          :key="idx"
          @click.stop="activeGalleryIndex = idx"
          class="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer"
          :class="
            activeGalleryIndex === idx
              ? 'border-[#FF5C39] scale-105 shadow-md'
              : 'border-white/30 opacity-50 hover:opacity-100'
          "
        >
          <img :src="img.url" class="w-full h-full object-cover" :alt="img.title" />
        </button>
      </div>
    </div>

    <!-- VIDEO MODAL: สำหรับดูวิดีโอ (Theater Mode) -->
    <div
      v-if="isVideoModalOpen && selectedItem"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8"
      @click.self="closeModals"
    >
      <div
        class="relative w-full max-w-5xl bg-stone-950 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl flex flex-col"
      >
        <!-- Video Header -->
        <div
          class="p-4 md:p-5 flex items-center justify-between border-b border-stone-800 bg-stone-900/80"
        >
          <div class="flex items-center gap-3 truncate pr-4">
            <span
              class="bg-red-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full uppercase"
              >Video</span
            >
            <h3 class="text-white font-bold text-base md:text-lg truncate">
              {{ selectedItem.title }}
            </h3>
          </div>
          <button
            @click="closeModals"
            class="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center transition cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        <!-- Video Player Frame -->
        <div class="relative w-full aspect-video bg-black">
          <iframe
            :src="formatVideoEmbedUrl(selectedItem.videoUrl)"
            class="w-full h-full"
            frameborder="0"
            allow="
              accelerometer;
              autoplay;
              clipboard-write;
              encrypted-media;
              gyroscope;
              picture-in-picture;
            "
            allowfullscreen
            title="Video Player"
          ></iframe>
        </div>

        <!-- Video Details & Text Description -->
        <div class="p-6 md:p-8 bg-stone-900 max-h-56 overflow-y-auto">
          <div class="flex flex-wrap items-center gap-3 text-xs text-stone-400 mb-3 font-medium">
            <span class="text-[#FF5C39] font-bold">{{ selectedItem.category }}</span>
            <span>•</span>
            <span v-if="selectedItem.location"> {{ selectedItem.location }}</span>
            <span v-if="selectedItem.location">•</span>
            <span v-if="selectedItem.date"> {{ selectedItem.date }}</span>
          </div>
          <p class="text-stone-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
            {{ selectedItem.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <Footer />
  </main>
</template>

<style scoped>
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
.cursor-blink {
  animation: blink 1s step-end infinite;
  font-weight: 300;
}
</style>
