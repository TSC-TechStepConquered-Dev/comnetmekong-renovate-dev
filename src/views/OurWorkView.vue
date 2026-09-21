<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useHead } from '@vueuse/head'
import Navbar from '../presentation/components/layout/Navbar.vue'
import Footer from '../presentation/components/layout/Footer.vue'
import PdfEbookViewer from '../presentation/components/ui/PdfEbookViewer.vue'

// Typing Animation Logic
const fullText = 'OUR WORKS.'
const displayedText = ref([])
let isTypingActive = false

useHead({
  title: 'งานของเรา - COMNETMEKONG',
  meta: [
    {
      name: 'description',
      content: 'ผลงานและกิจกรรมของเครือข่าย COMNETMEKONG ที่เชื่อมชุมชน รักษาแม่น้ำโขง',
    },
  ],
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

// Our Work Data Fetching
const ourWorkData = ref([])
const loadingData = ref(true)
const BASE_URL = import.meta.env.VITE_WIX_BASE_URL || 'https://www.comnetmekong.org/_functions'

// MOCK DATA for Research
const MOCK_RESEARCH_DATA = [
  {
    id: 1,
    title: 'รายงานการวิจัยความหลากหลายทางชีวภาพลุ่มน้ำโขง',
    agency: 'สถาบันวิจัยทรัพยากรน้ำ',
    description: 'การศึกษาและสำรวจพันธุ์ปลาพื้นเมืองที่เสี่ยงต่อการสูญพันธุ์...',
    image:
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop',
    pdfFile:
      'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
  },
  {
    id: 2,
    title: 'ผลกระทบของการเปลี่ยนแปลงสภาพภูมิอากาศต่อวิถีชีวิตริมโขง',
    agency: 'มหาวิทยาลัยแม่โขง',
    description: 'งานวิจัยระยะยาวเพื่อประเมินความเสี่ยงและแนวทางปรับตัวของชุมชน',
    image:
      'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=800&auto=format&fit=crop',
    pdfFile:
      'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
  },
]

const researchData = ref([])
const loadingResearch = ref(true)
const selectedResearch = ref(null)

// MOCK DATA for Our Work
const MOCK_OUR_WORK_DATA = [
  {
    id: 1,
    title: 'โครงการพัฒนาศักยภาพเยาวชนคนรุ่นใหม่ใส่ใจสื่อสร้างสรรค์',
    agency: 'สำนักงานกองทุนสนับสนุนการสร้างเสริมสุขภาพ (สสส.) (2566-2569)',
    description:
      'โครงการพัฒนาศักยภาพเยาวชนคนรุ่นใหม่ใส่ใจสื่อสร้างสรรค์ - เสริมทักษะเยาวชน 7 จังหวัดริมโขง ผ่านการอบรมและการผลิตสื่อสร้างสรรค์หลากหลายรูปแบบ...',
    image:
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'โครงการพัฒนาศักยภาพเยาวชนฮักแม่น้ำโขง',
    agency: 'Global Fund for Children (2567-ปัจจุบัน)',
    description:
      'เรียนรู้ระบบนิเวศ สำรวจลำน้ำ ปลูกพืช อนุรักษ์สัตว์น้ำ และสร้างสื่อเพื่อการเปลี่ยนแปลง พร้อมเปิดพื้นที่ความรู้ใหม่ให้กับเด็กลุ่มแม่น้ำโขง...',
    image:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 3,
    title:
      'โครงการสื่อสารเชิงนโยบายเพื่อส่งเสริมการอนุรักษ์อย่างมีส่วนร่วมของชุมชนในพื้นที่เชื่อมต่อแม่น้ำโขงและปากชม',
    agency: 'CEPF - กองทุนเพื่อการอนุรักษ์ความหลากหลายทางชีวภาพ (2566-2567)',
    description:
      'สำรวจความหลากหลายทางชีวภาพและระบบนิเวศย่อย โดยนักวิชาการและชุมชนร่วมกันเรียนรู้และวางแผนส่งเสริมแนวทางพัฒนาที่อิงธรรมชาติ ใน 13 ชุมชน...',
    image:
      'https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'โครงการสร้างความร่วมมือสองฝั่งโขงเพื่อการอนุรักษ์ปลาอีสกไทย',
    agency: 'SHOAL - องค์กรอนุรักษ์พันธุ์สัตว์น้ำจืด (2566-2567)',
    description:
      'ร่วมมือไทย-ลาวในการแลกเปลี่ยนข้อมูลการลดลงของปลาอีสกไทย จัดตั้งเขตอนุรักษ์ร่วม และส่งเสริมการมีส่วนร่วมของชุมชนในการอนุรักษ์...',
    image:
      'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 5,
    title:
      'โครงการส่งเสริมการท่องเที่ยวชุมชนอุทยานธรณีผาชันสามพันโบกภายใต้หลักการพัฒนาอย่างยั่งยืน',
    agency: 'EU-UNDP โครงการพัฒนาแห่งสหประชาชาติ (2566-2567)',
    description:
      'โครงการส่งเสริมการท่องเที่ยวชุมชนอุทยานธรณีผาชันสามพันโบกภายใต้หลักการพัฒนาอย่างยั่งยืน...',
    image:
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 6,
    title:
      'โครงการพัฒนาศักยภาพเครือข่ายภาคประชาสังคมเพื่อสร้างการมีส่วนร่วมในการกำหนดอนาคตแม่น้ำโขง',
    agency: 'USAID-WWF องค์การกองทุนสัตว์ป่าโลกสากล (2566-2567)',
    description:
      'สร้างการมีส่วนร่วมเพื่อปกป้องแม่น้ำโขง เชื่อมเครือข่ายองค์กรชุมชนและภาคประชาสังคมทุกระดับ...',
    image:
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop',
  },
]

// Helper: Convert wix:image:// URL to standard https URL
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
  return wixUrl
}

// Helper: Convert wix:document:// URL to standard https URL
const convertWixFileUrl = (wixUrl) => {
  if (!wixUrl) return ''
  if (typeof wixUrl !== 'string') return ''
  if (wixUrl.startsWith('http')) return wixUrl
  if (wixUrl.startsWith('wix:document://v1/')) {
    const urlParts = wixUrl.replace('wix:document://v1/', '').split('/')
    let fileId = urlParts[0]
    if (fileId === 'ugd') {
      fileId = urlParts[1]
    }
    return `https://static.wixstatic.com/ugd/${fileId}`
  }
  return wixUrl
}

// Helper: Strip HTML tags to get plain text for description
const stripHtml = (html) => {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

const fetchData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/our_work`).catch(() => null)
    if (!response || !response.ok) {
      ourWorkData.value = MOCK_OUR_WORK_DATA
      return
    }
    const result = await response.json()
    const items = result.items || result.data || result

    if (Array.isArray(items) && items.length > 0) {
      ourWorkData.value = items.map((item) => ({
        id: item._id,
        title: item.title,
        agency: item.agency || '',
        description: stripHtml(item.description || ''),
        image: convertWixImageUrl(item.image || item.cover || ''),
      }))
    } else {
      ourWorkData.value = MOCK_OUR_WORK_DATA
    }
  } catch (error) {
    console.warn('Error fetching our work data, using mock', error)
    ourWorkData.value = MOCK_OUR_WORK_DATA
  } finally {
    loadingData.value = false
  }
}

const fetchResearchData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/research`).catch(() => null)
    if (!response || !response.ok) {
      researchData.value = MOCK_RESEARCH_DATA
      return
    }
    const result = await response.json()
    const items = result.items || result.data || result

    if (Array.isArray(items) && items.length > 0) {
      researchData.value = items.map((item) => ({
        id: item._id,
        title: item.title,
        agency: item.agency || '',
        description: stripHtml(item.description || ''),
        image: convertWixImageUrl(item.image || item.coverImage || ''),
        pdfFile: convertWixFileUrl(item.pdfFile || ''),
      }))
    } else {
      researchData.value = MOCK_RESEARCH_DATA
    }
  } catch (error) {
    console.warn('Error fetching research data, using mock', error)
    researchData.value = MOCK_RESEARCH_DATA
  } finally {
    loadingResearch.value = false
  }
}

