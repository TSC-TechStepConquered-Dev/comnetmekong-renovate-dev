export const ROUTES = Object.freeze({
  HOME: '/',
  BLOGS: '/blogs',
  BLOG_DETAIL: (id) => `/blogs/${id}`,
  ABOUT: '/about',
  MISSIONS: '/missions',
  GALLERY: '/gallery',
  CONTACT: '/contact',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  }
});
