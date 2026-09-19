# System Design & Frontend Specification: HUGMEKONG (เรื่องราวจากลุ่มน้ำโขง)

---

## 1. บทนำและภาพรวมของระบบ (Executive Overview)
**HUGMEKONG (ฮักแม่น้ำโขง)** เป็นแพลตฟอร์มบล็อกและศูนย์กลางข้อมูล บทความ วิจัย และกิจกรรมชุมชนของเครือข่ายลุ่มน้ำโขง 7 จังหวัดภาคตะวันออกเฉียงเหนือ (คสม.)  
ระบบพัฒนาส่วนหน้าด้วย **Vue 3 Ecosystem (Nuxt 3 หรือ Vue 3 + Vite) โดยใช้ JavaScript (ES6+) เป็นหลัก (ไม่ใช้ TypeScript)** ควบคู่กับ **Tailwind CSS**, **Pinia** และเชื่อมต่อกับ **Wix Headless REST / SDK APIs (@wix/sdk)** สำหรับการจัดการข้อมูลบล็อก, สมาชิก และระบบ Engagement (Likes, Comments, Share)

เอกสารนี้ระบุข้อกำหนดด้านสถาปัตยกรรม (Clean Architecture แบบ JavaScript), การจัดโครงสร้างโฟลเดอร์, มาตรฐานการเขียนโค้ด (Zero Hardcoding), การเพิ่มประสิทธิภาพ (Optimization) และ SEO

---

## 2. โครงสร้างหน้าและคอมโพเนนต์ (UI/UX & Feature Breakdown)

### 2.1 Navigation Bar & ระบบสมาชิก (Global Header)
- **Brand Identity**: โลโก้ `HUGMEKONG`
- **Navigation Links**: หน้าแรก (Home), บทความทั้งหมด (Blogs), เกี่ยวกับเรา (About), พันธกิจ (Missions), แกลเลอรี (Gallery), ติดต่อเรา (Contact)
- **User Authentication State (Pinia Store: `useAuthStore`)**:
  - *Guest State*: แสดงปุ่ม "เข้าสู่ระบบ" (Login) และ "สมัครสมาชิก" (Register)
  - *Authenticated State*: แสดง User Avatar, ชื่อสมาชิก, เมนูย่อย (บทความที่ชอบ, โปรไฟล์, ปุ่มออกจากระบบ)
- **Authentication Views / Modals**:
  - รองรับทั้ง Modal ป๊อปอัปและหน้าเฉพาะ `/login`, `/register`
  - ตรวจสอบความถูกต้องของแบบฟอร์ม (Validation) ก่อนยิง Request ไปยัง Wix Members API

### 2.2 Hero Section & แนะนำโครงการ
- พื้นหลังภาพทิวทัศน์แม่น้ำโขงเต็มจอ พร้อม Dark Gradient Overlay
- พาดหัวหลัก "ชีวิตที่ผูกพันกับสายน้ำโขง" และปุ่ม CTA นำทางไปยังบทความแนะนำล่าสุด

### 2.3 Blog Listing & Feed (หน้าแรก & `/blogs`)
- **Category Filter Tabs**: กรองบทความตามหมวดหมู่ (เช่น นิเวศวิทยา, ชุมชน, นโยบาย/เขื่อน, วัฒนธรรม)
- **Search & Sort**: ช่องค้นหา (Debounced Input) และตัวเลือกจัดเรียง (ล่าสุด, ยอดนิยม/ไลก์มากที่สุด)
- **View Modes**:
  - Carousel View: สไลด์แสดงเรื่องเด่นประจำสัปดาห์ (Swiper.js หรือ Embla Carousel)
  - Responsive Grid View: 3 คอลัมน์ (Desktop) / 2 คอลัมน์ (Tablet) / 1 คอลัมน์ (Mobile)
- **Blog Card Component (`BlogCard.vue`)**:
  - ภาพหน้าปก (Aspect ratio 16:9) พร้อม Lazy loading
  - Badge หมวดหมู่ และเวลาในการอ่าน ("อ่าน 3 นาที")
  - ชื่อเรื่อง (Line-clamp 2) และเนื้อหาย่อ (Line-clamp 3)
  - ข้อมูล Engagement: จำนวน Like และ Comment
  - ลิงก์คลิกไปยังหน้ารายละเอียดบทความ `/blogs/[slug]`

### 2.4 Blog Detail Page (`/blogs/[slug].vue`)
- **Breadcrumbs**: หน้าแรก > บทความ > [หมวดหมู่] > [ชื่อบทความ]
- **Article Header**: H1 ชื่อเรื่อง, ข้อมูลผู้เขียน, วันที่เผยแพร่ (แปลงฟอร์แมตภาษาไทย), ระยะเวลาในการอ่าน
- **Featured Image**: ภาพหน้าปกขนาดใหญ่พร้อม Alt text บรรยายภาพ
- **Rich Content Area**:
  - เรนเดอร์ HTML / Wix Rich Content ผ่านคลาส Typography (`prose prose-stone`)
