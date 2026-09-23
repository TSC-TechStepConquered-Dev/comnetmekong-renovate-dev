<script setup>
import { onMounted, ref } from 'vue'
import { ENV } from '@/config/env'
import { useHead } from '@vueuse/head'
import { generateSEO } from '@/utils/seo'
import Navbar from '../presentation/components/layout/Navbar.vue'
import Footer from '../presentation/components/layout/Footer.vue'

useHead({
  title: 'การบริจาค - COMNETMEKONG',
  meta: generateSEO({
    title: 'การบริจาค - COMNETMEKONG',
    description: 'ร่วมสนับสนุนการทำงานของสมาคมเครือข่ายสภาองค์กรชุมชนลุ่มน้ำโขง',
    url: 'https://www.comnetmekong.org/donate'
  })
})

const fullText = 'DONATE.'
const displayedText = ref([])
let isTypingActive = false

const typeText = async () => {
  if (!isTypingActive) return
  
  displayedText.value = []
  
  for (let i = 0; i < fullText.length; i++) {
    if (!isTypingActive) return
    displayedText.value.push(fullText[i])
    await new Promise(resolve => setTimeout(resolve, 150))
  }

  await new Promise(resolve => setTimeout(resolve, 3000))
  
  for (let i = fullText.length; i > 0; i--) {
    if (!isTypingActive) return
    displayedText.value.pop()
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  await new Promise(resolve => setTimeout(resolve, 500))
  
  if (isTypingActive) {
    typeText()
  }
}

import { onUnmounted } from 'vue'

const BASE_URL = ENV.WIX_BASE_URL

const donateInfo = ref({
  promptpay: '',
  accountName: '',
  bankName: '',
  accountNumber: '',
  qrCodeImage: '',
  orgName: ''
})

const form = ref({
  name: '',
  email: '',
  phone: '',
  message: '',
  slipImageBase64: ''
})

const slipPreview = ref('')
const isSubmitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref('')

const fetchDonateInfo = async () => {
  try {
    const res = await fetch(`${BASE_URL}/donate_info`).catch(() => null)
    if (res && res.ok) {
      const result = await res.json()
      if (result.data) {
        donateInfo.value = { ...donateInfo.value, ...result.data }
      }
    }
  } catch (error) {
    console.error('Error fetching donate info:', error)
  }
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  if (file.size > 10 * 1024 * 1024) {
    alert('ไฟล์มีขนาดใหญ่เกิน 10MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    slipPreview.value = event.target.result
    form.value.slipImageBase64 = event.target.result
  }
  reader.readAsDataURL(file)
}

const removeSlip = () => {
  slipPreview.value = ''
  form.value.slipImageBase64 = ''
}

const submitDonation = async () => {
  isSubmitting.value = true
  submitSuccess.value = false
  submitError.value = ''

  try {
    const res = await fetch(`${BASE_URL}/submit_donation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })
    
    if (res.ok) {
      submitSuccess.value = true
      form.value = { name: '', email: '', phone: '', message: '', slipImageBase64: '' }
      slipPreview.value = ''
    } else {
      const errorData = await res.json().catch(() => ({}))
      submitError.value = errorData.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล'
    }
  } catch (error) {
    console.error('Error submitting donation:', error)
    submitError.value = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  isTypingActive = true
  typeText()
  fetchDonateInfo()
})

onUnmounted(() => {
  isTypingActive = false
})
</script>

<template>
  <main class="min-h-screen bg-[#f4f1ea] font-sans text-stone-800">
    <!-- Navbar -->
    <Navbar />

    <!-- Hero Section -->
    <section class="relative w-full h-[65vh] min-h-[250px] flex items-center justify-center overflow-hidden">
      <!-- Background Image -->
      <div class="absolute inset-0 z-0">
        <!-- Using a placeholder image that matches the aesthetic -->
        <img 
          src="../assets/about_bg.avif" 
          alt="Mekong River" 
          class="w-full h-full object-cover brightness-[0.55]"
        />
        <div class="absolute inset-0 bg-black/40"></div>
        

      </div>

      <!-- Hero Content -->
      <div class="relative z-20 text-center px-4 mt-16">
        <h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter uppercase drop-shadow-lg">
          <span class="inline-block min-w-[280px] md:min-w-[400px]">
            {{ displayedText.join('') }}<span class="animate-pulse">_</span>
          </span>
        </h1>
      </div>
      <div class="absolute bottom-0 left-0 w-full h-10 md:h-30 bg-gradient-to-t from-[#f4f1ea] via-[#f4f1ea]/80 to-transparent z-10 pointer-events-none"></div>
    </section>

    <!-- Content -->
    <div class="pt-12 pb-16 px-4 md:px-8 max-w-7xl mx-auto relative z-30">
      
      <!-- Sub Title -->
      <div class="text-center mb-12">
        <h2 class="text-2xl md:text-4xl font-bold font-serif mb-3 text-[#332f2c]">บริจาคเพื่อแม่น้ำโขง</h2>
        <p class="text-stone-500 text-sm md:text-base max-w-2xl mx-auto">
          สนับสนุนการทำงานของสมาคมเครือข่ายสภาองค์กรชุมชนลุ่มน้ำโขง 7 จังหวัดภาคอีสาน (คสช.)
        </p>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 md:gap-10 items-start">
        
        <!-- Left Column: Bank & QR Code -->
        <div class="space-y-6">
          <!-- QR Code Card -->
          <div class="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm flex flex-col items-center text-center">
            <h2 class="text-xl md:text-2xl font-bold mb-2">สแกน QR Code เพื่อบริจาค</h2>
            <p class="text-stone-500 text-sm mb-8">รองรับ PromptPay และแอปธนาคารทุกแห่ง</p>

            <div class="w-56 h-56 md:w-72 md:h-72 bg-white border-2 border-stone-100 rounded-3xl p-4 flex items-center justify-center mb-6 overflow-hidden">
              <img 
                v-if="donateInfo.qrCodeImage" 
                :src="donateInfo.qrCodeImage" 
                alt="PromptPay QR Code" 
                class="w-full h-full object-contain"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-stone-50 rounded-2xl">
                <!-- Fallback QR icon -->
                <svg class="w-24 h-24 text-stone-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h8v8H3zM5 5v4h4V5zM13 3h8v8h-8zM15 5v4h4V5zM3 13h8v8H3zM5 15v4h4v-4zM18 13h3v3h-3zM13 18h3v3h-3zM15 15h3v3h-3zM18 18h3v3h-3zM13 13h3v3h-3z" />
                </svg>
              </div>
            </div>

            <h3 class="font-bold text-lg uppercase tracking-wider mb-2">{{ donateInfo.orgName || 'COMNETMEKONG' }}</h3>
            <p class="text-stone-600 text-sm font-medium">PromptPay: <span class="font-bold">{{ donateInfo.promptpay }}</span></p>
            <p class="text-stone-500 text-xs mt-2 max-w-[80%] mx-auto">{{ donateInfo.accountName }}</p>

            <div class="flex items-center gap-2 mt-8 text-stone-500 text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>สแกนได้ตลอด 24 ชั่วโมง</span>
            </div>
          </div>

          <!-- Bank Details Card -->
          <div class="bg-[#ebe6db] border border-stone-200/50 rounded-[2rem] p-6 md:p-8 flex flex-col gap-5 shadow-sm">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-stone-700" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3 class="font-bold text-stone-800">โอนผ่านธนาคาร</h3>
            </div>
            
            <div class="flex justify-between items-end border-b border-stone-300/50 pb-3">
              <span class="text-sm text-stone-500 font-medium">ธนาคาร</span>
              <span class="text-sm font-bold text-stone-800">{{ donateInfo.bankName }}</span>
            </div>
            
            <div class="flex justify-between items-end border-b border-stone-300/50 pb-3">
              <span class="text-sm text-stone-500 font-medium">ชื่อบัญชี</span>
              <span class="text-xs md:text-sm font-bold text-stone-800 text-right max-w-[65%]">{{ donateInfo.accountName }}</span>
            </div>
            
            <div class="flex justify-between items-center pt-2">
              <span class="text-sm text-stone-500 font-medium">เลขบัญชี</span>
              <span class="text-lg md:text-xl font-black text-stone-900 tracking-widest">{{ donateInfo.accountNumber }}</span>
            </div>
          </div>
        </div>

        <!-- Right Column: Form -->
        <div class="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm">
          <h2 class="text-2xl md:text-3xl font-bold font-serif mb-2">ข้อความและหลักฐานการโอน</h2>
          <p class="text-stone-500 text-sm mb-8">ฝากข้อความถึงเราและแนบสลิปการโอนเงิน</p>

          <form @submit.prevent="submitDonation" class="space-y-6">
            <!-- Name -->
            <div>
              <label class="block text-[13px] font-bold text-stone-800 mb-2">ชื่อ-นามสกุล (ไม่บังคับ)</label>
              <input 
                type="text" 
                v-model="form.name"
                placeholder="ชื่อของคุณ" 
                class="w-full bg-[#fcfbf9] border border-stone-200/80 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-stone-400 focus:bg-white transition-all"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-[13px] font-bold text-stone-800 mb-2">อีเมล (ไม่บังคับ)</label>
              <input 
                type="email" 
                v-model="form.email"
                placeholder="email@example.com" 
                class="w-full bg-[#fcfbf9] border border-stone-200/80 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-stone-400 focus:bg-white transition-all"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-[13px] font-bold text-stone-800 mb-2">เบอร์โทรศัพท์ (ไม่บังคับ)</label>
              <input 
                type="tel" 
                v-model="form.phone"
                placeholder="08X-XXX-XXXX" 
                class="w-full bg-[#fcfbf9] border border-stone-200/80 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-stone-400 focus:bg-white transition-all"
              />
            </div>

            <!-- Message -->
            <div>
              <label class="block text-[13px] font-bold text-stone-800 mb-2">ข้อความถึงทีมงาน</label>
              <textarea 
                v-model="form.message"
                rows="4"
                class="w-full bg-[#fcfbf9] border border-stone-200/80 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-stone-400 focus:bg-white transition-all resize-none"
              ></textarea>
              <div class="text-right mt-1 text-[11px] text-stone-400">{{ form.message.length }} ตัวอักษร</div>
            </div>

            <!-- Slip Upload -->
            <div class="pt-2">
              <label class="block text-[13px] font-bold text-stone-800 mb-3">แนบสลิปการโอนเงิน / หลักฐาน</label>
              
              <div v-if="!slipPreview" class="relative group">
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp, application/pdf" 
                  @change="handleFileChange"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div class="bg-[#fcfbf9] border-2 border-dashed border-stone-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center group-hover:border-stone-300 group-hover:bg-[#f6f4f0] transition-all">
                  <div class="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-400 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <p class="font-bold text-stone-700 text-sm mb-1">คลิกหรือลากไฟล์มาวางที่นี่</p>
                  <p class="text-xs text-stone-400">รองรับ JPG, PNG, PDF ขนาดไม่เกิน 10MB</p>
                </div>
              </div>
              
              <div v-else class="relative bg-stone-50 rounded-2xl p-3 border border-stone-200">
                <img :src="slipPreview" alt="Slip Preview" class="w-full h-56 object-contain rounded-xl bg-white" />
                <button 
                  type="button" 
                  @click="removeSlip"
                  class="absolute top-5 right-5 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Submit Status -->
            <div v-if="submitSuccess" class="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium border border-green-200 mt-4">
              ขอบคุณสำหรับการสนับสนุน! ทางเราได้รับหลักฐานการโอนเงินเรียบร้อยแล้ว
            </div>
            <div v-if="submitError" class="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-200 mt-4">
              {{ submitError }}
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="w-full bg-[#332f2c] text-white font-bold py-4.5 rounded-full flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-8 text-[15px]"
            >
              <span v-if="isSubmitting">กำลังส่งข้อมูล...</span>
              <template v-else>
                <span>ยืนยันการบริจาค</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </template>
            </button>

            <p class="text-center text-[11px] text-stone-400 mt-5 px-4">
              ข้อมูลของคุณจะถูกเก็บเป็นความลับและใช้เพื่อการติดต่อกลับเท่านั้น
            </p>
          </form>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <Footer />
  </main>
</template>

<style scoped>
/* Scoped styles */
</style>
