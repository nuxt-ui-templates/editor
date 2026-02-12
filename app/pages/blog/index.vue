<template>
  <div class="min-h-screen bg-background">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
      <div class="max-w-6xl mx-auto px-4">
        <h1 class="text-4xl font-bold mb-4">Blog & Podcasts</h1>
        <p class="text-lg opacity-90">Discover articles, episodes, and insights</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-4 py-12">
      <!-- Tabs -->
      <div class="flex gap-4 mb-12 border-b border-border">
        <button
          @click="activeTab = 'posts'"
          :class="[
            'px-4 py-2 font-medium transition',
            activeTab === 'posts'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          ]"
        >
          Posts
        </button>
        <button
          @click="activeTab = 'podcasts'"
          :class="[
            'px-4 py-2 font-medium transition',
            activeTab === 'podcasts'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          ]"
        >
          Podcasts
        </button>
      </div>

      <!-- Posts Section -->
      <div v-if="activeTab === 'posts'">
        <div v-if="postsLoading" class="text-center py-8">
          <p class="text-muted-foreground">Loading posts...</p>
        </div>
        <div v-else-if="posts.length === 0" class="text-center py-8">
          <p class="text-muted-foreground">No posts yet</p>
        </div>
        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="post in posts"
            :key="post.id"
            :to="`/blog/posts/${post.slug}`"
            class="group bg-card rounded-lg border border-border overflow-hidden hover:border-primary transition"
          >
            <div class="aspect-video bg-muted overflow-hidden">
              <img
                v-if="post.featured_image_url"
                :src="post.featured_image_url"
                :alt="post.title"
                class="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-foreground mb-2 group-hover:text-primary transition">{{ post.title }}</h3>
              <p class="text-sm text-muted-foreground mb-3 line-clamp-2">{{ post.description }}</p>
              <div class="flex justify-between items-center text-xs text-muted-foreground">
                <span>{{ formatDate(post.published_at) }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Podcasts Section -->
      <div v-if="activeTab === 'podcasts'">
        <div v-if="podcastsLoading" class="text-center py-8">
          <p class="text-muted-foreground">Loading podcasts...</p>
        </div>
        <div v-else-if="podcasts.length === 0" class="text-center py-8">
          <p class="text-muted-foreground">No podcasts yet</p>
        </div>
        <div v-else class="space-y-4">
          <NuxtLink
            v-for="podcast in podcasts"
            :key="podcast.id"
            :to="`/blog/podcasts/${podcast.slug}`"
            class="flex gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary transition group"
          >
            <div class="w-32 h-32 flex-shrink-0 bg-muted rounded overflow-hidden">
              <img
                v-if="podcast.featured_image_url"
                :src="podcast.featured_image_url"
                :alt="podcast.title"
                class="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-foreground mb-1 group-hover:text-primary transition">{{ podcast.title }}</h3>
              <p class="text-sm text-muted-foreground mb-3 line-clamp-2">{{ podcast.description }}</p>
              <div class="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span v-if="podcast.episode_number">Episode {{ podcast.episode_number }}</span>
                <span v-if="podcast.duration_seconds">{{ Math.round(podcast.duration_seconds / 60) }} min</span>
                <span>{{ formatDate(podcast.published_at) }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const activeTab = ref('posts')
const posts = ref([])
const podcasts = ref([])
const postsLoading = ref(true)
const podcastsLoading = ref(true)

onMounted(async () => {
  try {
    const { data: postsData } = await $fetch('/api/posts?status=published&limit=12')
    posts.value = postsData || []
  }
  catch (error) {
    console.error('Failed to load posts:', error)
  }
  finally {
    postsLoading.value = false
  }

  try {
    const { data: podcastsData } = await $fetch('/api/podcasts?status=published&limit=12')
    podcasts.value = podcastsData || []
  }
  catch (error) {
    console.error('Failed to load podcasts:', error)
  }
  finally {
    podcastsLoading.value = false
  }
})

const formatDate = (timestamp: number) => {
  if (!timestamp) return 'Recently'
  return new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>