- **Interactive Engagement Bar (`EngagementBar.vue`)**:
  - **ปุ่ม Like**:
    - แสดงจำนวน Like แบบ Real-time
    - ไอคอนหัวใจเปลี่ยนสีพร้อม Micro-animation
    - ใช้ **Optimistic UI Update** (เปลี่ยนสีและเพิ่มยอดทันที หาก Request ล้มเหลวจะ Rollback พร้อมแจ้งเตือน)
    - หากยังไม่ได้ Login เมื่อกดไลก์จะเปิด Modal ชวนเข้าสู่ระบบทันที
  - **ปุ่ม Share**:
    - รองรับ Web Share API สำหรับมือถือ
    - ปุ่มแชร์ด่วน: Facebook, X, Line และปุ่มคัดลอกลิงก์ (พร้อม Toast "คัดลอกลิงก์เรียบร้อย")
  - **ปุ่ม Save / Bookmark**: บันทึกบทความลงรายการโปรดของสมาชิก

### 2.5 Comment Section (`CommentSection.vue`)
- **Header**: แสดงตัวนับความคิดเห็น เช่น "ความคิดเห็น (12)"
- **Comment Input Box**:
  - สมาชิกที่ Login แล้ว: พิมพ์และส่งความคิดเห็นได้ทันที
  - Guest: แสดงกล่องข้อความพร้อมปุ่ม CTA "เข้าสู่ระบบเพื่อร่วมแสดงความคิดเห็น"
  - มีระบบตรวจนับตัวอักษรและกันการกดส่งรัว ๆ (Debounce / Rate Limit)
- **Comment List & Items (`CommentItem.vue`)**:
  - Avatar, ชื่อผู้คอมเมนต์, เวลาสัมพันธ์ (เช่น "2 ชั่วโมงที่แล้ว")
  - สมาชิกสามารถแก้ไขหรือลบความคิดเห็นของตนเองได้

---

## 3. สถาปัตยกรรม Clean Architecture สำหรับ Vue.js (Pure JavaScript)

แยก Business Logic และ Data Layer ออกจาก Vue Template อย่างชัดเจน เพื่อความยืดหยุ่นและการบำรุงรักษา:

```
src/
├── core/                                # Core Business Logic & Data Models (Pure JS)
│   ├── models/                          # Data Models & Factory Functions
│   │   ├── blog.model.js
│   │   ├── user.model.js
│   │   └── comment.model.js
│   └── usecases/                        # Business Logic บริสุทธิ์
│       ├── auth/
│       │   ├── login.usecase.js
│       │   └── register.usecase.js
│       ├── blog/
│       │   ├── get-blogs.usecase.js
│       │   └── get-blog-detail.usecase.js
│       └── engagement/
│           ├── toggle-like.usecase.js
│           └── post-comment.usecase.js
│
├── infrastructure/                      # ชั้นเชื่อมต่อกับ Wix Headless API
│   ├── adapters/
│   │   ├── wix-client.js                # สร้าง Client instance จาก @wix/sdk
│   │   └── mappers/                     # แปลงข้อมูลจาก Wix API ให้อยู่ใน Format ของแอป
│   │       ├── blog.mapper.js
│   │       └── comment.mapper.js
│   └── repositories/                    # ฟังก์ชันยิง API ดึง/ส่งข้อมูลจริง
│       ├── wix-auth.repository.js
│       ├── wix-blog.repository.js
│       └── wix-engagement.repository.js
│
├── presentation/                        # Vue UI Layer
│   ├── components/
│   │   ├── ui/                          # BaseButton.vue, BaseInput.vue, BaseBadge.vue
│   │   ├── layout/                      # TheHeader.vue, TheFooter.vue
│   │   ├── auth/                        # AuthModal.vue, LoginForm.vue
│   │   ├── blog/                        # BlogCard.vue, BlogGrid.vue, BlogCarousel.vue
│   │   └── engagement/                  # LikeButton.vue, ShareBar.vue, CommentSection.vue
│   ├── composables/                     # Vue Composition API (Custom Hooks)
│   │   ├── useAuth.js                   # จัดการ Auth Logic
│   │   ├── useBlogDetail.js             # โหลดเนื้อหาบล็อก
│   │   ├── useLike.js                   # จัดการ Like State & Optimistic UI
│   │   └── useComments.js               # จัดการคอมเมนต์
│   └── stores/                          # State Management ด้วย Pinia
│       ├── auth.js                      # สมาชิกปัจจุบัน & Session
│       └── ui.js                        # จัดการสถานะ Modal & Toast
│
├── config/                              # ค่าคงที่และการตั้งค่า (Zero Hardcode)
│   ├── env.js                           # จัดการ Environment Variables
│   ├── site.js                          # ข้อมูลเว็บไซต์, เมนู, ข้อมูลติดต่อ คสม.
│   └── routes.js                        # รวม Path URL ทั้งหมด
└── pages/ (หรือ views/)                  # หน้าระบบ
    ├── index.vue                        # หน้าแรก
    ├── blogs/
    │   ├── index.vue                    # หน้ารวมบล็อก
    │   └── [slug].vue                   # หน้ารายละเอียดบทความ
    └── (auth)/                          # หน้า Login / Register
```

