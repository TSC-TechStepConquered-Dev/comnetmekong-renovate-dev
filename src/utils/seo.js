/**
 * Helper function to generate comprehensive SEO meta tags for a page.
 * @param {Object} options
 * @param {string} options.title - The title of the page
 * @param {string} options.description - A brief description of the page content
 * @param {string} [options.image] - URL of the image for social sharing
 * @param {string} [options.url] - The canonical URL of the page
 * @returns {Array} Array of meta tag objects for useHead
 */
export function generateSEO({ title, description, image, url }) {
  const defaultImage = 'https://www.comnetmekong.org/assets/logo_2.avif' // Replace with your actual default image if needed
  const defaultUrl = 'https://www.comnetmekong.org'
  const finalImage = image || defaultImage
  const finalUrl = url || defaultUrl

  return [
    { name: 'description', content: description },
    { name: 'keywords', content: 'COMNETMEKONG, แม่น้ำโขง, อนุรักษ์ลุ่มน้ำโขง, สภาองค์กรชุมชน, เครือข่ายชุมชน, เยาวชน, องค์กรพัฒนาเอกชน' },
    
    // Open Graph / Facebook
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: finalUrl },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: finalImage },
    
    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: finalUrl },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: finalImage }
  ]
}
