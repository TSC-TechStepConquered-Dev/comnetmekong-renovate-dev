import { defineStore } from 'pinia'
import { WixBlogRepository } from '../../infrastructure/repositories/wix-blog.repository'

const blogRepo = new WixBlogRepository()

export const useBlogStore = defineStore('blog', {
  state: () => ({
    latestBlogs: [],
    blogDetailsCache: {}, // { [id]: blogObject }
    isLatestBlogsLoaded: false,
    lastFetchTime: 0
  }),
  
  actions: {
    async fetchLatestBlogs(force = false) {
      // Return from cache if we have it and it's not forced
      // Cache expiration: 5 minutes (300000 ms)
      const now = Date.now()
      const CACHE_TIME = 5 * 60 * 1000
      
      if (!force && this.isLatestBlogsLoaded && (now - this.lastFetchTime < CACHE_TIME) && this.latestBlogs.length > 0) {
        // We trigger a background refresh (Stale-While-Revalidate)
        this._backgroundFetchLatest()
        return this.latestBlogs
      }
      
      // Fetch fresh data
      const data = await blogRepo.getLatestBlogs()
      this.latestBlogs = data
      this.isLatestBlogsLoaded = true
      this.lastFetchTime = now
      
      // Add these to individual cache too
      data.forEach(blog => {
        if (!this.blogDetailsCache[blog.id]) {
          this.blogDetailsCache[blog.id] = blog
        }
      })
      
      return this.latestBlogs
    },
    
    async _backgroundFetchLatest() {
      try {
        const data = await blogRepo.getLatestBlogs()
        this.latestBlogs = data
        this.lastFetchTime = Date.now()
        data.forEach(blog => {
          if (!this.blogDetailsCache[blog.id] || !this.blogDetailsCache[blog.id].content) {
            this.blogDetailsCache[blog.id] = { ...this.blogDetailsCache[blog.id], ...blog }
          }
        })
      } catch (err) {
        console.warn('Background fetch failed', err)
      }
    },
    
    getBlogFromCache(id) {
      return this.blogDetailsCache[id] || this.latestBlogs.find(b => b.id === id) || null
    },
    
    async fetchBlogDetail(id) {
      // 1. Check if we have it fully cached (has rich content)
      const cached = this.blogDetailsCache[id]
      
      // We do a background fetch to ensure fresh comments and likes anyway
      const backgroundFetch = async () => {
        try {
          const freshData = await blogRepo.getBlogById(id)
          this.blogDetailsCache[id] = freshData
          return freshData
        } catch (err) {
          console.warn('Failed to refresh blog detail', err)
          return null
        }
      }
      
      if (cached && cached.content && cached.content !== '<p>ไม่มีเนื้อหา</p>' && !cached.content.includes('Mock Content')) {
        // Return cached immediately, refresh in background
        backgroundFetch()
        return cached
      }
      
      // Await fresh fetch if not cached or partial cache
      const freshData = await backgroundFetch()
      return freshData || cached
    }
  }
})
