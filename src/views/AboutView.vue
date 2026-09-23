<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { ENV } from '@/config/env'
import { convertWixImageUrl } from '@/utils/wix-image'
import { useHead } from '@vueuse/head'
import { generateSEO } from '@/utils/seo'
import Navbar from '../presentation/components/layout/Navbar.vue'
import Footer from '../presentation/components/layout/Footer.vue'

const fullText = 'ABOUT US.'
const displayedText = ref([])
let isTypingActive = false

useHead({
  title: 'เกี่ยวกับเรา - COMNETMEKONG',
  meta: generateSEO({
    title: 'เกี่ยวกับเรา - COMNETMEKONG',
    description: 'เรียนรู้เกี่ยวกับความเป็นมาและพันธกิจของเครือข่าย COMNETMEKONG',
    url: 'https://www.comnetmekong.org/about',
  }),
})

const typeText = async () => {
  if (!isTypingActive) return

  displayedText.value = []

  // Type text
  for (let i = 0; i < fullText.length; i++) {
    if (!isTypingActive) return
    displayedText.value.push(fullText[i])
    await new Promise((resolve) => setTimeout(resolve, 150))
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

// Staff Data Fetching
const staffs = ref([])
const loadingStaff = ref(true)
const BASE_URL = ENV.WIX_BASE_URL

const fetchStaff = async () => {
  try {
    // กำหนดให้ดึงข้อมูลจาก endpoint /staff ที่เดี๋ยวคุณต้องไปสร้างใน Wix
    const response = await fetch(`${BASE_URL}/staff`).catch(() => null)
    if (!response || !response.ok) {
      staffs.value = []
      return
    }
    const result = await response.json()
    const items = result.items || result.data || result

    if (Array.isArray(items) && items.length > 0) {
      const sortedItems = items.sort(
        (a, b) => new Date(a._createdDate || 0) - new Date(b._createdDate || 0),
      )
      staffs.value = sortedItems.map((item) => ({
        id: item._id,
        name: item.name,
        role: item.role,
        image:
          item.image ||
          item.photo ||
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=250&auto=format&fit=crop',
        email: item.email || item.contact || '#',
      }))
    } else {
      staffs.value = []
    }
  } catch (error) {
    console.warn('Error fetching staff', error)
    staffs.value = []
  } finally {
    loadingStaff.value = false
  }
}

// Our Work Data Fetching
const ourWorks = ref([])
const loadingOurWorks = ref(true)

// Helper: Convert wix:image:// URL to standard https URL

// Helper: Format text to HTML if it's plain text
const formatDescription = (text) => {
  if (!text) return ''
  // ถ้าข้อมูลจาก Wix เป็น HTML (Rich Text) อยู่แล้ว ให้คืนค่าเลย
  if (text.includes('<p') || text.includes('<div') || text.includes('<br')) {
    return text
  }
  // ถ้าเป็น Text ธรรมดาที่เคาะบรรทัด ให้ครอบด้วย <p>
  return text
    .split('\n')
    .filter((p) => p.trim())
    .map((p) => `<p class="mb-4">${p}</p>`)
    .join('')
}

const fetchOurWork = async () => {
  try {
    const response = await fetch(`${BASE_URL}/about_works`).catch(() => null)
    if (!response || !response.ok) {
      ourWorks.value = []
      return
    }
    const result = await response.json()
    const items = result.items || result.data || result

    if (Array.isArray(items) && items.length > 0) {
      // เรียงตาม index อัตโนมัติ (เช่น '01', '02')
      const sortedItems = items.sort((a, b) => (a.index || '').localeCompare(b.index || ''))

      ourWorks.value = sortedItems.map((item) => ({
        id: item._id,
        index: item.index || '00',
        category: item.category || 'Initiative',
        title: item.title,
        description: formatDescription(item.description),
        quoteText: item.quoteText || '',
        quoteAuthor: item.quoteAuthor || '',
        image1: convertWixImageUrl(item.image1 || item.image || ''),
        image2: convertWixImageUrl(item.image2 || ''),
      }))
    } else {
      ourWorks.value = []
    }
  } catch (error) {
    console.warn('Error fetching our works', error)
    ourWorks.value = []
  } finally {
    loadingOurWorks.value = false
  }
}

onMounted(() => {
  isTypingActive = true
  typeText()
  fetchStaff()
  fetchOurWork()
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
        <!-- Using a placeholder image that matches the river aesthetic -->
        <img
          src="../assets/about_bg.avif"
          class="w-full h-full object-cover object-center"
          alt="Mekong River"
          loading="eager"
          decoding="async"
        />
        <!-- Dark overlay to make text and navbar readable -->
        <div class="absolute inset-0 bg-stone-900/40 mix-blend-multiply"></div>
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
            :class="i === 5 || i === 6 ? 'text-[#FF5C39]' : 'text-white'"
            style="white-space: pre"
            >{{ char }}</span
          >
          <span class="text-white cursor-blink ml-1 -mt-2">|</span>
        </h1>
      </div>
      <div
        class="absolute bottom-0 left-0 w-full h-10 md:h-30 bg-gradient-to-t from-[#f4f1ea] via-[#f4f1ea]/200 to-transparent z-10 pointer-events-none"
      ></div>
    </section>

    <!-- Mission Content Section -->
    <section class="relative z-20 w-full bg-[#f4f1ea] py-24 px-4 md:px-8">
      <div class="max-w-5xl mx-auto flex flex-col gap-8 lg:gap-12">
        <!-- Top: MISSION Header -->
        <div class="w-full flex flex-col md:flex-row md:items-baseline md:gap-4" data-aos="fade-up">
          <h2
            class="text-4xl md:text-5xl lg:text-7xl font-black text-stone-900 tracking-tighter flex items-baseline gap-1"
          >
            MISSION<span class="text-[#FF5C39] text-5xl md:text-6xl leading-none">.</span>
          </h2>
          <p class="text-stone-600 font-medium text-lg mt-1 md:mt-0">Since 2009</p>
        </div>

        <!-- Bottom: Mission Text -->
        <div
          class="w-full text-stone-700 leading-relaxed space-y-6 text-base md:text-lg text-justify md:text-left"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <p>
            The association has been working to enhance the capacity of the Mekong people,
            communities, and member organizations to be able to ① conduct a Participatory Action
            Research (PAR) for community-based natural resources management, ② to disseminate all
            activities through campaigns and mass media for public learning, and ③ to be able to
            collaborate with CSOs, GOs, and private sectors to protect environmental and natural
            resources affected from man-made operations in the Mekong River basin and its
            tributaries.
          </p>
          <p>
            Until the present day, more than 1,333 community groups and nine based network
            organizations council from the seven Northeastern provinces had been developing
            continuously.
          </p>
          <p>
            ComNetMekong together with CSOs, academic institutes, GOs and private sectors are deeply
            studying on the impacts that affect the Mekong ecological system, people and culture, in
            which mainly caused by having too many hydropower dams on the Mekong mainstream.
          </p>
        </div>
      </div>
    </section>

    <!-- Our Work Section -->
    <section class="relative z-20 w-full bg-[#f4f1ea] py-12 px-4 md:px-8 pb-32">
      <div class="max-w-5xl mx-auto flex flex-col gap-12 lg:gap-16">
        <!-- Top: OUR WORK Header -->
        <div class="w-full" data-aos="fade-up">
          <h2
            class="text-4xl md:text-5xl lg:text-7xl font-black text-stone-900 tracking-tighter flex items-baseline gap-1"
          >
            OUR WORK<span class="text-[#FF5C39] text-5xl md:text-6xl leading-none">.</span>
          </h2>
        </div>

        <!-- Bottom: Timeline Content -->
        <div class="w-full relative mt-4">
          <!-- Vertical Line -->
          <div class="absolute left-[11px] top-4 bottom-0 w-[2px] bg-[#FF5C39]/30"></div>

          <!-- Timeline Items (Loading State) -->
          <div v-if="loadingOurWorks" class="space-y-24">
            <div v-for="i in 2" :key="i" class="relative pl-10 md:pl-12 animate-pulse">
              <div
                class="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-stone-300 border-[5px] border-[#f4f1ea]"
              ></div>
              <div class="w-32 h-4 bg-stone-300 rounded mb-3"></div>
              <div class="w-2/3 h-8 bg-stone-300 rounded mb-6"></div>
              <div class="w-full h-24 bg-stone-300 rounded mb-8"></div>
              <div class="aspect-[21/9] bg-stone-300 rounded-2xl"></div>
            </div>
          </div>

          <!-- Timeline Items (Data Loaded) -->
          <div v-else class="space-y-24">
            <div
              v-for="(item, index) in ourWorks"
              :key="item.id || index"
              class="relative pl-10 md:pl-12"
              data-aos="fade-up"
            >
              <!-- Dot -->
              <div
                class="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-[#FF5C39] border-[5px] border-[#f4f1ea]"
              ></div>

              <h3 class="text-sm font-bold text-[#FF5C39] tracking-widest uppercase mb-3">
                {{ item.index }} &bull; {{ item.category }}
              </h3>
              <h4 class="text-2xl md:text-3xl font-bold text-stone-900 mb-6 leading-tight">
                {{ item.title }}
              </h4>

              <div
                class="text-stone-700 leading-relaxed space-y-6 text-base md:text-lg mb-8 text-justify md:text-left break-words overflow-hidden"
              >
                <!-- Rich Text Content -->
                <div v-html="item.description" class="space-y-4"></div>

                <!-- Blockquote -->
                <blockquote
                  v-if="item.quoteText"
                  class="pl-6 border-l-4 border-amber-500 italic text-stone-600 bg-stone-100/50 py-4 pr-4 rounded-r-lg"
                >
                  "{{ item.quoteText }}"
                  <footer v-if="item.quoteAuthor" class="text-sm text-stone-500 mt-2 font-medium">
                    — {{ item.quoteAuthor }}
                  </footer>
                </blockquote>
              </div>

              <!-- Images Section -->
              <!-- Case: 2 Images -->
              <div v-if="item.image1 && item.image2" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-200">
                  <img
                    :src="item.image1"
                    class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    :alt="`${item.title} image 1`"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-200">
                  <img
                    :src="item.image2"
                    class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    :alt="`${item.title} image 2`"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
              <!-- Case: 1 Image -->
              <div
                v-else-if="item.image1 || item.image2"
                class="aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden bg-stone-200"
              >
                <img
                  :src="item.image1 || item.image2"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  :alt="item.title"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Staff Section -->
    <section class="relative z-20 w-full bg-[#f4f1ea] py-12 px-4 md:px-8 pb-32">
      <div
        class="max-w-7xl mx-auto bg-white rounded-[40px] p-8 md:p-16 shadow-sm border border-stone-100"
      >
        <!-- Section Header -->
        <div class="text-center mb-16" data-aos="fade-up">
          <h2
            class="text-3xl md:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight flex justify-center items-baseline gap-1"
          >
            COMNETMEKONG STAFF<span class="text-[#FF5C39] text-4xl leading-none">.</span>
          </h2>
          <p class="text-stone-500 font-medium text-sm md:text-base mt-3">
            Dedicated advocates, coordinators & researchers
          </p>
        </div>

        <!-- Staff Grid (Loading State) -->
        <div v-if="loadingStaff" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="i in 4"
            :key="i"
            class="bg-white border border-[#f4f1ea] rounded-3xl p-8 flex flex-col items-center text-center animate-pulse"
          >
            <div class="w-28 h-28 rounded-full bg-stone-200 mb-6 border-4 border-[#f4f1ea]"></div>
            <div class="h-4 w-3/4 bg-stone-200 rounded mb-2"></div>
            <div class="h-3 w-1/2 bg-stone-200 rounded mb-6"></div>
            <div class="h-5 w-5 bg-stone-200 rounded mt-auto"></div>
          </div>
        </div>

        <!-- Staff Grid (Data Loaded) -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(staff, index) in staffs"
            :key="staff.id"
            class="bg-white border border-[#f4f1ea] rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            data-aos="fade-up"
            :data-aos-delay="100 + index * 100"
          >
            <div
              class="w-28 h-28 rounded-full overflow-hidden mb-6 border-4 border-[#f4f1ea] shadow-sm"
            >
              <img
                :src="staff.image"
                class="w-full h-full object-cover"
                :alt="staff.name"
                loading="lazy"
                decoding="async"
              />
            </div>
            <h3 class="text-lg font-bold text-stone-900 mb-1">{{ staff.name }}</h3>
            <p class="text-stone-500 text-xs font-medium mb-6">{{ staff.role }}</p>
            <a
              v-if="staff.email && staff.email !== '#'"
              :href="`mailto:${staff.email}`"
              class="flex items-center justify-center gap-2 text-stone-400 hover:text-[#FF5C39] transition-colors mt-auto text-sm w-full"
            >
              <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"
                />
              </svg>
              <span class="truncate">{{ staff.email }}</span>
            </a>
          </div>
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
