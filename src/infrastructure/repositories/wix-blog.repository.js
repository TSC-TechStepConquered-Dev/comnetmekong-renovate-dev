import { ENV } from '@/config/env'

const BASE_URL = ENV.WIX_BASE_URL

export class WixBlogRepository {
  async getLatestBlogs() {
    try {
      const response = await fetch(`${BASE_URL}/news?limit=50`).catch(() => null)
      if (!response || !response.ok) {
        return []
      }
      const result = await response.json()
      const items = result.items || result.data || result

      // Map Wix structure to our app structure
      if (Array.isArray(items)) {
        return items.map((item) => ({
          id: item.id || item._id,
          title: item.title,
          summary: item.excerpt || item.summary,
          imageUrl:
            item.coverImage ||
            item.imageUrl ||
            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop',
          date: item.publishedDate
            ? new Date(item.publishedDate).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : 'ไม่ระบุวันที่',
          author: this._extractAuthorName(item.author),
          category: item.category || 'ข่าวสาร',
          views: item.viewCount || 0,
          likes: item.totalLikes || 0,
        }))
      }
      return []
    } catch (error) {
      console.warn('Error fetching blogs:', error)
      return []
    }
  }

  // Helper to extract author name safely
  _extractAuthorName(author) {
    if (!author) return 'ไม่ระบุผู้เขียน'
    if (typeof author === 'object') return author.name || 'ไม่ระบุผู้เขียน'
    if (typeof author === 'string') {
      if (author.startsWith('{')) {
        try {
          return JSON.parse(author).name || 'ไม่ระบุผู้เขียน'
          // oxlint-disable-next-line no-unused-vars
        } catch (e) {
          return author
        }
      }
      return author
    }
    return 'ไม่ระบุผู้เขียน'
  }

  // Helper for Wix RichContent
  _parseRichContent(richContent) {
    if (!richContent || !richContent.nodes) return '<p>ไม่มีเนื้อหา</p>'
    let html = ''
    for (const node of richContent.nodes) {
      if (node.type === 'PARAGRAPH') {
        let text = ''
        if (node.nodes && node.nodes.length > 0) {
          text = node.nodes.map((n) => (n.textData ? n.textData.text : '')).join('')
        }
        if (text) {
          html += `<p class="mb-4">${text}</p>`
        } else {
          html += `<br/>`
        }
      } else if (node.type === 'IMAGE' && node.imageData && node.imageData.image) {
        html += `<img src="${node.imageData.image.url}" class="w-full rounded-2xl mb-6 shadow-sm" alt="Image" loading="lazy" decoding="async" />`
      }
    }
    return html || '<p>ไม่มีเนื้อหา</p>'
  }

  async getBlogById(id) {
    try {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
      const paramName = (isObjectId || isUUID) ? 'id' : 'slug';
      const response = await fetch(`${BASE_URL}/postDetail?${paramName}=${id}`).catch(() => null)
      if (!response || !response.ok) {
        throw new Error('Blog not found')
      }

      const result = await response.json()
      const item = result.post || result.data || result.item || result

      return {
        id: item.id || item._id,
        title: item.title,
        summary: item.excerpt || item.summary,
        content:
          item.content ||
          (item.richContent ? this._parseRichContent(item.richContent) : '<p>ไม่มีเนื้อหา</p>'),
        imageUrl:
          item.coverImage ||
          item.imageUrl ||
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop',
        date: item.publishedDate
          ? new Date(item.publishedDate).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : 'ไม่ระบุวันที่',
        author: this._extractAuthorName(item.author),
        category: item.category || 'ข่าวสาร',
        views: item.viewCount || 0,
        likes: item.totalLikes || 0,
        comments: (item.comments || []).map((c) => ({
          ...c,
          date: c.createdAt
            ? new Date(c.createdAt).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'ไม่ระบุวันที่',
        })),
      }
    } catch (error) {
      console.warn('Error fetching blog:', error)
      throw error
    }
  }

  async incrementView(id) {
    try {
      await fetch(`${BASE_URL}/addView`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id }),
      }).catch(() => null)
      // oxlint-disable-next-line no-unused-vars
    } catch (error) {
      console.warn('Failed to increment view')
    }
  }

  async toggleLike(id, token) {
    try {
      const response = await fetch(`${BASE_URL}/toggleLike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: id }),
      }).catch(() => null)

      if (!response || !response.ok) {
        console.warn('Backend API /toggleLike failed, using frontend fallback.');
        return null;
      }
      return await response.json()
    } catch (error) {
      console.warn('Backend API /toggleLike failed, using frontend fallback.', error);
      return null;
    }
  }

  async addComment(id, token, content, authorName) {
    let response
    try {
      response = await fetch(`${BASE_URL}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: id, slug: id, content, authorName }),
      })
    } catch (err) {
      throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (CORS หรือ Network Error)', {
        cause: err,
      })
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message ||
          `เซิร์ฟเวอร์ตอบกลับด้วยรหัส ${response.status} (Internal Server Error)`,
      )
    }
    return await response.json()
  }

  async deleteComment(commentId, token) {
    let response
    try {
      response = await fetch(`${BASE_URL}/deleteComment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentId }),
      })
    } catch (err) {
      throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (CORS หรือ Network Error)', {
        cause: err,
      })
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `เซิร์ฟเวอร์ตอบกลับด้วยรหัส ${response.status} (ล้มเหลว)`,
      )
    }
    return await response.json()
  }

  async updateComment(commentId, token, content) {
    let response
    try {
      response = await fetch(`${BASE_URL}/updateComment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentId, content }),
      })
      // oxlint-disable-next-line no-unused-vars
    } catch (err) {
      throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (CORS หรือ Network Error)', {
        cause: err,
      })
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `เซิร์ฟเวอร์ตอบกลับด้วยรหัส ${response.status} (ล้มเหลว)`,
      )
    }
    return await response.json()
  }

  async checkLike(id, token) {
    if (!token) return false
    try {
      const response = await fetch(`${BASE_URL}/checkLike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: id }),
      }).catch(() => null)
      if (response && response.ok) {
        const result = await response.json()
        return result.isLiked === true
      }
      // oxlint-disable-next-line no-unused-vars
    } catch (err) {
      return false
    }
    return false
  }

  async getUserInteractions(id, token) {
    if (!token) return { hasLiked: false, userComments: [] }
    try {
      const response = await fetch(`${BASE_URL}/userInteractions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: id }),
      }).catch(() => null)

      if (response && response.ok) {
        return await response.json()
      }
    } catch (err) {
      console.warn('Error fetching user interactions', err)
    }
    return { hasLiked: false, userComments: [] }
  }
}
