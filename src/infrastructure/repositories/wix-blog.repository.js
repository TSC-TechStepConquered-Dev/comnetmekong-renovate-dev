const BASE_URL = import.meta.env.VITE_WIX_BASE_URL || 'https://www.comnetmekong.org/_functions'

// ข้อมูลจำลองสำหรับ Blog (Mock Data)
const MOCK_BLOGS = [
  {
    id: 'blog_01',
    title: 'รู้จักปลากยี่สกไทย',
    summary: 'ถิ่นกำเนิด ปลาสี่สกมี 2 ชนิดคือ ปลาสี่สกไทย และปลาสี่สกเทศ สำหรับปลาสี่สกไทย เป็นปลาน้ำจืดที่พบในแม่น้ำโขงและเป็นปลาที่หายากอีกชนิดหนึ่ง...',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop',
    date: '2 ก.ย. 2569',
    category: 'ข่าวสาร',
    views: 1240,
    likes: 45
  },
  {
    id: 'blog_02',
    title: 'ประกาศผลการคัดเลือก 7 ทีมเยาวชนเข้าสู่เวทีนำเสนอผลงาน',
    summary: 'สมาคมเครือข่ายสภาองค์กรชุมชนลุ่มน้ำโขง 7 จังหวัดภาคอีสาน (คสช.) มีความยินดีแจ้งผลการพิจารณาคัดเลือกทีมเยาวชนคนรุ่นใหม่...',
    imageUrl: 'https://images.unsplash.com/photo-1511649475669-e288648b2339?q=80&w=2232&auto=format&fit=crop',
    date: '2 ก.ย. 2569',
    category: 'ข่าวสาร',
    views: 890,
    likes: 22
  },
  {
    id: 'blog_03',
    title: 'ภาพยนตร์สารคดีสั้น “ปลาแค้ตุ่ม” สำรวจเหตุการณ์แม่น้ำโขงพบปลามีตุ่มผิดปกติ',
    summary: '[English Below] 🎥 เชิญชมภาพยนตร์สารคดีสั้น “ปลาแค้ตุ่ม” ที่จะพาผู้ชมไปสำรวจเหตุการณ์จริงที่ชาวประมงพื้นบ้านริมแม่น้ำโขงพบปลาที่มีตุ่มผิดปกติตามลำตัว...',
    imageUrl: 'https://images.unsplash.com/photo-1522069169874-c58ced4e0df0?q=80&w=2070&auto=format&fit=crop',
    date: '22 ก.ค. 2569',
    category: 'ข่าวสาร',
    views: 3105,
    likes: 120
  },
  {
    id: 'blog_04',
    title: 'คอมมิวนิสต์ในความคิดคำนึง : ชีวิตของ “สหายระวี” จากป่าเขา',
    summary: 'เรื่องราวและบทสัมภาษณ์ของผู้ที่เคยเข้าร่วมขบวนการ และมุมมองที่สะท้อนถึงการเปลี่ยนแปลงทางสังคมที่สำคัญ...',
    imageUrl: 'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?q=80&w=2070&auto=format&fit=crop',
    date: '22 เม.ย. 2569',
    category: 'ข่าวสาร',
    views: 450,
    likes: 15
  },
  {
    id: 'blog_05',
    title: '“สุดตา อินสำราญ: ลูกหลานเมืองช้าง...”',
    summary: 'บันทึกเรื่องราวชีวิตของผู้คนที่ผูกพันกับท้องถิ่น และการต่อสู้เพื่อรักษาวิถีชีวิตดั้งเดิมให้คงอยู่...',
    imageUrl: 'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?q=80&w=2012&auto=format&fit=crop',
    date: '21 เม.ย. 2569',
    category: 'ข่าวสาร',
    views: 620,
    likes: 30
  },
  {
    id: 'blog_06',
    title: 'จากเดินเท้าเข้าแทนปลา สู่การแก้ปัญหาที่เป็นรูปธรรม',
    summary: 'ติดตามกระบวนการทำงานของเครือข่ายภาคประชาชนในการอนุรักษ์พันธุ์ปลาและการฟื้นฟูระบบนิเวศ...',
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069&auto=format&fit=crop',
    date: '17 ก.ค. 2567',
    category: 'ข่าวสาร',
    views: 1850,
    likes: 88
  }
]

