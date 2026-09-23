<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useHead } from '@vueuse/head'
import { generateSEO } from '@/utils/seo'
import { useRoute, useRouter } from 'vue-router'
import { WixBlogRepository } from '../infrastructure/repositories/wix-blog.repository'
import { useAuthStore } from '../presentation/stores/auth'
import { useBlogStore } from '../presentation/stores/blog'
import Navbar from '../presentation/components/layout/Navbar.vue'
import Footer from '../presentation/components/layout/Footer.vue'

const route = useRoute()
const router = useRouter()
const blogRepo = new WixBlogRepository()
const authStore = useAuthStore()
const blogStore = useBlogStore()

const blog = ref(null)
const loading = ref(true)
const error = ref('')

useHead({
  title: computed(() =>
    blog.value ? `${blog.value.title} - COMNETMEKONG` : 'บทความ - COMNETMEKONG',
  ),
  meta: computed(() =>
    generateSEO({
      title: blog.value ? `${blog.value.title} - COMNETMEKONG` : 'บทความ - COMNETMEKONG',
      description:
        blog.value && blog.value.excerpt
          ? blog.value.excerpt
          : blog.value && blog.value.content
            ? blog.value.content.replace(/<[^>]+>/g, '').substring(0, 160) + '...'
            : 'บทความจากเครือข่าย COMNETMEKONG',
      image: blog.value?.imageUrl,
      url: `https://www.comnetmekong.org/blogs/${blog.value?.id || ''}`,
    }),
  ),
})

const isLiked = ref(false)
const likeCount = ref(0)
const commentContent = ref('')
const isSubmittingComment = ref(false)
const activeMenuId = ref(null)
const editingCommentId = ref(null)
const editContent = ref('')
const deletingCommentId = ref(null)
const isLiking = ref(false)

const toggleCommentMenu = (commentId) => {
  activeMenuId.value = activeMenuId.value === commentId ? null : commentId
}

const closeAllMenus = (e) => {
  if (!e.target.closest('.comment-menu-wrapper')) {
    activeMenuId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', closeAllMenus)
})

onUnmounted(() => {
  document.removeEventListener('click', closeAllMenus)
})

const startEditComment = (comment) => {
  editingCommentId.value = comment.id
  editContent.value = comment.content
  activeMenuId.value = null
}

const cancelEditComment = () => {
  editingCommentId.value = null
  editContent.value = ''
}

const saveEditComment = async (comment) => {
  if (!editContent.value.trim()) return
  try {
    await blogRepo.updateComment(comment.id, authStore.token, editContent.value.trim())
    comment.content = editContent.value.trim()
    editingCommentId.value = null
    editContent.value = ''
  } catch (err) {
    showModal({
      title: 'ผิดพลาด',
      message: err.message || 'เกิดข้อผิดพลาดในการแก้ไขความคิดเห็น',
      type: 'alert',
    })
  }
}

const modalState = ref({
  show: false,
  title: '',
  message: '',
  type: 'alert', // 'alert' | 'confirm' | 'login'
  confirmText: 'ตกลง',
  cancelText: 'ยกเลิก',
  onConfirm: null,
})

const showModal = (options) => {
  modalState.value = {
    show: true,
    title: options.title || 'แจ้งเตือน',
    message: options.message || '',
    type: options.type || 'alert',
    confirmText: options.confirmText || 'ตกลง',
    cancelText: options.cancelText || 'ยกเลิก',
    onConfirm: options.onConfirm || null,
  }
}

const closeModal = () => {
  modalState.value.show = false
}

const handleModalConfirm = () => {
  if (modalState.value.onConfirm) {
    modalState.value.onConfirm()
  } else if (modalState.value.type === 'login') {
    router.push('/login')
  }
  closeModal()
}

