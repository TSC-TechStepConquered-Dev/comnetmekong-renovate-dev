<script setup>
import { ref, computed, onMounted } from 'vue'
import { WixBlogRepository } from '../infrastructure/repositories/wix-blog.repository'
import Navbar from '../presentation/components/layout/Navbar.vue'
import Footer from '../presentation/components/layout/Footer.vue'
import { useBlogStore } from '../presentation/stores/blog'

const blogStore = useBlogStore()
const blogRepo = new WixBlogRepository()
const latestBlogs = ref([])
const loadingBlogs = ref(true)

// Pagination state
const currentPage = ref(1)
const itemsPerPage = 3

const paginatedBlogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return latestBlogs.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(latestBlogs.value.length / itemsPerPage)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    scrollToSection()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    scrollToSection()
  }
}

const goToPage = (page) => {
  currentPage.value = page
  scrollToSection()
}

const scrollToSection = () => {
  const section = document.getElementById('latest-stories')
  if (section) {
    // Add offset for the fixed navbar
    const offset = 80
    const bodyRect = document.body.getBoundingClientRect().top
    const elementRect = section.getBoundingClientRect().top
    const elementPosition = elementRect - bodyRect
    const offsetPosition = elementPosition - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

onMounted(async () => {
  latestBlogs.value = await blogStore.fetchLatestBlogs()
  loadingBlogs.value = false
})
</script>

<template>
  <main class="min-h-screen bg-[#f4f1ea] font-sans">
    
    <!-- Navbar (Absolute positioned over hero) -->
    <Navbar />

    <!-- Hero Section -->
    <section class="relative w-full h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      <!-- Background Image (Placeholder river landscape) -->
      <div class="absolute inset-0 z-0">
        <!-- We use an Unsplash image of a river/bay to match the mockup aesthetic -->
        <video 
          src="../assets/vdo/bg_home.mp4" 
          class="w-full h-full object-cover object-center"
          autoplay
          loop
          muted
          playsinline
        ></video>
        <!-- Dark overlay to make text readable, mimicking the mockup -->
        <div class="absolute inset-0 bg-stone-900/40 mix-blend-multiply"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-transparent to-transparent"></div>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full mt-20">
        <div class="max-w-3xl animate-hero-content">
          <!-- Small top labels -->
          <div class="flex items-center gap-3 text-white/80 text-xs md:text-sm font-semibold tracking-widest uppercase mb-4">
            <span>Stories</span>
            <span>•</span>
            <span>People</span>
            <span>•</span>
            <span>Culture</span>
            <span>•</span>
            <span>River</span>
          </div>

          <!-- Main Title -->
          <h1 class="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight mb-6" style="text-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            ชีวิตที่ผูกพัน <br/> กับสายน้ำโขง
          </h1>

          <!-- Subtitle / Description -->
          <p class="text-lg md:text-xl text-white/90 max-w-2xl mb-10 leading-relaxed font-light text-shadow-sm">
            บันทึกเรื่องราวของผู้คน ชุมชน วัฒนธรรม และภูมิปัญญาที่ดำรงอยู่คู่สายน้ำ ผ่านมุมมองของคนในลุ่มน้ำโขง
          </p>

          <!-- CTA Button -->
          <button @click="scrollToSection" class="px-8 py-3 rounded-full border border-white/50 text-white font-medium hover:bg-white/10 hover:border-white transition-all backdrop-blur-sm flex items-center gap-3 group">
            สำรวจเรื่องราว
            <span class="transform group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>

      <!-- Bottom Gradient fading to the next section color (#f4f1ea) -->
      <div class="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#f4f1ea] via-[#FCFBF8]/30 to-transparent z-10 pointer-events-none"></div>
    </section>

    <!-- Featured Story / Team Summary Section -->
    <section class="relative z-20 w-full bg-[#f4f1ea] min-h-screen flex items-center justify-center px-4 md:px-8 py-20">
      <div class="max-w-5xl w-full mx-auto">
        
        <!-- Section Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4" data-aos="fade-up">
          <div>
            <span class="text-stone-500 text-xs font-bold tracking-widest uppercase mb-2 block">
              Featured Story
            </span>
            <h2 class="text-2xl md:text-3xl font-bold text-stone-800">
              สมาคมเครือข่ายสภาองค์กรชุมชนลุ่มน้ำโขง 7 จังหวัดภาคอีสาน (คสช.)
            </h2>
          </div>
          <div class="text-stone-500 text-sm">
            เรื่องราวที่เราอยากชวนคุณทำความรู้จัก
          </div>
        </div>

        <!-- Content Card -->
        <div class="bg-white/60 backdrop-blur-md rounded-3xl p-8 md:p-14 shadow-sm border border-white/50 text-stone-700 leading-relaxed space-y-6 text-base md:text-lg" data-aos="fade-up" data-aos-delay="200">
          <p>
            เราทำงานร่วมกับชุมชนและภาคประชาสังคมเพื่อขับเคลื่อนประเด็นด้านผู้คน ทรัพยากรธรรมชาติ และการพัฒนาที่ยั่งยืนในภูมิภาคลุ่มน้ำโขง เราเชื่อมประสานการทำงานระหว่างชุมชน หน่วยงานท้องถิ่น และเครือข่ายระดับจังหวัด-ลุ่มน้ำ เพื่อสนับสนุนสิทธิชุมชนในการจัดการทรัพยากร เช่น ที่ดินทำกิน ป่า และน้ำ
          </p>
          <p>
            พร้อมสื่อสารข้อมูลให้ชุมชนเข้าใจสิทธิของตนเองและมีส่วนร่วมในการกำหนดอนาคตของพื้นที่อย่างมีพลัง เรารวบรวมและสังเคราะห์ข้อมูลสำคัญเพื่อใช้ประกอบการตัดสินใจ รวมถึงสร้างเนื้อหาที่เข้าถึงคนรุ่นใหม่ นอกจากนี้ เรายังจัดเวทีประชุม เวทีรับฟังความคิดเห็น
          </p>
          <p>
            และกิจกรรมพัฒนาศักยภาพ เพื่อเปิดพื้นที่ให้ทุกคน โดยเฉพาะเยาวชน ได้ร่วมออกแบบแนวทางแก้ปัญหาอย่างสร้างสรรค์และยั่งยืน
          </p>
          <p>
            การทำงานในลุ่มน้ำโขงทำให้เราเห็นความเชื่อมโยงของปัญหาตั้งแต่สภาพภูมิอากาศ การจัดการน้ำ ไปจนถึงเศรษฐกิจชุมชน และมุ่งสร้างการพัฒนาที่คำนึงถึงสิ่งแวดล้อม คุณภาพชีวิต และความเข้มแข็งของชุมชนไปพร้อมๆกัน
          </p>
        </div>

      </div>
    </section>

    <!-- Latest Stories Section -->
    <section id="latest-stories" class="relative z-20 w-full bg-[#f4f1ea] py-24 px-4 md:px-8 border-t border-stone-200">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4" data-aos="fade-up">
          <div>
            <span class="text-stone-500 text-xs font-bold tracking-widest uppercase mb-2 block">
              Latest Stories
            </span>
            <h2 class="text-3xl md:text-4xl font-bold text-stone-800">
              เรื่องราวล่าสุด
            </h2>
          </div>
          <RouterLink to="/blogs" class="text-sm font-medium text-stone-600 hover:text-amber-600 transition-colors flex items-center gap-1 group">
            ดูทั้งหมด 
            <span class="transform group-hover:translate-x-1 transition-transform">→</span>
          </RouterLink>
        </div>

        <p class="text-sm text-stone-500 mb-6" data-aos="fade-up" data-aos-delay="100">พบข่าว {{ latestBlogs.length }} รายการ</p>

        <!-- Loading Skeleton -->
        <div v-if="loadingBlogs" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <RouterLink 
            v-for="(blog, index) in paginatedBlogs" 
            :key="blog.id"
            :to="`/blogs/${blog.id}`"
            class="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col border border-stone-100"
            data-aos="fade-up"
            :data-aos-delay="200 + (index * 100)"
          >
            <div class="relative h-56 md:h-64 overflow-hidden bg-stone-100 flex items-center justify-center">
              <img :src="blog.imageUrl" :alt="blog.title" loading="lazy" decoding="async" class="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700 ease-out">
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

        <!-- Pagination Controls -->
        <div v-if="!loadingBlogs && totalPages > 1" class="flex justify-center items-center gap-2">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="w-10 h-10 rounded-full flex items-center justify-center border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          
          <div class="flex items-center gap-2 px-4">
            <button 
              v-for="page in totalPages" 
              :key="page"
              @click="goToPage(page)"
              class="w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors"
              :class="currentPage === page ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-200'"
            >
              {{ page }}
            </button>
          </div>

          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="w-10 h-10 rounded-full flex items-center justify-center border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

      </div>
    </section>

    <!-- Donors Section (Placeholder for logos) -->
    <section class="max-w-7xl mx-auto px-4 md:px-8 pb-24 relative z-10" data-aos="fade-up">
      <!-- "DONORS." Heading -->
      <div class="text-center mb-8">
        <h2 class="text-4xl md:text-5xl font-extrabold text-stone-900 tracking-widest uppercase drop-shadow-sm flex items-end justify-center gap-1">
          DONORS<span class="text-amber-600 text-5xl leading-none">.</span>
        </h2>
      </div>
      
      <!-- White Card Container -->
      <div class="bg-white rounded-[5px] shadow-lg border border-stone-100 p-8 md:p-12">
        
        <!-- Grid for Logos -->
        <!-- * คุณสามารถนำ <img> และ <a> มาใส่แทนกล่องสีเทาด้านล่างนี้ได้เลยครับ * -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center opacity-60">
          
          <!-- Placeholder 1 -->
          <div class="w-32 md:w-40 lg:w-48 aspect-square bg-stone-100 rounded-[5px] border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-sm">
            Logo 1
          </div>
          <!-- Placeholder 2 -->
          <div class="w-32 md:w-40 lg:w-48 aspect-square bg-stone-100 rounded-[5px] border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-sm">
            Logo 2
          </div>
          <!-- Placeholder 3 -->
          <div class="w-32 md:w-40 lg:w-48 aspect-square bg-stone-100 rounded-[5px] border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-sm">
            Logo 3
          </div>
          <!-- Placeholder 4 -->
          <div class="w-32 md:w-40 lg:w-48 aspect-square bg-stone-100 rounded-[5px] border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-sm">
            Logo 4
          </div>
          <!-- Placeholder 5 -->
          <div class="w-32 md:w-40 lg:w-48 aspect-square bg-stone-100 rounded-[5px] border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-sm">
            Logo 5
          </div>
          <!-- Placeholder 6 -->
          <div class="w-32 md:w-40 lg:w-48 aspect-square bg-stone-100 rounded-[5px] border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-sm">
            Logo 6
          </div>
          <!-- Placeholder 7 -->
          <div class="w-32 md:w-40 lg:w-48 aspect-square bg-stone-100 rounded-[5px] border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-sm">
            Logo 7
          </div>
          <!-- Placeholder 8 -->
          <div class="w-32 md:w-40 lg:w-48 aspect-square bg-stone-100 rounded-[5px] border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-sm">
            Logo 8
          </div>
          <!-- Placeholder 9 -->
          <div class="w-32 md:w-40 lg:w-48 aspect-square bg-stone-100 rounded-[5px] border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-sm">
            Logo 9
          </div>
          <!-- Placeholder 10 -->
          <div class="w-32 md:w-40 lg:w-48 aspect-square bg-stone-100 rounded-[5px] border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-sm">
            Logo 10
          </div>
          <!-- Placeholder 11 -->
          <div class="w-32 md:w-40 lg:w-48 aspect-square bg-stone-100 rounded-[5px] border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-sm">
            Logo 11
          </div>  
          <!-- Placeholder 12 -->
          <div class="w-32 md:w-40 lg:w-48 aspect-square bg-stone-100 rounded-[5px] border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-sm">
            Logo 12
          </div>
          <!-- Placeholder 13 -->
          <div class="w-32 md:w-40 lg:w-48 aspect-square bg-stone-100 rounded-[5px] border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-sm">
            Logo 13
          </div>
          
        </div>

        <p class="text-center text-stone-400 mt-10 text-sm font-medium uppercase tracking-widest">
          Partners & Supporters
        </p>

      </div>
    </section>

    <!-- Footer -->
    <Footer />

  </main>
</template>

<style scoped>
.text-shadow-sm {
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

@keyframes slowFadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-hero-content {
  opacity: 0;
  animation: slowFadeIn 1s ease-out 4s forwards;
}
</style>
