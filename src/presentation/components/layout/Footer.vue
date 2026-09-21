<script setup>
</script>

<template>
  <footer class="w-full bg-gradient-to-b from-[#f4f1ea] to-[#928c83] pt-20 pb-8 px-4 md:px-12 border-t border-white shadow-[0_-1px_2px_rgba(255,255,255,0.5)]">
    <div class="max-w-7xl mx-auto flex flex-col xl:flex-row justify-between items-center gap-10 xl:gap-8">
      
      <!-- Logos & Brand (Left Side) -->
      <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div class="flex items-center gap-4">
          <!-- Logo 1 (Hugmekong) -->
          <div class="w-16 h-16 bg-white flex items-center justify-center p-2 rounded-sm shadow-sm">
            <img src="../../../assets/hugmekong_logo.png" alt="Hugmekong Logo" class="w-full h-full object-contain" />
          </div>
          <!-- Logo 2 (Naga Crest) -->
          <div class="w-16 h-16 bg-white flex items-center justify-center p-2 rounded-sm shadow-sm">
            <img src="../../../assets/logo_2.avif" alt="Partner Logo" class="w-full h-full object-contain" />
          </div>
        </div>
        <div class="w-px h-12 bg-stone-500/50 hidden sm:block"></div>
        <div class="text-center sm:text-left">
          <div class="text-stone-900 font-bold tracking-wider text-lg">COMNETMEKONG</div>
          <div class="text-stone-600 text-xs mt-1">NGO Association @2018</div>
        </div>
      </div>

      <!-- Contact Info (Right Side) -->
      <div class="text-stone-800 text-xs sm:text-sm text-center xl:text-right space-y-1.5 opacity-90">
        <p>เลขที่ 234/79 หมู่ที่ 12 ซอย 4 ถนนมิตรภาพ-เอื้ออาทร ตำบลโพธิ์ชัย อำเภอเมืองหนองคาย จังหวัดหนองคาย 43000</p>
        <p>โทรศัพท์: <span class="hover:text-black cursor-pointer">(+66) 858536924</span>, <span class="hover:text-black cursor-pointer">(+66) 934586079</span></p>
        <p>อีเมล: 
          <a href="mailto:comnet.ksk@gmail.com" class="hover:text-black underline underline-offset-2">comnet.ksk@gmail.com</a>, 
          <a href="mailto:ormbunthip@gmail.com" class="hover:text-black underline underline-offset-2">ormbunthip@gmail.com</a>, 
          <a href="mailto:martha.hugmekong@gmail.com" class="hover:text-black underline underline-offset-2">martha.hugmekong@gmail.com</a>
        </p>
      </div>

    </div>

    <!-- Bottom Section: Socials & Copyright -->
    <div class="max-w-7xl mx-auto mt-20 flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-end gap-6 text-white/90">
      
      <div class="flex items-center gap-3">
        <!-- Facebook Icon -->
        <a href="#" aria-label="Facebook" class="hover:text-white transition-colors">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
          </svg>
        </a>
        <!-- YouTube Icon (Outline style matching the design) -->
        <a href="#" aria-label="YouTube" class="hover:text-white transition-colors border border-current rounded-md px-2 py-1 flex items-center justify-center">
          <svg class="w-6 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
          </svg>
        </a>
      </div>

      <div class="text-xs font-light tracking-wide text-center sm:text-right">
        NGO Association @2018 by Ministry of Natural Resources and Environment
      </div>
    </div>
  </footer>
</template>
