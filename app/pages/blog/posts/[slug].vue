<template>
  <div class="min-h-screen bg-background">
    <div v-if="loading" class="flex items-center justify-center py-12">
      <p class="text-muted-foreground">Loading...</p>
    </div>

    <div v-else-if="post" class="max-w-4xl mx-auto px-4 py-12">
      <!-- Hero Image -->
      <div v-if="post.featured_image_url" class="mb-8 -mx-4 md:mx-0 md:rounded-lg overflow-hidden">
        <img :src="post.featured_image_url" :alt="post.title" class="w-full h-96 object-cover" />
      </div>

      <!-- Meta -->
      <div class="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
        <span>{{ formatDate(post.published_at) }}</span>
        <span v-if="post.reading_time_minutes">{{ post.reading_time_minutes }} min read</span>
      </div>

      <!-- Title -->
      <h1 class="text-5xl font-bold text-foreground mb-4">{{ post.title }}</h1>
      <p class="text-xl text-muted-foreground mb-8">{{ post.description }}</p>

      <!-- Tags -->
      <div v-if="post.tags?.length" class="flex flex-wrap gap-2 mb-12">
        <NuxtLink
          v-for="tag in post.tags"
          :key="tag.id"
          :to="`/blog/tags/${tag.slug}`"
          class="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:opacity-80"
        >
          {{ tag.name }}
        </NuxtLink>
      </div>

      <!-- Content -->
      <div class="prose max-w-none mb-12 text-foreground">
        <div v-html="sanitizeHtml(post.content)" />
      </div>

      <!-- Navigation -->
      <div class="border-t border-border pt-8">
        <NuxtLink to="/blog" class="text-primary hover:underline">← Back to Blog</NuxtLink>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-muted-foreground">Post not found</p>
      <NuxtLink to="/blog" class="text-primary hover:underline mt-4 inline-block">Back to Blog</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const post = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const slug = route.params.slug as string
    const { data } = await $fetch(`/api/posts?slug=${slug}`)
    if (data?.length) {
      post.value = data[0]
    }
  }
  catch (error) {
    console.error('Failed to load post:', error)
  }
  finally {
    loading.value = false
  }
})

const formatDate = (timestamp: number) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const sanitizeHtml = (html: string) => {
  // Basic sanitization - in production, use DOMPurify
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}
</script>

<style scoped>
:deep(.prose) {
  line-height: 1.8;
}

:deep(.prose h2) {
  @apply text-2xl font-bold mt-8 mb-4;
}

:deep(.prose p) {
  @apply my-4;
}

:deep(.prose img) {
  @apply my-8 rounded-lg;
}

:deep(.prose code) {
  @apply bg-muted px-2 py-1 rounded text-sm;
}

:deep(.prose pre) {
  @apply bg-muted p-4 rounded-lg overflow-x-auto my-4;
}
</style>
