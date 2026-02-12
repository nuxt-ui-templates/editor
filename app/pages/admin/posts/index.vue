<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-foreground">Posts</h2>
      <NuxtLink
        to="/admin/posts/create"
        class="px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90"
      >
        Create Post
      </NuxtLink>
    </div>

    <div v-if="postsAdmin.isLoading" class="text-center py-8">
      <p class="text-muted-foreground">Loading posts...</p>
    </div>

    <div v-else-if="postsAdmin.posts.length === 0" class="text-center py-8">
      <p class="text-muted-foreground">No posts yet. Create your first one!</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="post in postsAdmin.posts"
        :key="post.id"
        class="bg-card p-4 rounded-lg border border-border hover:border-primary transition"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-foreground mb-1">{{ post.title }}</h3>
            <p class="text-muted-foreground text-sm mb-2">{{ post.description }}</p>
            <div class="flex gap-4 text-xs text-muted-foreground">
              <span>{{ formatDate(post.created_at) }}</span>
              <span class="px-2 py-1 bg-background rounded">{{ post.status }}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <NuxtLink
              :to="`/admin/posts/edit/${post.id}`"
              class="px-3 py-1 text-sm bg-background border border-border rounded hover:bg-muted"
            >
              Edit
            </NuxtLink>
            <button
              @click="deletePost(post.id)"
              class="px-3 py-1 text-sm bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="postsAdmin.totalPages > 1" class="mt-6 flex justify-center gap-2">
      <button
        v-for="page in postsAdmin.totalPages"
        :key="page"
        @click="postsAdmin.fetchPosts(page)"
        :class="[
          'px-3 py-1 rounded',
          page === postsAdmin.currentPage
            ? 'bg-primary text-primary-foreground'
            : 'bg-background border border-border hover:bg-muted'
        ]"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const postsAdmin = useAdminPosts()

onMounted(() => {
  postsAdmin.fetchPosts()
})

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString()
}

const deletePost = async (id: string) => {
  if (confirm('Are you sure you want to delete this post?')) {
    try {
      await postsAdmin.deletePost(id)
    }
    catch (error) {
      console.error('Delete failed:', error)
    }
  }
}
</script>
