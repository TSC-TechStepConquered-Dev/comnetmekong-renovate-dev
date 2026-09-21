<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs'
import { PageFlip } from 'page-flip'

// Set worker source for pdfjs
import pdfWorkerURL from 'pdfjs-dist/build/pdf.worker.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerURL

const props = defineProps({
  pdfUrl: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close'])

const containerRef = ref(null)
const flipbookRef = ref(null)
const isLoading = ref(true)
const loadingProgress = ref(0)
const error = ref(null)
const totalPages = ref(0)
const currentPage = ref(1)
const inputPage = ref(1)
const zoomLevel = ref(1)

let pageFlip = null
let pdfDocument = null
const renderedPages = ref([])

const loadPdf = async () => {
  try {
    isLoading.value = true
    error.value = null
    loadingProgress.value = 0

    const loadingTask = pdfjsLib.getDocument({ url: props.pdfUrl })

    loadingTask.onProgress = (progress) => {
      if (progress.total > 0) {
        loadingProgress.value = Math.round((progress.loaded / progress.total) * 100)
      }
    }

    pdfDocument = await loadingTask.promise
    totalPages.value = pdfDocument.numPages

    // We will render all pages into canvases
    const pages = []
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push({ pageNum: i })
    }
    renderedPages.value = pages

    // Wait for DOM to update with page elements
    await nextTick()

    // Render canvases
    for (let i = 1; i <= totalPages.value; i++) {
      await renderPage(i)
    }

    initFlipbook()
  } catch (err) {
    console.error('Error loading PDF:', err)
    error.value = 'ไม่สามารถโหลดไฟล์ PDF ได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isLoading.value = false
  }
}

const renderPage = async (pageNum) => {
  const page = await pdfDocument.getPage(pageNum)
  const canvas = document.getElementById(`pdf-page-${pageNum}`)
  if (!canvas) return

  const ctx = canvas.getContext('2d')

  // Calculate scale to fit container width/height
  const containerWidth = flipbookRef.value.clientWidth / 2 // 2 pages visible
  const containerHeight = flipbookRef.value.clientHeight

  const unscaledViewport = page.getViewport({ scale: 1 })
  const scale =
    Math.min(containerWidth / unscaledViewport.width, containerHeight / unscaledViewport.height) *
    1.5 // Multiplier for better resolution

  const viewport = page.getViewport({ scale })

  // Set actual canvas size based on device pixel ratio for sharpness
  const dpr = window.devicePixelRatio || 1
  canvas.width = viewport.width * dpr
  canvas.height = viewport.height * dpr

  // Set CSS size to match intended size
  canvas.style.width = '100%'
  canvas.style.height = '100%'

  ctx.scale(dpr, dpr)

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport,
  }

  await page.render(renderContext).promise
}

const initFlipbook = () => {
  if (pageFlip) {
    pageFlip.destroy()
  }

  const containerWidth = flipbookRef.value.clientWidth
  const containerHeight = flipbookRef.value.clientHeight

  pageFlip = new PageFlip(flipbookRef.value, {
    width: Math.floor(containerWidth / 2),
    height: containerHeight,
    size: 'stretch',
    minWidth: 300,
    maxWidth: 1000,
    minHeight: 400,
    maxHeight: 1200,
    maxShadowOpacity: 0.5,
    showCover: true,
    mobileScrollSupport: false,
    usePortrait: true,
  })

  // Get all page elements
  const pages = document.querySelectorAll('.page-wrapper')
  if (pages.length > 0) {
    pageFlip.loadFromHTML(pages)

    pageFlip.on('flip', (e) => {
      currentPage.value = e.data + 1
      inputPage.value = e.data + 1
    })
  }
}

const goToPage = () => {
  if (!pageFlip) return
  let target = parseInt(inputPage.value)
  if (isNaN(target)) target = 1
  if (target < 1) target = 1
  if (target > totalPages.value) target = totalPages.value
  
  // page-flip is 0-indexed
  pageFlip.turnToPage(target - 1)
  inputPage.value = target
}

const zoomIn = () => {
  if (zoomLevel.value < 3) zoomLevel.value += 0.25
}

const zoomOut = () => {
  if (zoomLevel.value > 0.5) zoomLevel.value -= 0.25
}

const handleKeydown = (e) => {
  // Ignore if typing in input
  if (e.target.tagName === 'INPUT') return
  if (e.key === 'ArrowRight') {
    nextPage()
  } else if (e.key === 'ArrowLeft') {
    prevPage()
  }
}

const nextPage = () => {
  if (pageFlip) pageFlip.turnToNextPage()
}

const prevPage = () => {
  if (pageFlip) pageFlip.turnToPrevPage()
}

onMounted(() => {
  if (props.pdfUrl) {
    loadPdf()
  }

  // Handle resize
  window.addEventListener('resize', () => {
    if (pageFlip) {
      pageFlip.update()
    }
  })
  
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  if (pageFlip) {
    pageFlip.destroy()
  }
  window.removeEventListener('keydown', handleKeydown)
})

