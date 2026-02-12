<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/admin/posts" class="text-primary hover:underline">← Back to Posts</NuxtLink>
      <h2 class="text-2xl font-bold text-foreground mt-2">Create New Post</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6 max-w-2xl">
      <div>
        <label for="title" class="block text-sm font-medium text-foreground mb-1">Title *</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Post title"
        />
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-foreground mb-1">Description *</label>
        <textarea
          id="description"
          v-model="form.description"
          required
          rows="3"
          class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Brief description"
        />
      </div>

      <div>
        <label for="content" class="block text-sm font-medium text-foreground mb-1">Content *</label>
        <textarea
          id="content"
          v-model="form.content"
          required
          rows="10"
          class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
          placeholder="Post content (Markdown or HTML)"
        />
      </div>

      <div>
        <label for="featured_image_url" class="block text-sm font-medium text-foreground mb-1">Featured Image URL</label>
        <input
          id="featured_image_url"
          v-model="form.featured_image_url"
          type="url"
          class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="https://..."
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="status" class="block text-sm font-medium text-foreground mb-1">Status</label>
          <select
            id="status"
            v-model="form.status"
            class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-6 py-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 disabled:opacity-50"
        >
          {{ isSubmitting ? 'Creating...' : 'Create Post' }}
        </button>
        <NuxtLink
          to="/admin/posts"
          class="px-6 py-2 bg-background border border-border rounded font-medium hover:bg-muted"
        >
          Cancel
        </NuxtLink>
      </div>

      <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const form = ref({
  title: '',
  description: '',
  content: '',
  featured_image_url: '',
  status: 'draft'
})

const isSubmitting = ref(false)
const error = ref<string | null>(null)
const postsAdmin = useAdminPosts()

const handleSubmit = async () => {
  isSubmitting.value = true
  error.value = null

  try {
    await postsAdmin.createPost(form.value)
    await navigateTo('/admin/posts')
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create post'
  }
  finally {
    isSubmitting.value = false
  }
}
</script>