---

## 4. ตัวอย่างการเขียนโค้ดสไตล์ JavaScript ES6+

### 4.1 Data Model (`core/models/blog.model.js`)
ใช้ฟังก์ชัน Factory หรือ Object ธรรมดาในการแปลงข้อมูล:

```javascript
// core/models/blog.model.js
export function createBlog({
  id = '',
  slug = '',
  title = '',
  excerpt = '',
  contentHtml = '',
  coverImageUrl = '/images/placeholder.jpg',
  publishedAt = new Date(),
  category = { id: '', name: 'ทั่วไป' },
  author = { name: 'เครือข่ายลุ่มน้ำโขง' },
  stats = { likesCount: 0, commentsCount: 0, hasLiked: false }
} = {}) {
  return Object.freeze({
    id,
    slug,
    title,
    excerpt,
    contentHtml,
    coverImageUrl,
    publishedAt: new Date(publishedAt),
    category,
    author,
    stats
  });
}
```

### 4.2 Use Case (`core/usecases/engagement/toggle-like.usecase.js`)
```javascript
// core/usecases/engagement/toggle-like.usecase.js
export class ToggleLikeUseCase {
  constructor(engagementRepository) {
    this.engagementRepository = engagementRepository;
  }

  async execute(blogId, memberId) {
    if (!blogId || !memberId) {
      throw new Error('blogId และ memberId จำเป็นต้องระบุ');
    }
    return await this.engagementRepository.toggleLike(blogId, memberId);
  }
}
```

### 4.3 Composable พร้อม Optimistic UI (`presentation/composables/useLike.js`)
```javascript
// presentation/composables/useLike.js
import { ref } from 'vue';
import { ToggleLikeUseCase } from '~/core/usecases/engagement/toggle-like.usecase.js';
import { WixEngagementRepository } from '~/infrastructure/repositories/wix-engagement.repository.js';
import { useAuthStore } from '~/presentation/stores/auth.js';

export function useLike(blogId, initialLikes = 0, initialHasLiked = false) {
  const authStore = useAuthStore();
  const likesCount = ref(initialLikes);
  const hasLiked = ref(initialHasLiked);
  const isSubmitting = ref(false);

  const engagementRepo = new WixEngagementRepository();
  const toggleLikeUseCase = new ToggleLikeUseCase(engagementRepo);

  const handleToggleLike = async () => {
    if (!authStore.isAuthenticated) {
      authStore.openLoginModal('กรุณาเข้าสู่ระบบก่อนกดถูกใจบทความ');
      return;
    }

    // 1. Optimistic Update (เปลี่ยนสีก่อนเพื่อความไวของ UI)
    const prevLiked = hasLiked.value;
    const prevCount = likesCount.value;

    hasLiked.value = !prevLiked;
    likesCount.value += hasLiked.value ? 1 : -1;

    try {
      isSubmitting.value = true;
      const result = await toggleLikeUseCase.execute(blogId, authStore.currentUserId);
      likesCount.value = result.likesCount;
      hasLiked.value = result.hasLiked;
    } catch (error) {
      // 2. Rollback หากเกิดข้อผิดพลาด
      hasLiked.value = prevLiked;
      likesCount.value = prevCount;
      console.error('Failed to toggle like:', error);
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    likesCount,
    hasLiked,
    isSubmitting,
    handleToggleLike
  };
}
```

---

## 5. มาตรฐานการเขียนโค้ด (Zero Hardcoding & Clean Code)

### 5.1 No Hardcoded Values
- **Environment Configuration (`config/env.js`)**:
  ```javascript
  // config/env.js
  export const env = Object.freeze({
    wixClientId: process.env.NUXT_PUBLIC_WIX_CLIENT_ID || '',
    siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://hugmekong.org',
  });

  if (!env.wixClientId) {
    console.warn('[Config Warning]: NUXT_PUBLIC_WIX_CLIENT_ID is not configured.');
  }
  ```
- **Route Constants (`config/routes.js`)**:
  ```javascript
  // config/routes.js
  export const ROUTES = Object.freeze({
    HOME: '/',
    BLOGS: '/blogs',
    BLOG_DETAIL: (slug) => `/blogs/${slug}`,
    ABOUT: '/about',
    MISSIONS: '/missions',
    GALLERY: '/gallery',
    CONTACT: '/contact',
    AUTH: {
      LOGIN: '/login',
      REGISTER: '/register',
    }
  });
  ```