watch(
  () => props.pdfUrl,
  (newUrl) => {
    if (newUrl) {
      loadPdf()
    }
  },
)
</script>

<template>
  <div
    class="fixed inset-0 z-[200] bg-stone-900/90 backdrop-blur-md flex flex-col items-center justify-center font-sans"
  >
    <!-- Top Bar (Close button only) -->
    <div
      class="absolute top-0 right-0 p-4 z-[210]"
    >
      <button
        @click="emit('close')"
        class="w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm flex-shrink-0"
        aria-label="ปิด"
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
    </div>

    <!-- Main Content Area -->
    <div
      class="relative w-full max-w-6xl h-[80vh] flex items-center justify-center px-4 md:px-12 mt-8"
      ref="containerRef"
    >
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="absolute inset-0 flex flex-col items-center justify-center text-white z-10"
      >
        <div
          class="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"
        ></div>
        <div class="text-lg font-medium">กำลังโหลด E-book...</div>
        <div class="text-sm text-stone-300 mt-2">{{ loadingProgress }}%</div>
      </div>

      <!-- Error State -->
      <div
        v-if="error"
        class="absolute inset-0 flex flex-col items-center justify-center text-white z-10"
      >
        <svg
          class="w-16 h-16 text-red-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          ></path>
        </svg>
        <div class="text-lg font-medium">{{ error }}</div>
      </div>

      <!-- Flipbook Container -->
      <div
        ref="flipbookRef"
        class="w-full h-full relative transition-transform duration-300 ease-out"
        :class="{ 'opacity-0': isLoading || error }"
        :style="{ transform: `scale(${zoomLevel})` }"
      >
        <!-- Pages to be loaded into page-flip -->
        <div
          v-for="page in renderedPages"
          :key="page.pageNum"
          class="page-wrapper bg-white shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <div class="page-content w-full h-full flex items-center justify-center bg-white">
            <canvas
              :id="`pdf-page-${page.pageNum}`"
              class="max-w-full max-h-full object-contain"
            ></canvas>
          </div>
        </div>
      </div>

      <!-- Controls -->

    </div>

    <!-- Bottom Controls -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-4 bg-black/60 px-4 md:px-6 py-2 md:py-3 rounded-full backdrop-blur-md z-[210] shadow-xl">
      <!-- Prev Button -->
      <button v-if="!isLoading && !error" @click="prevPage" class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors flex-shrink-0" aria-label="Previous Page" title="หน้าก่อนหน้า">
        <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
      </button>
      
      <!-- Page Input -->
      <div class="flex items-center gap-1 md:gap-2 text-white text-sm md:text-base font-medium drop-shadow-md">
        <span class="hidden sm:inline">หน้า</span>
        <input 
          type="number" 
          v-model="inputPage" 
          @keyup.enter="goToPage"
          @blur="goToPage"
          min="1" 
          :max="totalPages"
          class="w-12 h-8 text-center bg-white/20 border border-white/30 rounded text-white focus:outline-none focus:border-white focus:bg-white/30 appearance-none transition-colors"
          :disabled="isLoading || error"
        />
        <span class="hidden sm:inline">จาก {{ totalPages }}</span>
        <span class="sm:hidden">/ {{ totalPages }}</span>
      </div>
      
      <!-- Next Button -->
      <button v-if="!isLoading && !error" @click="nextPage" class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors flex-shrink-0" aria-label="Next Page" title="หน้าถัดไป">
        <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
      </button>
      
      <div class="w-px h-6 bg-white/20 mx-1"></div>
      
      <!-- Zoom Controls -->
      <div v-if="!isLoading && !error" class="flex items-center gap-1">
        <button @click="zoomOut" class="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors" aria-label="Zoom out" title="ซูมออก">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path></svg>
        </button>
        <span class="text-white text-xs font-medium w-10 text-center">{{ Math.round(zoomLevel * 100) }}%</span>
        <button @click="zoomIn" class="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors" aria-label="Zoom in" title="ซูมเข้า">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page flip requires specific styles for the pages */
.page-wrapper {
  background-color: white;
  border: 1px solid #e5e5e5;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
}

/* Add a subtle gradient to look like a real page crease */
.page-wrapper:nth-child(even) {
  background: linear-gradient(to right, #f4f4f4 0%, #ffffff 5%, #ffffff 100%);
}

.page-wrapper:nth-child(odd) {
  background: linear-gradient(to left, #f4f4f4 0%, #ffffff 5%, #ffffff 100%);
}

.page-wrapper.--left {
  border-right: 0;
  box-shadow: inset -7px 0 30px -7px rgba(0, 0, 0, 0.4);
}

.page-wrapper.--right {
  border-left: 0;
  box-shadow: inset 7px 0 30px -7px rgba(0, 0, 0, 0.4);
}

/* Hide number input arrows */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>
