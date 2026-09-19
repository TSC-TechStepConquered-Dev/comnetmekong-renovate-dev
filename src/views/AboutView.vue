<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import Navbar from '../presentation/components/layout/Navbar.vue'
import Footer from '../presentation/components/layout/Footer.vue'

const textToType = "WHAT WE DO?"
const displayedText = ref("")
let isTypingActive = true

const typeText = async () => {
  while (isTypingActive) {
    displayedText.value = ""
    
    // Type each character
    for (let i = 0; i < textToType.length; i++) {
      if (!isTypingActive) break
      displayedText.value += textToType[i]
      await new Promise(r => setTimeout(r, 150)) // typing speed
    }
    
    if (!isTypingActive) break
    
    // Hold for 12 seconds
    await new Promise(r => setTimeout(r, 12000))
  }
}

onMounted(() => {
  isTypingActive = true
  typeText()
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
    <section class="relative w-full h-[65vh] min-h-[250px] flex items-center justify-center overflow-hidden">
      <!-- Background Image -->
      <div class="absolute inset-0 z-0">
        <!-- Using a placeholder image that matches the river aesthetic -->
        <img 
          src="../assets/about_bg.jpg" 
          class="w-full h-full object-cover object-center"
          alt="Mekong River"
        />
        <!-- Dark overlay to make text and navbar readable -->
        <div class="absolute inset-0 bg-stone-900/40 mix-blend-multiply"></div>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full mt-8 text-center flex justify-center items-center h-full">
        <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-wider flex items-center justify-center min-w-[280px] md:min-w-[450px]" style="text-shadow: 0 4px 20px rgba(0,0,0,0.3);">
          <span 
            v-for="(char, i) in displayedText" 
            :key="i"
            :class="(i === 5 || i === 6) ? 'text-[#FF5C39]' : 'text-white'"
            style="white-space: pre;"
          >{{ char }}</span>
          <span class="text-white cursor-blink ml-1 -mt-2">|</span>
        </h1>
      </div>
      <div class="absolute bottom-0 left-0 w-full h-10 md:h-30 bg-gradient-to-t from-[#f4f1ea] via-[#f4f1ea]/200 to-transparent z-10 pointer-events-none"></div>
    </section>

    <!-- Mission Content Section -->
    <section class="relative z-20 w-full bg-[#f4f1ea] py-24 px-4 md:px-8">
      <div class="max-w-5xl mx-auto flex flex-col gap-8 lg:gap-12">
        
        <!-- Top: MISSION Header -->
        <div class="w-full flex flex-col md:flex-row md:items-baseline md:gap-4" data-aos="fade-up">
          <h2 class="text-4xl md:text-5xl lg:text-7xl font-black text-stone-900 tracking-tighter flex items-baseline gap-1">
            MISSION<span class="text-[#FF5C39] text-5xl md:text-6xl leading-none">.</span>
          </h2>
          <p class="text-stone-600 font-medium text-lg mt-1 md:mt-0">Since 2009</p>
        </div>

        <!-- Bottom: Mission Text -->
        <div class="w-full text-stone-700 leading-relaxed space-y-6 text-base md:text-lg text-justify md:text-left" data-aos="fade-up" data-aos-delay="200">
          <p>
            The association has been working to enhance the capacity of the Mekong people, communities, and member organizations to be able to ① conduct a Participatory Action Research (PAR) for community-based natural resources management, ② to disseminate all activities through campaigns and mass media for public learning, and ③ to be able to collaborate with CSOs, GOs, and private sectors to protect environmental and natural resources affected from man-made operations in the Mekong River basin and its tributaries.
          </p>
          <p>
            Until the present day, more than 1,333 community groups and nine based network organizations council from the seven Northeastern provinces had been developing continuously.
          </p>
          <p>
            ComNetMekong together with CSOs, academic institutes, GOs and private sectors are deeply studying on the impacts that affect the Mekong ecological system, people and culture, in which mainly caused by having too many hydropower dams on the Mekong mainstream.
          </p>
        </div>
        
      </div>
    </section>

    <!-- Our Work Section -->
    <section class="relative z-20 w-full bg-[#f4f1ea] py-12 px-4 md:px-8 pb-32">
      <div class="max-w-5xl mx-auto flex flex-col gap-12 lg:gap-16">
        
        <!-- Top: OUR WORK Header -->
        <div class="w-full" data-aos="fade-up">
          <h2 class="text-4xl md:text-5xl lg:text-7xl font-black text-stone-900 tracking-tighter flex items-baseline gap-1">
            OUR WORK<span class="text-[#FF5C39] text-5xl md:text-6xl leading-none">.</span>
          </h2>
        </div>

        <!-- Bottom: Timeline Content -->
        <div class="w-full relative mt-4">
          <!-- Vertical Line -->
          <div class="absolute left-[11px] top-4 bottom-0 w-[2px] bg-[#FF5C39]/30"></div>

          <!-- Timeline Items -->
          <div class="space-y-24">
            
            <!-- Item 1: Save the Mekong -->
            <div class="relative pl-10 md:pl-12" data-aos="fade-up">
              <!-- Dot -->
              <div class="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-[#FF5C39] border-[5px] border-[#f4f1ea]"></div>
              
              <h3 class="text-sm font-bold text-[#FF5C39] tracking-widest uppercase mb-3">01 &bull; Initiative</h3>
              <h4 class="text-2xl md:text-3xl font-bold text-stone-900 mb-6 leading-tight">Save the Mekong</h4>
              
              <div class="text-stone-700 leading-relaxed space-y-6 text-base md:text-lg mb-8 text-justify md:text-left">
                <p>According to the current situations of the Mekong river including the issue of numerous ecosystems lose and the issue of unseasonable water level fluctuation, these issues need to be concerned critically as their effects have massively affected over 1,400 local communities (calculated from the overall Northeastern region scale of Thailand) along the Mekong river and people in the communities who rely their lives on this main river for lifetime.</p>
                <p>Based on our researches and interviews, the main causes of these issues are climate change and the numerous huge constructions on the Mekong river such as dams and massive constructions relate to tourism and its attraction sites that assumed to block the fish and other small aquatic animals' pathways, invade the habitats and encroach their food chains together with resulting the water level to be abnormal.</p>
                <p>The specific purposes of our works are to improve the quality of lives for people who live along the Mekong river whether they are fishermen, agriculturists, farmers, local-traders, youths and elder & to protect, conserve, and restore the biodiversity and ecosystem of the Mekong River to be plenteous as before.</p>
              </div>
              
              <!-- 2 Images -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-200">
                  <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="Save the Mekong 1">
                </div>
                <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-200">
                  <img src="https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=800&auto=format&fit=crop" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="Save the Mekong 2">
                </div>
              </div>
            </div>

            <!-- Item 2: Disaster Management -->
            <div class="relative pl-10 md:pl-12" data-aos="fade-up">
              <!-- Dot -->
              <div class="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-[#FF5C39] border-[5px] border-[#f4f1ea]"></div>
              
              <h3 class="text-sm font-bold text-[#FF5C39] tracking-widest uppercase mb-3">02 &bull; Initiative</h3>
              <h4 class="text-2xl md:text-3xl font-bold text-stone-900 mb-6 leading-tight">Disaster Management</h4>
              
              <div class="text-stone-700 leading-relaxed space-y-6 text-base md:text-lg mb-8 text-justify md:text-left">
                <p>Due to the several huge constructions in the Mekong and the issue of climate change, both man-made disasters and natural disasters, which include drought and flood, have been brought to the Mekong river mainstream and its tributaries. This results villagers along the Mekong river to be essentially suffered.</p>
                <blockquote class="pl-6 border-l-4 border-amber-500 italic text-stone-600 bg-stone-100/50 py-4 pr-4 rounded-r-lg">
                  "I used to plant yam, spring onions, and several vegetables nearby the Mekong. But once the flood came, all my vegetables are destroyed and some part of my land was taken with the flood"
                  <footer class="text-sm text-stone-500 mt-2 font-medium">— Mrs. Soodjai Vilandon, a villager in Ban Muang Village, Nong Khai, Thailand</footer>
                </blockquote>
              </div>
              
              <!-- 1 Image -->
              <div class="aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden bg-stone-200">
                <img src="https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=1200&auto=format&fit=crop" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="Disaster Management">
              </div>
            </div>

            <!-- Item 3: Support Children & Youths in Needs -->
            <div class="relative pl-10 md:pl-12" data-aos="fade-up">
              <!-- Dot -->
              <div class="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-[#FF5C39] border-[5px] border-[#f4f1ea]"></div>
              
              <h3 class="text-sm font-bold text-[#FF5C39] tracking-widest uppercase mb-3">03 &bull; Initiative</h3>
              <h4 class="text-2xl md:text-3xl font-bold text-stone-900 mb-6 leading-tight">Support Children & Youths in Needs</h4>
              
              <div class="text-stone-700 leading-relaxed space-y-6 text-base md:text-lg mb-8 text-justify md:text-left">
                <p>Equitable Education Fund (EEF) provided the fund to work, assist, promote, develop and support the children and youths who are from low-income families, who were once misled by society or poor influences, and who have limited opportunities to access educational system, to received the opportunities of training and earning knowledge in order to capable of being employed and getting the jobs based on their capabilities.</p>
              </div>
              
              <!-- 1 Image -->
              <div class="aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden bg-stone-200">
                <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="Support Children & Youths">
              </div>
            </div>

            <!-- Item 4: Housing Restoration & Online-Deceptive Trading Prevention for Elderly -->
            <div class="relative pl-10 md:pl-12" data-aos="fade-up">
              <!-- Dot -->
              <div class="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-[#FF5C39] border-[5px] border-[#f4f1ea]"></div>
              
              <h3 class="text-sm font-bold text-[#FF5C39] tracking-widest uppercase mb-3">04 &bull; Initiative</h3>
              <h4 class="text-2xl md:text-3xl font-bold text-stone-900 mb-6 leading-tight">Housing Restoration & Online-Deceptive Trading Prevention for Elderly</h4>
              
              <div class="text-stone-700 leading-relaxed space-y-6 text-base md:text-lg mb-8 text-justify md:text-left">
                <p>With the collaboration between the Provincial Development Network Centre and ComNetMekong, the elderly with various difficulties such as bedridden elderly, abandoned elderly, and elderly who have to live in housing insecurity condition are going to be the main focus groups on our works.</p>
                <p>Furthermore, ComNetMekong have received fund from Thai Media Fund in order to survey and provide basic knowledge to elderly who got deceived from media. In the process of surveying, ComNetMekong uses the local community networks to collect and process the data so that the data would be accurate and reliable.</p>
              </div>
              
              <!-- 2 Images -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-200">
                  <img src="https://images.unsplash.com/photo-1502444330042-d1a1ddf971b1?q=80&w=800&auto=format&fit=crop" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="Housing Restoration 1">
                </div>
                <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-200">
                  <img src="https://images.unsplash.com/photo-1516383740770-fbcc5ccbece0?q=80&w=800&auto=format&fit=crop" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="Housing Restoration 2">
                </div>
              </div>
            </div>

          </div>
        </div>
        
      </div>
    </section>

    <!-- Staff Section -->
    <section class="relative z-20 w-full bg-[#f4f1ea] py-12 px-4 md:px-8 pb-32">
      <div class="max-w-7xl mx-auto bg-white rounded-[40px] p-8 md:p-16 shadow-sm border border-stone-100">
        <!-- Section Header -->
        <div class="text-center mb-16" data-aos="fade-up">
          <h2 class="text-3xl md:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight flex justify-center items-baseline gap-1">
            COMNETMEKONG STAFF<span class="text-[#FF5C39] text-4xl leading-none">.</span>
          </h2>
          <p class="text-stone-500 font-medium text-sm md:text-base mt-3">Dedicated advocates, coordinators & researchers</p>
        </div>

        <!-- Staff Grid (1 Row, 4 Columns on lg screens) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <!-- Staff 1 -->
          <div class="bg-white border border-[#f4f1ea] rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1" data-aos="fade-up" data-aos-delay="100">
            <div class="w-28 h-28 rounded-full overflow-hidden mb-6 border-4 border-[#f4f1ea] shadow-sm">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=250&auto=format&fit=crop" class="w-full h-full object-cover" alt="Somkiat Phanthasub">
            </div>
            <h3 class="text-lg font-bold text-stone-900 mb-1">Somkiat Phanthasub</h3>
            <p class="text-stone-500 text-xs font-medium mb-6">Director & River Advocate</p>
            <a href="mailto:#" class="text-stone-400 hover:text-[#FF5C39] transition-colors mt-auto">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/></svg>
            </a>
          </div>

          <!-- Staff 2 -->
          <div class="bg-white border border-[#f4f1ea] rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1" data-aos="fade-up" data-aos-delay="200">
            <div class="w-28 h-28 rounded-full overflow-hidden mb-6 border-4 border-[#f4f1ea] shadow-sm">
              <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=250&auto=format&fit=crop" class="w-full h-full object-cover" alt="Thipawan Kaewmanee">
            </div>
            <h3 class="text-lg font-bold text-stone-900 mb-1">Thipawan Kaewmanee</h3>
            <p class="text-stone-500 text-xs font-medium mb-6">Research & Youth Lead</p>
            <a href="mailto:#" class="text-stone-400 hover:text-[#FF5C39] transition-colors mt-auto">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/></svg>
            </a>
          </div>

          <!-- Staff 3 -->
          <div class="bg-white border border-[#f4f1ea] rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1" data-aos="fade-up" data-aos-delay="300">
            <div class="w-28 h-28 rounded-full overflow-hidden mb-6 border-4 border-[#f4f1ea] shadow-sm">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop" class="w-full h-full object-cover" alt="Niwat Roykaew">
            </div>
            <h3 class="text-lg font-bold text-stone-900 mb-1">Niwat Roykaew</h3>
            <p class="text-stone-500 text-xs font-medium mb-6">Community Coordinator</p>
            <a href="mailto:#" class="text-stone-400 hover:text-[#FF5C39] transition-colors mt-auto">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/></svg>
            </a>
          </div>

          <!-- Staff 4 -->
          <div class="bg-white border border-[#f4f1ea] rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1" data-aos="fade-up" data-aos-delay="400">
            <div class="w-28 h-28 rounded-full overflow-hidden mb-6 border-4 border-[#f4f1ea] shadow-sm">
              <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=250&auto=format&fit=crop" class="w-full h-full object-cover" alt="Kamonwan Chaisri">
            </div>
            <h3 class="text-lg font-bold text-stone-900 mb-1">Kamonwan Chaisri</h3>
            <p class="text-stone-500 text-xs font-medium mb-6">Media & Communications</p>
            <a href="mailto:#" class="text-stone-400 hover:text-[#FF5C39] transition-colors mt-auto">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/></svg>
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.cursor-blink {
  animation: blink 1s step-end infinite;
  font-weight: 300;
}
</style>
