export const ROUTES = Object.freeze({
  HOME: '/',
  BLOGS: '/blogs',
  BLOG_DETAIL: (id) => `/blogs/${id}`,
  ABOUT: '/about',
  MEKONG_YOUTH: '/mekong-youth',
  OUR_WORK: '/our-work',
  MISSIONS: '/missions',
  GALLERY: '/gallery',
  MULTIMEDIA: '/multimedia',
  CONTACT: '/contact',
  DONATE: '/donate',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  }
});
