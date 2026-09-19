<script setup>
import LoginForm from '../../presentation/components/auth/LoginForm.vue'
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-stone-100 relative overflow-hidden">
    <!-- Background Image with Overlay -->
    <div class="absolute inset-0 z-0">
      <img 
        src="../../assets/reg_bg.png" 
        alt="Mekong River" 
        class="w-full h-full object-cover"
      />
      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-amber-900/80 to-stone-900/90 mix-blend-multiply"></div>
    </div>

    <!-- Content -->
    <div class="z-10 w-full px-4 flex justify-center py-12">
      <LoginForm />
    </div>
  </div>
</template>
