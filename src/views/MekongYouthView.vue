<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { ENV } from '@/config/env'
import { convertWixImageUrl } from '@/utils/wix-image'
import { useHead } from '@vueuse/head'
import { generateSEO } from '@/utils/seo'
import Navbar from '../presentation/components/layout/Navbar.vue'
import Footer from '../presentation/components/layout/Footer.vue'

const textToType = 'HUG MEKONG YOUTH'
const displayedText = ref('')
let isTypingActive = true

useHead({
  title: 'Mekong Youth - COMNETMEKONG',
  meta: generateSEO({
    title: 'Mekong Youth - COMNETMEKONG',
    description: 'กิจกรรมเยาวชนเพื่อการอนุรักษ์ลุ่มน้ำโขง (Mekong Youth)',
    url: 'https://www.comnetmekong.org/mekong-youth'
  })
})

const typeText = async () => {
  while (isTypingActive) {
    displayedText.value = ''

    // Type each character
    for (let i = 0; i < textToType.length; i++) {
      if (!isTypingActive) break
      displayedText.value += textToType[i]
      await new Promise((r) => setTimeout(r, 150)) // typing speed
    }

    if (!isTypingActive) break

    // Hold for 12 seconds
    await new Promise((r) => setTimeout(r, 12000))
  }
}

// Mekong Youth Data Fetching
const youthData = ref([])
const loadingData = ref(true)
const BASE_URL = ENV.WIX_BASE_URL





// Helper: Format text to HTML if it's plain text
const formatDescription = (text) => {
  if (!text) return ''
  if (text.includes('<p') || text.includes('<div') || text.includes('<br')) {
    return text
  }
  return text
    .split('\n')
    .filter((p) => p.trim())
    .map((p) => `<p class="mb-4">${p}</p>`)
    .join('')
}

// Helper: Convert Video URL to Embed URL
const getEmbedUrl = (url) => {
  if (!url) return ''
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname.includes('youtu.be')) {
      let videoId = ''
      if (parsedUrl.hostname.includes('youtu.be')) {
        videoId = parsedUrl.pathname.slice(1)
      } else {
        videoId = parsedUrl.searchParams.get('v')
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
    }
    if (parsedUrl.hostname.includes('vimeo.com')) {
      const videoId = parsedUrl.pathname.split('/').pop()
      return videoId ? `https://player.vimeo.com/video/${videoId}` : ''
    }
    return url // fallback
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return url
  }
}

const fetchData = async () => {
  try {
    // 💡 เตรียม Endpoint '/mekong_youth' ไว้ดึงข้อมูลจาก Wix Data Collection (ต้องไปสร้าง Collection ชื่อ MekongYouth ใน Wix)
    const response = await fetch(`${BASE_URL}/mekong_youth`).catch(() => null)
    if (!response || !response.ok) {
      youthData.value = []
      return
    }
    const result = await response.json()
    const items = result.items || result.data || result

    if (Array.isArray(items) && items.length > 0) {
      const sortedItems = items.sort((a, b) => new Date(a._createdDate || 0) - new Date(b._createdDate || 0))
      youthData.value = sortedItems.map((item) => {
        // ประมวลผล Array รูปภาพ ถ้า Wix ส่งมาเป็น comma-separated หรือ Array
        let parsedGallery = []
        if (Array.isArray(item.gallery)) {
          parsedGallery = item.gallery.map((img) => convertWixImageUrl(img?.src || img))
        } else if (typeof item.gallery === 'string') {
          parsedGallery = item.gallery.split(',').map((img) => convertWixImageUrl(img.trim()))
        }

        return {
          id: item._id,
          title: item.title,
          date: item.date || item._createdDate || '',
          description: formatDescription(item.description),
          videoUrl: getEmbedUrl(item.videoUrl || item.video),
          gallery: parsedGallery,
        }
      })
    } else {
      youthData.value = []
    }
  } catch (error) {
    console.warn('Error fetching mekong youth data', error)
    youthData.value = []
  } finally {
    loadingData.value = false
  }
}

onMounted(() => {
  isTypingActive = true
  typeText()
  fetchData()
})

onUnmounted(() => {
  isTypingActive = false
})
</script>

