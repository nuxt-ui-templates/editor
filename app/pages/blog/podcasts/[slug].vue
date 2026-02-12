<template>
  <div class="min-h-screen bg-background">
    <div v-if="loading" class="flex items-center justify-center py-12">
      <p class="text-muted-foreground">Loading...</p>
    </div>

    <div v-else-if="podcast" class="max-w-4xl mx-auto px-4 py-12">
      <!-- Hero Image -->
      <div v-if="podcast.featured_image_url" class="mb-8 -mx-4 md:mx-0 md:rounded-lg overflow-hidden">
        <img :src="podcast.featured_image_url" :alt="podcast.title" class="w-full h-96 object-cover" />
      </div>

      <!-- Meta -->
      <div class="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
        <span>{{ formatDate(podcast.published_at) }}</span>
        <span v-if="podcast.episode_number">Episode {{ podcast.episode_number }}</span>
        <span v-if="podcast.duration_seconds">{{ Math.round(podcast.duration_seconds / 60) }} min</span>
      </div>

      <!-- Title -->
      <h1 class="text-5xl font-bold text-foreground mb-4">{{ podcast.title }}</h1>
      <p class="text-xl text-muted-foreground mb-8">{{ podcast.description }}</p>

      <!-- YouTube Player -->
      <div v-if="podcast.youtube_video_id" class="mb-12 aspect-video rounded-lg overflow-hidden">
        <iframe
          :src="`https://www.youtube.com/embed/${podcast.youtube_video_id}`"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          class="w-full h-full"
        />
      </div>

      <!-- AI Analysis -->
      <div v-if="podcast.ai_analysis" class="mb-12 p-6 bg-secondary rounded-lg">
        <h2 class="text-lg font-semibold text-foreground mb-4">Episode Summary</h2>
        <div class="text-foreground whitespace-pre-wrap">{{ podcast.ai_analysis }}</div>
      </div>

      <!-- Transcript -->
      <div v-if="podcast.transcript" class="mb-12">
        <details class="bg-muted p-4 rounded-lg cursor-pointer">
          <summary class="font-semibold text-foreground">Transcript</summary>
          <div class="mt-4 text-foreground text-sm whitespace-pre-wrap">{{ podcast.transcript }}</div>
        </details>
      </div>

      <!-- Tags -->
      <div v-if="podcast.tags?.length" class="flex flex-wrap gap-2 mb-12">
        <NuxtLink
          v-for="tag in podcast.tags"
          :key="tag.id"
          :to="`/blog/tags/${tag.slug}`"
          class="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:opacity-80"
        >
          {{ tag.name }}
        </NuxtLink>
      </div>

      <!-- Navigation -->
      <div class="border-t border-border pt-8">
        <NuxtLink to="/blog" class="text-primary hover:underline">← Back to Blog</NuxtLink>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-muted-foreground">Podcast not found</p>
      <NuxtLink to="/blog" class="text-primary hover:underline mt-4 inline-block">Back to Blog</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const podcast = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const slug = route.params.slug as string
    const { data } = await $fetch(`/api/podcasts?slug=${slug}`)
    if (data?.length) {
      podcast.value = data[0]
    }
  }
  catch (error) {
    console.error('Failed to load podcast:', error)
  }
  finally {
    loading.value = false
  }
})

const formatDate = (timestamp: number) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>