- **Site Metadata & Copy (`config/site.js`)**:
  เก็บข้อมูลคงที่ เช่น ชื่อองค์กร ที่อยู่ เบอร์โทรศัพท์ และเมนูหลัก

### 5.2 Vue 3 Script Setup (Standard JS)
- ใช้ `<script setup>` แบบ JavaScript ปกติ ไม่ต้องใส่ `lang="ts"`
- ใช้ `defineProps` และ `defineEmits` พร้อมระบุ Default values ด้วย Object Syntax ชัดเจน
- ใช้ ESLint + Prettier คอยตรวจทานรูปแบบโค้ด

---

## 6. การปรับแต่งประสิทธิภาพ (Performance Optimization)

1. **Rendering & Cache Strategy**:
   - หน้าบทความเนื้อหาหลัก (Title, Excerpt, Content) ใช้การแคชแบบ **SWR / ISR** โหลดได้ไวทันที
   - ข้อมูลที่ขึ้นกับ User (สถานะการกด Like หรือกล่องคอมเมนต์) ให้โหลดแบบ Client-side เพื่อไม่ขัดขวางการแคชเนื้อหา
2. **Media Optimization**:
   - ใช้ขนาดรูปภาพแบบ Responsive และใช้ Format ยุคใหม่อย่าง **WebP**
   - ใส่ `loading="lazy"` ให้กับภาพการ์ดบล็อกทั้งหมด และใส่ `aspect-ratio` เพื่อป้องกัน Layout Shift (CLS)
3. **Debounced Operations**:
   - การพิมพ์ค้นหาบล็อก และการกดปุ่ม Like ซ้ำ ๆ ให้ทำ Debounce เสมอ เพื่อลดจำนวน Request ไปยัง Wix API

---

## 7. กลยุทธ์การทำ SEO สำหรับ Vue.js / Nuxt 3

### 7.1 Semantic Tags
- วางลำดับ Heading ถูกต้อง (`<h1>` มีเพียงจุดเดียวในหน้าบทความ)
- หุ้มบทความด้วยแท็ก `<article>` พร้อมข้อมูล `<time>` สำหรับวันที่เผยแพร่

### 7.2 Dynamic SEO Meta Tags
สร้าง Meta Tags แบบไดนามิกในคอมโพเนนต์หน้ารายละเอียดบทความ:

```javascript
// pages/blogs/[slug].vue
<script setup>
import { useBlogDetail } from '~/presentation/composables/useBlogDetail.js';

const { blog } = await useBlogDetail();

useSeoMeta({
  title: () => `${blog.value.title} | HUGMEKONG เรื่องราวจากลุ่มน้ำโขง`,
  description: () => blog.value.excerpt,
  ogTitle: () => blog.value.title,
  ogDescription: () => blog.value.excerpt,
  ogImage: () => blog.value.coverImageUrl,
  ogType: 'article',
  articleAuthor: () => [blog.value.author.name],
  articlePublishedTime: () => blog.value.publishedAt.toISOString(),
  twitterCard: 'summary_large_image',
});
</script>
```

### 7.3 Structured Data (JSON-LD)
ฝัง Schema.org สำหรับ `BlogPosting` เพื่อให้ Google Search แสดงผล Rich Results:

```javascript
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: blog.value.title,
        image: [blog.value.coverImageUrl],
        datePublished: blog.value.publishedAt.toISOString(),
        author: {
          '@type': 'Person',
          name: blog.value.author.name,
        },
        publisher: {
          '@type': 'Organization',
          name: 'HUGMEKONG',
          logo: {
            '@type': 'ImageObject',
            url: 'https://hugmekong.org/logo.png',
          },
        },
        description: blog.value.excerpt,
      }),
    },
  ],
});
```

---

## 8. สรุปขั้นตอนการเริ่มพัฒนา (Actionable Next Steps)
1. ติดตั้งโปรเจกต์ด้วย Vue 3 / Nuxt 3 (JavaScript Template) + Tailwind CSS + Pinia
2. ติดตั้งแพ็กเกจเชื่อมต่อ Wix: `npm install @wix/sdk @wix/blog @wix/members`
3. ตั้งค่าไฟล์ Config (`config/env.js`, `config/routes.js`, `config/site.js`)
4. พัฒนา Use Cases และ Wix Repositories (Pure JavaScript)
5. พัฒนาคอมโพเนนต์ของ Vue 3 ด้วย Composition API (`<script setup>`)


## 9. Color Palette / Theme
- **Base Color**: Earth Tone (Stone, Amber, Orange, Emerald)
- **Primary UI Color**: Amber / Orange-700 (แทนที่ Teal)
