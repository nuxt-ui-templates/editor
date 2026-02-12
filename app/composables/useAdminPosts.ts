import { ref, computed } from 'vue'
import { useFetch } from '#app'

interface Post {
  id: string
  title: string
  slug: string
  description: string
  status: 'draft' | 'published' | 'archived'
  featured_image_url?: string
  published_at?: number
  created_at: number
  updated_at: number
}

export const useAdminPosts = () => {
  const posts = ref<Post[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const totalCount = ref(0)

  const auth = useAuth()

  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

  async function fetchPosts(page = 1) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useFetch(
        `/api/posts?page=${page}&limit=${pageSize.value}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`
          }
        }
      )

      if (fetchError.value) {
        throw new Error(fetchError.value.message)
      }

      if (data.value?.success) {
        posts.value = data.value.data
        totalCount.value = data.value.pagination.totalCount
        currentPage.value = page
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch posts'
    }
    finally {
      isLoading.value = false
    }
  }

  async function createPost(postData: Partial<Post> & { content: string }) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useFetch('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`
        },
        body: postData
      })

      if (fetchError.value) {
        throw new Error(fetchError.value.message)
      }

      if (data.value?.success) {
        posts.value.unshift(data.value.data)
        return data.value.data
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create post'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  async function updatePost(id: string, postData: Partial<Post>) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useFetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${auth.token}`
        },
        body: postData
      })

      if (fetchError.value) {
        throw new Error(fetchError.value.message)
      }

      if (data.value?.success) {
        const index = posts.value.findIndex(p => p.id === id)
        if (index > -1) {
          posts.value[index] = data.value.data
        }
        return data.value.data
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update post'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  async function deletePost(id: string) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useFetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      })

      if (fetchError.value) {
        throw new Error(fetchError.value.message)
      }

      if (data.value?.success) {
        posts.value = posts.value.filter(p => p.id !== id)
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete post'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    posts,
    isLoading,
    error,
    currentPage,
    totalPages,
    pageSize,
    fetchPosts,
    createPost,
    updatePost,
    deletePost
  }
}