const fetchBlog = async () => {
  loading.value = true
  error.value = ''
  try {
    const id = route.params.id || route.params.slug

    // 1. ลองเอาจาก Cache มาโชว์ก่อนเลย (Optimistic UI)
    const cachedBlog = blogStore.getBlogFromCache(id)
    if (cachedBlog) {
      blog.value = cachedBlog
      likeCount.value = cachedBlog.likes || 0
      loading.value = false // หยุดหมุนเลย
    }

    // 2. ไปดึงตัวเต็มมา (อาจจะมีเนื้อหา Rich content หรือยอดไลก์ล่าสุด)
    const data = await blogStore.fetchBlogDetail(id)
    if (!data) throw new Error('ไม่พบบทความ')

    blog.value = data
    likeCount.value = data.likes || 0
    loading.value = false

    // ถ้าล็อกอินอยู่ ให้เช็กว่าเคยกดไลก์บทความนี้ไปแล้วหรือยัง
    if (authStore.isAuthenticated && authStore.token) {
      const alreadyLiked = await blogRepo.checkLike(blog.value.id, authStore.token)
      isLiked.value = alreadyLiked
    }

    // Call view increment
    await blogRepo.incrementView(id)

    // เพิ่มยอดวิวในหน้าจอทันทีเพื่อให้เห็นการเปลี่ยนแปลง
    if (blog.value && typeof blog.value.views === 'number') {
      blog.value.views++
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  fetchBlog()
  // Scroll to top
  if (window.lenis) {
    window.lenis.scrollTo(0, { immediate: true })
  } else {
    window.scrollTo(0, 0)
  }

  if (!blogStore.isLatestBlogsLoaded) {
    await blogStore.fetchLatestBlogs()
  }
})

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchBlog()
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  },
)

const relatedBlogs = computed(() => {
  if (!blog.value || !blogStore.latestBlogs) return []
  const filtered = blogStore.latestBlogs.filter((b) => b.id !== blog.value.id)
  // สุ่มบล็อกมา 3 อัน
  return [...filtered].sort(() => 0.5 - Math.random()).slice(0, 3)
})

const handleLike = async () => {
  if (!authStore.isAuthenticated) {
    showModal({
      title: 'ต้องการเข้าสู่ระบบ',
      message: 'กรุณาเข้าสู่ระบบก่อนกดถูกใจบทความ',
      type: 'login',
      confirmText: 'เข้าสู่ระบบ',
      cancelText: 'ไว้ทีหลัง',
    })
    return
  }

  isLiking.value = true

  try {
    const result = await blogRepo.toggleLike(blog.value.id, authStore.token)

    if (result && typeof result.totalLikes === 'number') {
      isLiked.value = result.liked
      likeCount.value = result.totalLikes
    } else {
      isLiked.value = !isLiked.value
      likeCount.value += isLiked.value ? 1 : -1
    }

    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    showModal({
      title: 'ผิดพลาด',
      message: 'เกิดข้อผิดพลาดในการกดถูกใจ',
      type: 'alert',
    })
  } finally {
    isLiking.value = false
  }
}