export class WixBlogRepository {
  async getLatestBlogs() {
    try {
      const response = await fetch(`${BASE_URL}/news?limit=50`).catch(() => null)
      if (!response || !response.ok) {
        return MOCK_BLOGS
      }
      const result = await response.json()
      const items = result.items || result.data || result
      
      // Map Wix structure to our app structure
      if (Array.isArray(items)) {
        return items.map(item => ({
          id: item.id || item._id,
          title: item.title,
          summary: item.excerpt || item.summary,
          imageUrl: item.coverImage || item.imageUrl || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop',
          date: item.publishedDate ? new Date(item.publishedDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'ไม่ระบุวันที่',
          author: this._extractAuthorName(item.author),
          category: item.category || 'ข่าวสาร',
          views: item.viewCount || 0,
          likes: item.totalLikes || 0
        }))
      }
      return MOCK_BLOGS
    } catch (error) {
      console.warn('Error fetching blogs, using mock data', error)
      return MOCK_BLOGS
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
          text = node.nodes.map(n => n.textData ? n.textData.text : '').join('')
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
      const response = await fetch(`${BASE_URL}/postDetail?id=${id}`).catch(() => null)
      if (!response || !response.ok) {
        // Fallback to Mock
        const blog = MOCK_BLOGS.find(b => b.id === id)
        if (!blog) throw new Error('Blog not found')
        
        return {
          ...blog,
          content: `
            <p class="mb-4">นี่คือเนื้อหาจำลองของบทความ <strong>${blog.title}</strong></p>
            <p class="mb-4">เนื้อหานี้จะถูกแทนที่ด้วยข้อมูลจริงจากระบบ CMS ของ Wix เมื่อทำการเชื่อมต่อ API สำเร็จ สามารถทดสอบการทำงานของปุ่มกดไลก์ คอมเมนต์ และแชร์ได้เลยครับ</p>
            <p class="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          `,
          comments: [
            { id: 1, authorName: 'ผู้เยี่ยมชม A', content: 'บทความนี้มีประโยชน์มากครับ', date: '2 วันที่แล้ว' }
          ]
        }
      }
      
      const result = await response.json()
      const item = result.post || result.data || result.item || result
      
      return {
        id: item.id || item._id,
        title: item.title,
        summary: item.excerpt || item.summary,
        content: item.content || (item.richContent ? this._parseRichContent(item.richContent) : '<p>ไม่มีเนื้อหา</p>'),
        imageUrl: item.coverImage || item.imageUrl || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop',
        date: item.publishedDate ? new Date(item.publishedDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'ไม่ระบุวันที่',
        author: this._extractAuthorName(item.author),
        category: item.category || 'ข่าวสาร',
        views: item.viewCount || 0,
        likes: item.totalLikes || 0,
        comments: (item.comments || []).map(c => ({
          ...c,
          date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'ไม่ระบุวันที่'
        }))
      }
    } catch (error) {
      console.warn('Error fetching blog, using mock data', error)
      const blog = MOCK_BLOGS.find(b => b.id === id)
      return {
        ...blog,
        content: '<p>Mock Content (Offline Mode)</p>',
        comments: []
      }
    }
  }

  async incrementView(id) {
    try {
      await fetch(`${BASE_URL}/addView`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id })
      }).catch(() => null)
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId: id })
      })

      if (!response || !response.ok) {
        throw new Error('ไม่สามารถอัปเดตข้อมูลการกดถูกใจได้')
      }
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  async addComment(id, token, content, authorName) {
    let response;
    try {
      response = await fetch(`${BASE_URL}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId: id, slug: id, content, authorName })
      })
    } catch (err) {
      throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (CORS หรือ Network Error)')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `เซิร์ฟเวอร์ตอบกลับด้วยรหัส ${response.status} (Internal Server Error)`)
    }
    return await response.json()
  }

  async deleteComment(commentId, token) {
    let response;
    try {
      response = await fetch(`${BASE_URL}/deleteComment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commentId })
      })
    } catch (err) {
      throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (CORS หรือ Network Error)')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `เซิร์ฟเวอร์ตอบกลับด้วยรหัส ${response.status} (ล้มเหลว)`)
    }
    return await response.json()
  }

  async updateComment(commentId, token, content) {
    let response;
    try {
      response = await fetch(`${BASE_URL}/updateComment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commentId, content })
      })
    } catch (err) {
      throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (CORS หรือ Network Error)')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `เซิร์ฟเวอร์ตอบกลับด้วยรหัส ${response.status} (ล้มเหลว)`)
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId: id })
      }).catch(() => null)
      if (response && response.ok) {
        const result = await response.json()
        return result.isLiked === true
      }
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId: id })
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
