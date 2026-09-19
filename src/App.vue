<script setup>
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import AOS from 'aos'
import Lenis from 'lenis'

let lenis = null
let animationFrameId = null

onMounted(() => {
  // Initialize Smooth Scrolling (Lenis)
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  })

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
})

onUnmounted(() => {
  if (lenis) lenis.destroy()
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})
</script>

<template>
  <RouterView />
</template>

<style>
/* Global styles can be added here, though we are using Tailwind CSS */
</style>
