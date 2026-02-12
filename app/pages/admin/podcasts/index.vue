<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-foreground">Podcasts</h2>
      <NuxtLink
        to="/admin/podcasts/create"
        class="px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90"
      >
        Create Podcast
      </NuxtLink>
    </div>

    <div v-if="isLoading" class="text-center py-8">
      <p class="text-muted-foreground">Loading podcasts...</p>
    </div>

    <div v-else-if="podcasts.length === 0" class="text-center py-8">
      <p class="text-muted-foreground">No podcasts yet. Create your first one!</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="podcast in podcasts"
        :key="podcast.id"
        class="bg-card p-4 rounded-lg border border-border hover:border-primary transition"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-foreground mb-1">{{ podcast.title }}</h3>
            <p class="text-muted-foreground text-sm mb-2">{{ podcast.description }}</p>
            <div class="flex gap-4 text-xs text-muted-foreground">
              <span>{{ formatDate(podcast.created_at) }}</span>
              <span class="px-2 py-1 bg-background rounded">{{ podcast.status }}</span>
              <span v-if="podcast.episode_number">Ep. {{ podcast.episode_number }}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <NuxtLink
              :to="`/admin/podcasts/edit/${podcast.id}`"
              class="px-3 py-1 text-sm bg-background border border-border rounded hover:bg-muted"
            >
              Edit
            </NuxtLink>
            <button
              @click="deletePodcast(podcast.id)"
              class="px-3 py-1 text-sm bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const podcasts = ref([])
const isLoading = ref(true)
const auth = useAuth()

onMounted(async () => {
  try {
    const { data } = await $fetch('/api/podcasts', {
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })
    if (data) podcasts.value = data
  }
  catch (error) {
    console.error('Failed to load podcasts:', error)
  }
  finally {
    isLoading.value = false
  }
})

const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString()

const deletePodcast = async (id: string) => {
  if (confirm('Delete this podcast?')) {
    try {
      await $fetch(`/api/podcasts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      podcasts.value = podcasts.value.filter(p => p.id !== id)
    }
    catch (error) {
      console.error('Delete failed:', error)
    }
  }
}
</script>