const selectedWork = ref(null)

watch(selectedWork, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'auto'
  }
})

onMounted(() => {
  isTypingActive = true
  typeText()
  fetchData()
  fetchResearchData()
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
        <!-- Using about_bg.jpg or Unsplash placeholder -->
        <img
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2000&auto=format&fit=crop"
          class="w-full h-full object-cover object-center"
          alt="Our Work Background"
          loading="eager"
          decoding="async"
        />
        <!-- Dark overlay to make text readable -->
        <div class="absolute inset-0 bg-stone-900/50 mix-blend-multiply"></div>
      </div>

      <!-- Hero Content -->
      <div
        class="relative z-10 max-w-5xl mx-auto px-4 md:px-8 w-full mt-16 text-center flex flex-col justify-center items-center h-full"
      >
        <h1
          class="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-wider flex items-center justify-center min-w-[280px] md:min-w-[450px] mb-6"
          style="text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3)"
        >
          <span
            v-for="(char, i) in displayedText"
            :key="i"
            :class="i >= 4 ? 'text-[#FF5C39]' : 'text-white'"
            style="white-space: pre"
            >{{ char }}</span
          >
          <span class="text-white cursor-blink ml-1 -mt-2">|</span>
        </h1>
        <p
          class="text-stone-200 text-lg md:text-xl font-medium max-w-3xl leading-relaxed whitespace-pre-line"
          style="text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5)"
        >
          โครงการและกิจกรรมของเครือข่าย COMNETMEKONG ที่เชื่อมชุมชน รักษาแม่น้ำโขง
          และสร้างการเปลี่ยนแปลงอย่างยั่งยืน
        </p>
      </div>
      <div
        class="absolute bottom-0 left-0 w-full h-10 md:h-30 bg-gradient-to-t from-[#f4f1ea] via-[#f4f1ea]/200 to-transparent z-10 pointer-events-none"
      ></div>
    </section>

    <!-- Content Section -->
    <section class="relative z-20 w-full bg-[#f4f1ea] py-16 px-4 md:px-8 pb-32">
      <div class="max-w-7xl mx-auto">
        <!-- Header for Grid (Optional, currently hidden to match design) -->
        <div class="w-full mb-12 hidden">
          <h2
            class="text-3xl md:text-4xl font-black text-stone-900 tracking-tighter border-b-2 border-[#137333]/20 pb-4 inline-block"
          >
            งานของเรา
          </h2>
        </div>

        <!-- Cards (Loading State) -->
        <div
          v-if="loadingData"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8"
        >
          <div
            v-for="i in 6"
            :key="i"
            class="animate-pulse bg-white rounded-3xl p-6 border border-stone-200 shadow-sm"
          >
            <div class="w-full aspect-[4/3] bg-stone-300 rounded-2xl mb-6"></div>
            <div class="w-1/3 h-6 bg-emerald-100 rounded-full mb-4"></div>
            <div class="w-full h-8 bg-stone-200 rounded mb-4"></div>
            <div class="w-2/3 h-8 bg-stone-200 rounded mb-6"></div>
            <div class="w-full h-20 bg-stone-100 rounded"></div>
          </div>
        </div>

        <!-- Cards (Data Loaded) -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
          <div
            v-for="(item, index) in ourWorkData"
            :key="item.id || index"
            class="bg-white rounded-[24px] overflow-hidden shadow-sm border border-stone-200 hover:shadow-md transition-shadow duration-300 flex flex-col group cursor-pointer"
            data-aos="fade-up"
            @click="selectedWork = item"
          >
            <!-- Card Image -->
            <div class="w-full aspect-[16/10] overflow-hidden bg-stone-200 relative">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.title"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <!-- Fallback -->
              <div v-else class="w-full h-full flex items-center justify-center text-stone-400">
                No Image
              </div>
            </div>

            <!-- Card Content -->
            <div class="p-6 md:p-8 flex flex-col flex-grow">
              <!-- Agency Badge -->
              <div class="mb-4">
                <span
                  v-if="item.agency"
                  class="inline-block px-4 py-1.5 bg-[#f0f8f1] text-[#2d6a4f] text-[11px] md:text-xs font-bold rounded-full tracking-wide"
                >
                  {{ item.agency }}
                </span>
              </div>

              <!-- Title -->
              <h3
                class="text-xl md:text-[22px] font-bold text-stone-900 mb-4 leading-snug line-clamp-2"
                :title="item.title"
              >
                "{{ item.title }}"
              </h3>

              <!-- Description -->
              <div
                class="text-stone-600 leading-relaxed text-[15px] line-clamp-3"
                :title="item.description"
              >
                {{ item.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Research Section -->
    <section class="relative z-20 w-full bg-white py-16 px-4 md:px-8 pb-32">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="w-full mb-12 flex justify-between items-end border-b-2 border-stone-100 pb-4">
          <h2 class="text-3xl md:text-4xl font-black text-stone-900 tracking-tighter">
            งานวิจัย <span class="text-[#FF5C39]">.</span>
          </h2>
        </div>

        <!-- Cards (Loading State) -->
        <div
          v-if="loadingResearch"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-8"
        >
          <div
            v-for="i in 4"
            :key="i"
            class="animate-pulse bg-stone-50 rounded-2xl p-4 border border-stone-100 shadow-sm"
          >
            <div class="w-full aspect-[3/4] bg-stone-200 rounded-xl mb-4"></div>
            <div class="w-1/3 h-4 bg-emerald-100 rounded-full mb-3"></div>
            <div class="w-full h-6 bg-stone-200 rounded mb-2"></div>
            <div class="w-2/3 h-6 bg-stone-200 rounded mb-4"></div>
          </div>
        </div>

        <!-- Cards (Data Loaded) -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-8">
          <div
            v-for="(item, index) in researchData"
            :key="item.id || index"
            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer"
            data-aos="fade-up"
            :data-aos-delay="index * 100"
            @click="selectedResearch = item"
          >
            <!-- Card Image (Book Cover style) -->
            <div
              class="w-full aspect-[3/4] overflow-hidden bg-stone-100 relative p-4 flex items-center justify-center border-b border-stone-100"
            >
              <div
                class="w-full h-full relative shadow-[4px_4px_15px_rgba(0,0,0,0.15)] rounded-r-md rounded-l-sm overflow-hidden group-hover:shadow-[8px_8px_20px_rgba(0,0,0,0.2)] transition-shadow"
              >
                <!-- Book spine effect -->
                <div
                  class="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/20 to-transparent z-10"
                ></div>
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.title"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  v-else
                  class="w-full h-full flex flex-col items-center justify-center bg-stone-200 text-stone-400 p-4 text-center"
                >
                  <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    ></path>
                  </svg>
                  <span class="text-xs font-bold uppercase tracking-wider"
                    >Research<br />Document</span
                  >
                </div>
              </div>
            </div>

            <!-- Card Content -->
            <div class="p-5 flex flex-col flex-grow">
              <!-- Agency Badge -->
              <div class="mb-3">
                <span
                  v-if="item.agency"
                  class="inline-block px-3 py-1 bg-[#fff0ed] text-[#FF5C39] text-[10px] md:text-xs font-bold rounded-md tracking-wide"
                >
                  {{ item.agency }}
                </span>
              </div>

              <!-- Title -->
              <h3
                class="text-lg font-bold text-stone-900 mb-2 leading-snug line-clamp-2"
                :title="item.title"
              >
                {{ item.title }}
              </h3>

              <!-- Description -->
              <div class="text-stone-500 text-sm line-clamp-2 mt-auto" :title="item.description">
                {{ item.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Read More Modal -->
    <transition name="modal">
      <div
        v-if="selectedWork"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          @click="selectedWork = null"
        ></div>

        <!-- Modal Content -->
        <div
          class="modal-content relative bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
        >
          <!-- Close Button -->
          <button
            @click="selectedWork = null"
            aria-label="ปิด"
            class="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>

          <!-- Image -->
          <div class="w-full aspect-video sm:aspect-[21/9] bg-stone-200 shrink-0">
            <img
              v-if="selectedWork.image"
              :src="selectedWork.image"
              class="w-full h-full object-cover"
              :alt="selectedWork.title"
            />
          </div>

          <!-- Text Content -->
          <div class="p-6 md:p-10 flex flex-col">
            <div class="mb-6">
              <span
                v-if="selectedWork.agency"
                class="inline-block px-4 py-2 bg-[#f0f8f1] text-[#2d6a4f] text-xs md:text-sm font-bold rounded-full tracking-wide"
              >
                {{ selectedWork.agency }}
              </span>
            </div>

            <h2 class="text-2xl md:text-4xl font-bold text-stone-900 mb-6 leading-snug">
              "{{ selectedWork.title }}"
            </h2>

            <div
              class="text-stone-700 leading-relaxed text-base md:text-lg whitespace-pre-line text-justify md:text-left"
            >
              {{ selectedWork.description }}
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- PdfEbookViewer Modal -->
    <PdfEbookViewer
      v-if="selectedResearch && selectedResearch.pdfFile"
      :pdfUrl="selectedResearch.pdfFile"
      @close="selectedResearch = null"
    />

    <!-- Fallback if no PDF provided for research -->
    <transition name="modal">
      <div
        v-if="selectedResearch && !selectedResearch.pdfFile"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      >
        <div
          class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          @click="selectedResearch = null"
        ></div>
        <div
          class="modal-content relative bg-white rounded-3xl w-full max-w-lg p-8 text-center shadow-2xl flex flex-col items-center"
        >
          <button
            @click="selectedResearch = null"
            class="absolute top-4 right-4 text-stone-400 hover:text-stone-900"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
          <svg
            class="w-16 h-16 text-stone-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
          <h3 class="text-xl font-bold mb-2">ไม่พบไฟล์เอกสาร</h3>
          <p class="text-stone-500">งานวิจัยนี้ยังไม่มีไฟล์ PDF ให้เปิดอ่านในขณะนี้</p>
          <button
            @click="selectedResearch = null"
            class="mt-6 px-6 py-2 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </transition>

    <!-- Footer -->
    <Footer />
  </main>
</template>

<style scoped>
/* Optional custom styles */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cursor-blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