<template>
  <main class="min-h-screen bg-[#f4f1ea] font-sans">
    <!-- Navbar (Absolute positioned over hero) -->
    <Navbar />

    <!-- Hero Section -->
    <section
      class="relative w-full h-[65vh] min-h-[250px] flex items-center justify-center overflow-hidden"
    >
      <!-- Background Image -->
      <div class="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2000&auto=format&fit=crop"
          class="w-full h-full object-cover object-center"
          alt="Mekong Youth"
          loading="eager"
          decoding="async"
        />
        <div class="absolute inset-0 bg-stone-900/50 mix-blend-multiply"></div>
      </div>

      <!-- Hero Content -->
      <div
        class="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full mt-8 text-center flex justify-center items-center h-full"
      >
        <h1
          class="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-wider flex items-center justify-center min-w-[280px] md:min-w-[450px]"
          style="text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3)"
        >
          <span
            v-for="(char, i) in displayedText"
            :key="i"
            class="text-white"
            style="white-space: pre"
            >{{ char }}</span
          >
          <span class="text-[#FF5C39] cursor-blink ml-1 -mt-2">|</span>
        </h1>
      </div>
      <div
        class="absolute bottom-0 left-0 w-full h-10 md:h-30 bg-gradient-to-t from-[#f4f1ea] via-[#f4f1ea]/200 to-transparent z-10 pointer-events-none"
      ></div>
    </section>

    <!-- Content Section -->
    <section class="relative z-20 w-full bg-[#f4f1ea] py-24 px-4 md:px-8 pb-32">
      <div class="max-w-5xl mx-auto flex flex-col gap-16">
        <!-- Header -->
        <div class="w-full text-center" data-aos="fade-up">
          <h2
            class="text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 tracking-tighter flex justify-center items-baseline gap-1"
          >
            YOUTH ACTIVITIES<span class="text-[#FF5C39] text-5xl leading-none">.</span>
          </h2>
          <p class="text-stone-500 font-medium mt-4 max-w-2xl mx-auto">
            พลังของคนรุ่นใหม่ คือกุญแจสำคัญในการสานต่อและปกป้องทรัพยากรลุ่มน้ำโขงอย่างยั่งยืน
          </p>
        </div>

        <!-- Activities (Loading State) -->
        <div v-if="loadingData" class="space-y-24 mt-8">
          <div
            v-for="i in 2"
            :key="i"
            class="animate-pulse bg-white rounded-3xl p-8 border border-stone-200 shadow-sm"
          >
            <div class="w-1/3 h-8 bg-stone-300 rounded mb-4"></div>
            <div class="w-1/4 h-4 bg-stone-200 rounded mb-8"></div>
            <div class="w-full h-24 bg-stone-200 rounded mb-8"></div>
            <div class="grid grid-cols-2 gap-4">
              <div class="aspect-video bg-stone-300 rounded-2xl"></div>
              <div class="aspect-video bg-stone-300 rounded-2xl"></div>
            </div>
          </div>
        </div>

        <!-- Activities (Data Loaded) -->
        <div v-else class="space-y-20 mt-8">
          <div
            v-for="(item, index) in youthData"
            :key="item.id || index"
            class="bg-white rounded-[40px] p-6 md:p-12 shadow-sm border border-stone-100 hover:shadow-md transition-shadow duration-300"
            data-aos="fade-up"
          >
            <!-- Title & Date -->
            <div class="mb-8 border-b border-stone-100 pb-6">
              <h3 class="text-2xl md:text-3xl font-bold text-stone-900 mb-2">{{ item.title }}</h3>
              <p v-if="item.date" class="text-[#FF5C39] font-medium flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                {{ item.date }}
              </p>
            </div>

            <!-- Description -->
            <div
              class="text-stone-700 leading-relaxed text-base md:text-lg mb-10 text-justify md:text-left break-words overflow-hidden"
            >
              <div v-html="item.description" class="space-y-4"></div>
            </div>

            <!-- Image Gallery -->
            <div v-if="item.gallery && item.gallery.length > 0">
              <h4 class="text-sm font-bold text-stone-400 tracking-widest uppercase mb-4">
                Gallery
              </h4>
              <!-- CSS Grid for Gallery: Dynamically adjusts based on number of images -->
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div
                  v-for="(imgSrc, imgIndex) in item.gallery"
                  :key="imgIndex"
                  class="aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-stone-200 group cursor-pointer"
                >
                  <img
                    :src="imgSrc"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    :alt="`Gallery image ${imgIndex + 1}`"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Video Section (Separated at the bottom) -->
    <section class="relative z-20 w-full bg-white py-24 px-4 md:px-8 border-t border-stone-200">
      <div class="max-w-7xl mx-auto flex flex-col gap-16">
        <!-- Header -->
        <div class="w-full text-center" data-aos="fade-up">
          <h2
            class="text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 tracking-tighter flex justify-center items-baseline gap-1"
          >
            MULTIMEDIA<span class="text-[#FF5C39] text-5xl leading-none">.</span>
          </h2>
          <p class="text-stone-500 font-medium mt-4 max-w-2xl mx-auto">
            วิดีโอและสื่อเคลื่อนไหวจากกิจกรรมของเยาวชนคนรุ่นใหม่
          </p>
        </div>

        <!-- Video Grid -->
        <div v-if="!loadingData" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          <template v-for="(item, index) in youthData" :key="`video-${item.id || index}`">
            <div
              v-if="item.videoUrl"
              class="bg-[#f4f1ea] rounded-3xl p-4 shadow-sm border border-stone-100 hover:shadow-md transition-shadow"
              data-aos="fade-up"
            >
              <div class="aspect-video w-full rounded-2xl overflow-hidden bg-stone-200">
                <iframe
                  :src="item.videoUrl"
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
                  loading="lazy"
                  title="วิดีโอกิจกรรม"
                ></iframe>
              </div>
              <h3 class="text-lg font-bold text-stone-900 mt-4 px-2">{{ item.title }}</h3>
            </div>
          </template>
        </div>
      </div>
    </section>

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