const submitComment = async () => {
  if (!commentContent.value.trim()) return
  if (!authStore.isAuthenticated) {
    showModal({
      title: 'ต้องการเข้าสู่ระบบ',
      message: 'กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น',
      type: 'login',
      confirmText: 'เข้าสู่ระบบ',
      cancelText: 'ไว้ทีหลัง',
    })
    return
  }

  isSubmittingComment.value = true
  try {
    const authorName = authStore.user.displayName || 'คุณ'
    const response = await blogRepo.addComment(
      blog.value.id,
      authStore.token,
      commentContent.value,
      authorName,
    )

    if (!blog.value.comments) blog.value.comments = []

    if (response && response.data) {
      // ใช้ข้อมูลที่ได้จาก Database จริงๆ
      blog.value.comments.push({
        id: response.data.id,
        authorName: response.data.authorName,
        content: response.data.content,
        date: new Date(response.data.createdAt).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
    } else {
      // Fallback กรณี response ไม่ถูกต้อง
      blog.value.comments.push({
        id: Date.now().toString(),
        authorName: authStore.user.displayName || 'คุณ',
        content: commentContent.value,
        date: 'เมื่อสักครู่',
      })
    }

    commentContent.value = ''
  } catch (error) {
    showModal({
      title: 'ผิดพลาด',
      message: error.message || 'เกิดข้อผิดพลาดในการส่งความคิดเห็น',
      type: 'alert',
    })
  } finally {
    isSubmittingComment.value = false
  }
}

const deleteComment = (commentId) => {
  showModal({
    title: 'ยืนยันการลบ',
    message: 'คุณต้องการลบความคิดเห็นนี้ใช่หรือไม่?',
    type: 'confirm',
    confirmText: 'ลบความคิดเห็น',
    cancelText: 'ยกเลิก',
    onConfirm: async () => {
      deletingCommentId.value = commentId
      try {
        await blogRepo.deleteComment(commentId, authStore.token)
        // Short delay so user sees the animation
        await new Promise((r) => setTimeout(r, 400))
        blog.value.comments = blog.value.comments.filter((c) => c.id !== commentId)
      } catch (error) {
        showModal({
          title: 'ผิดพลาด',
          message: error.message || 'เกิดข้อผิดพลาดในการลบความคิดเห็น',
          type: 'alert',
        })
      } finally {
        deletingCommentId.value = null
      }
    },
  })
}

const handleShare = async () => {
  const shareData = {
    title: blog.value?.title,
    text: blog.value?.summary,
    url: window.location.href,
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch (err) {
      console.log('Error sharing', err)
    }
  } else {
    // Fallback: Copy to clipboard
    navigator.clipboard.writeText(window.location.href)
    showModal({
      title: 'สำเร็จ',
      message: 'คัดลอกลิงก์เรียบร้อยแล้ว',
      type: 'alert',
    })
  }
}
</script>

<template>
  <main class="min-h-screen bg-[#f4f1ea] font-sans">
    <!-- Navbar (Fixed with dark background for detail page) -->
    <div class="bg-stone-900 sticky top-0 z-50">
      <Navbar />
    </div>

    <!-- Skeleton Loader -->
    <div v-if="loading" class="max-w-4xl mx-auto px-4 md:px-8 pt-32 animate-pulse">
      <div class="w-32 h-4 bg-stone-300 rounded mb-6"></div>
      <div class="w-3/4 h-10 md:h-14 bg-stone-300 rounded mb-4"></div>
      <div class="w-1/2 h-10 md:h-14 bg-stone-300 rounded mb-6"></div>
      <div class="w-48 h-4 bg-stone-300 rounded mb-8 pb-8 border-b border-stone-200"></div>
      <div class="w-full h-[300px] md:h-[500px] bg-stone-300 rounded-3xl mb-12 shadow-sm"></div>
      <div class="space-y-4 mb-16">
        <div class="w-full h-5 bg-stone-300 rounded"></div>
        <div class="w-full h-5 bg-stone-300 rounded"></div>
        <div class="w-5/6 h-5 bg-stone-300 rounded"></div>
        <div class="w-full h-5 bg-stone-300 rounded mt-8"></div>
        <div class="w-4/5 h-5 bg-stone-300 rounded"></div>
        <div class="w-full h-5 bg-stone-300 rounded"></div>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-20 text-red-600 font-medium text-lg">
      {{ error }}
    </div>

    <div v-else-if="blog" class="max-w-4xl mx-auto px-4 md:px-8 pt-32 animate-fade-in">
      <!-- Breadcrumb & Category -->
      <div
        class="flex items-center gap-3 text-sm text-amber-600 font-semibold tracking-widest uppercase mb-6"
      >
        <RouterLink to="/" class="hover:text-amber-700 transition-colors">หน้าแรก</RouterLink>
        <span class="text-stone-400">/</span>
        <span>{{ blog.category }}</span>
      </div>

      <!-- Title -->
      <h1 class="text-3xl md:text-5xl font-bold text-stone-800 leading-tight mb-6">
        {{ blog.title }}
      </h1>

      <!-- Meta Info -->
      <div
        class="flex flex-wrap items-center gap-6 text-sm text-stone-500 mb-8 pb-8 border-b border-stone-200"
      >
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          {{ blog.date }}
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            ></path>
          </svg>
          {{ blog.author }}
        </div>
      </div>

      <!-- Cover Image -->
      <div class="w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden mb-12 shadow-sm">
        <img
          :src="blog.imageUrl"
          :alt="blog.title"
          loading="lazy"
          decoding="async"
          class="w-full h-full object-cover"
        />
      </div>

      <!-- Content -->
      <div
        class="prose prose-stone prose-lg max-w-none text-stone-700 leading-relaxed mb-16"
        v-html="blog.content"
      ></div>

      <!-- Interaction Bar (Like & Share) -->
      <div class="flex items-center justify-between py-6 border-t border-b border-stone-200 mb-16">
        <div class="flex items-center gap-4">
          <button
            @click="handleLike"
            :disabled="isLiking"
            class="flex items-center gap-2 px-6 py-3 rounded-full transition-colors font-medium border relative overflow-hidden disabled:opacity-80"
            :class="
              isLiked
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            "
          >
            <!-- Broken Heart (Unliking) -->
            <svg
              v-if="isLiked && isLiking"
              class="w-6 h-6 animate-pulse text-stone-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09l-2 3.91 2 2.5-2 2.5 2 3.5-2 3.85z"
              />
              <path
                d="M12 21.35l2-3.85-2-3.5 2-2.5-2-2.5 2-3.91C15.09 3.81 16.76 3 18.5 3 21.58 3 24 5.42 24 8.5c0 3.78-3.4 6.86-8.55 11.53L14 21.35z"
              />
            </svg>
            <!-- Normal Heart (Liked, Liking, or Unliked) -->
            <svg
              v-else
              class="w-6 h-6 transition-transform"
              :class="{ 'animate-heartbeat text-red-500': isLiking && !isLiked }"
              :fill="isLiked || (isLiking && !isLiked) ? 'currentColor' : 'none'"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
            <span>ถูกใจ {{ likeCount }}</span>
          </button>
          <div class="flex items-center gap-2 text-stone-500 font-medium px-4">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              ></path>
            </svg>
            {{ blog.views ? blog.views.toLocaleString() : 0 }} ครั้ง
          </div>
        </div>

        <button
          @click="handleShare"
          class="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            ></path>
          </svg>
          แชร์บทความ
        </button>
      </div>

      <!-- Comments Section -->
      <div class="mb-12">
        <h3 class="text-2xl font-bold text-stone-800 mb-8">
          ความคิดเห็น ({{ blog.comments ? blog.comments.length : 0 }})
        </h3>

        <!-- Comment Input -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 mb-10">
          <div v-if="authStore.isAuthenticated">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold"
              >
                {{ authStore.user.displayName.charAt(0) }}
              </div>
              <span class="font-medium text-stone-800">{{ authStore.user.displayName }}</span>
            </div>
            <textarea
              v-model="commentContent"
              rows="3"
              class="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none mb-4"
              placeholder="แสดงความคิดเห็นของคุณ..."
            ></textarea>
            <div class="flex justify-end">
              <button
                @click="submitComment"
                :disabled="!commentContent.trim() || isSubmittingComment"
                class="px-6 py-2.5 bg-amber-700 text-white font-medium rounded-xl hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSubmittingComment ? 'กำลังส่ง...' : 'ส่งความคิดเห็น' }}
              </button>
            </div>
          </div>
          <div v-else class="text-center py-6">
            <p class="text-stone-500 mb-4">กรุณาเข้าสู่ระบบเพื่อแสดงความคิดเห็น</p>
            <RouterLink
              to="/login"
              class="inline-block px-6 py-2.5 bg-stone-800 text-white font-medium rounded-xl hover:bg-stone-900 transition-colors"
            >
              เข้าสู่ระบบ
            </RouterLink>
          </div>
        </div>

        <!-- Comments List -->
        <div v-if="blog.comments && blog.comments.length > 0" class="space-y-6">
          <TransitionGroup name="comment-list">
            <div
              v-for="comment in blog.comments"
              :key="comment.id"
              class="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex gap-4 relative transition-all duration-300"
              :class="{ 'opacity-50 scale-[0.98]': deletingCommentId === comment.id }"
            >
              <!-- Deleting overlay -->
              <div
                v-if="deletingCommentId === comment.id"
                class="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-2xl"
              >
                <div class="flex items-center gap-3 text-red-500">
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span class="text-sm font-medium">กำลังลบ...</span>
                </div>
              </div>

              <div
                class="w-12 h-12 flex-shrink-0 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center font-bold text-lg"
              >
                {{ comment.authorName.charAt(0) }}
              </div>
              <div class="flex-grow min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-baseline gap-3 min-w-0">
                    <span class="font-bold text-stone-800 truncate">{{ comment.authorName }}</span>
                    <span class="text-xs text-stone-400 whitespace-nowrap">{{ comment.date }}</span>
                  </div>
                  <!-- 3-dot menu (Only show for comment owner) -->
                  <div
                    v-if="
                      authStore.isAuthenticated &&
                      authStore.user &&
                      comment.authorName === authStore.user.displayName &&
                      deletingCommentId !== comment.id
                    "
                    class="relative comment-menu-wrapper flex-shrink-0 ml-2"
                  >
                    <button
                      @click.stop="toggleCommentMenu(comment.id)"
                      class="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                      title="ตัวเลือก"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                      </svg>
                    </button>
                    <!-- Dropdown Menu -->
                    <Transition name="menu-fade">
                      <div
                        v-if="activeMenuId === comment.id"
                        class="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-50 overflow-hidden"
                      >
                        <button
                          @click.stop="startEditComment(comment)"
                          class="w-full px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 transition-colors"
                        >
                          <svg
                            class="w-4 h-4 text-stone-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            ></path>
                          </svg>
                          แก้ไข
                        </button>
                        <button
                          @click.stop="
                            activeMenuId = null
                            deleteComment(comment.id)
                          "
                          class="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                        >
                          <svg
                            class="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
                          ลบ
                        </button>
                      </div>
                    </Transition>
                  </div>
                </div>
                <!-- Normal display -->
                <p v-if="editingCommentId !== comment.id" class="text-stone-600 leading-relaxed">
                  {{ comment.content }}
                </p>
                <!-- Inline edit mode -->
                <div v-else class="mt-2">
                  <textarea
                    v-model="editContent"
                    rows="3"
                    class="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none text-sm"
                  ></textarea>
                  <div class="flex justify-end gap-2 mt-2">
                    <button
                      @click="cancelEditComment"
                      class="px-4 py-1.5 text-sm rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button
                      @click="saveEditComment(comment)"
                      :disabled="!editContent.trim()"
                      class="px-4 py-1.5 text-sm rounded-lg bg-amber-700 text-white hover:bg-amber-800 transition-colors disabled:opacity-50"
                    >
                      บันทึก
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
        <div
          v-else
          class="text-center text-stone-500 py-8 bg-white rounded-2xl border border-stone-100"
        >
          ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็นสิ!
        </div>
      </div>

      <!-- Related Blogs Section -->
      <div v-if="relatedBlogs.length > 0" class="mt-24 pt-16 border-t border-stone-200">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-stone-800 tracking-tight">บทความอื่นๆ ที่น่าสนใจ</h2>
          <RouterLink
            to="/blogs"
            class="text-xs font-bold tracking-widest uppercase text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1"
          >
            ดูทั้งหมด
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </RouterLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
          <RouterLink
            v-for="rb in relatedBlogs"
            :key="rb.id"
            :to="`/blogs/${rb.id}`"
            class="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-stone-100 flex flex-col"
          >
            <div class="relative h-48 overflow-hidden bg-stone-100">
              <img
                :src="rb.imageUrl"
                :alt="rb.title"
                loading="lazy"
                decoding="async"
                class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            <div class="p-6 flex flex-col flex-grow">
              <div
                class="flex items-center gap-3 text-[10px] font-semibold text-stone-500 mb-3 uppercase tracking-wider"
              >
                <span class="text-amber-600">{{ rb.category }}</span>
                <span>•</span>
                <span>{{ rb.date }}</span>
              </div>
              <h3
                class="text-lg font-bold text-stone-800 leading-tight mb-3 group-hover:text-amber-700 transition-colors line-clamp-2"
              >
                {{ rb.title }}
              </h3>
              <p class="text-stone-500 text-sm leading-relaxed line-clamp-2 mt-auto font-light">
                {{ rb.summary }}
              </p>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Unified Modal -->
    <div v-if="modalState.show" class="fixed inset-0 z-[100] flex items-center justify-center">
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        @click="closeModal"
      ></div>

      <!-- Modal Content -->
      <div
        class="relative bg-[#f4f1ea] rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-scale-up border border-stone-200"
      >
        <!-- Icon based on type -->
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          :class="{
            'bg-amber-100 text-amber-600':
              modalState.type === 'login' || modalState.type === 'alert',
            'bg-red-100 text-red-600': modalState.type === 'confirm',
          }"
        >
          <!-- Info/Login Icon -->
          <svg
            v-if="
              modalState.type === 'login' ||
              (modalState.type === 'alert' && modalState.title !== 'ผิดพลาด')
            "
            class="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <!-- Error Icon -->
          <svg
            v-else-if="modalState.type === 'alert' && modalState.title === 'ผิดพลาด'"
            class="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <!-- Warning/Confirm Icon -->
          <svg
            v-else-if="modalState.type === 'confirm'"
            class="w-8 h-8"
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
        </div>

        <h3 class="text-2xl font-bold text-center text-stone-800 mb-3 tracking-tight">
          {{ modalState.title }}
        </h3>
        <p class="text-center text-stone-600 mb-8 leading-relaxed">{{ modalState.message }}</p>

        <div class="flex gap-3">
          <!-- Cancel Button (Only for confirm and login) -->
          <button
            v-if="modalState.type !== 'alert'"
            @click="closeModal"
            class="flex-1 px-4 py-3 rounded-xl bg-white border border-stone-300 text-stone-700 font-medium hover:bg-stone-50 transition-colors"
          >
            {{ modalState.cancelText }}
          </button>

          <!-- Confirm/OK Button -->
          <button
            @click="handleModalConfirm"
            class="flex-1 px-4 py-3 rounded-xl text-white font-medium shadow-sm transition-colors"
            :class="{
              'bg-amber-700 hover:bg-amber-800':
                modalState.type === 'login' || modalState.type === 'alert',
              'bg-red-600 hover:bg-red-700': modalState.type === 'confirm',
            }"
          >
            {{ modalState.confirmText }}
          </button>
        </div>
      </div>
    </div>

    <Footer />
  </main>
</template>

<style scoped>
@keyframes scaleUp {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-scale-up {
  animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dropdown menu transition */
.menu-fade-enter-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.menu-fade-leave-active {
  transition:
    opacity 0.1s ease,
    transform 0.1s ease;
}
.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Hide scrollbar for Chrome, Safari and Opera */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
/* Hide scrollbar for IE, Edge and Firefox */
.hide-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

/* Base Prose Styles */
:deep(.prose p) {
  margin-bottom: 1.5em;
}
:deep(.prose strong) {
  font-weight: 600;
  color: #1c1917;
}

@keyframes heartbeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.3);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.3);
  }
  70% {
    transform: scale(1);
  }
}
.animate-heartbeat {
  animation: heartbeat 1.2s infinite;
}
</style>
