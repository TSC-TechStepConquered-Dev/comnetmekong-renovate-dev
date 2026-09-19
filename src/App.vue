<script setup>
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import AOS from 'aos'
import Lenis from 'lenis'

let lenis = null
let animationFrameId = null
let resizeObserver = null

const sendHeightToWix = () => {
  const height = document.documentElement.scrollHeight || document.body.scrollHeight;
  // ส่งข้อความหาหน้าต่างแม่ (Wix)
  window.parent.postMessage({ type: 'RESIZE_IFRAME', height: height }, '*');
};

const receiveMessageFromWix = (event) => {
  // รับค่าความสูงหน้าต่างจริงจาก Wix
  if (event.data && event.data.type === 'WINDOW_HEIGHT') {
    const realHeight = event.data.height;
    document.documentElement.style.setProperty('--hero-height', `${realHeight}px`);
  }
};

onMounted(() => {
  // Initialize Smooth Scrolling (Lenis)
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  })
  
  window.lenis = lenis // Expose to global for router to use

  function raf(time) {
    lenis.raf(time)
    animationFrameId = requestAnimationFrame(raf)
  }

  animationFrameId = requestAnimationFrame(raf)

  // Initialize AOS
  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 50
  })

  // ส่งความสูงให้ Wix ครั้งแรกเมื่อโหลดเสร็จ
  sendHeightToWix();

  // ติดตามการเปลี่ยนแปลงขนาดเนื้อหา
  resizeObserver = new ResizeObserver(() => {
    sendHeightToWix();
  });
  resizeObserver.observe(document.body);

  // ดัก event ตอน window ย่อ-ขยาย และดักรับข้อความจาก Wix
  window.addEventListener('resize', sendHeightToWix);
  window.addEventListener('message', receiveMessageFromWix);
})

onUnmounted(() => {
  if (lenis) lenis.destroy()
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  if (resizeObserver) resizeObserver.disconnect()
  window.removeEventListener('resize', sendHeightToWix)
  window.removeEventListener('message', receiveMessageFromWix)
})
</script>

<template>
  <RouterView />
</template>

<style>
/* Global styles can be added here, though we are using Tailwind CSS */
</style>
