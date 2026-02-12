<template>
  <div class="min-h-screen bg-background">
    <!-- Admin Navigation -->
    <div class="bg-card border-b border-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div>
            <h1 class="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <button
            @click="logout"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Admin Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <!-- Stats Cards -->
        <div class="bg-card p-6 rounded-lg border border-border">
          <div class="text-sm font-medium text-muted-foreground">Total Posts</div>
          <div class="mt-2 text-3xl font-bold text-foreground">--</div>
        </div>
        <div class="bg-card p-6 rounded-lg border border-border">
          <div class="text-sm font-medium text-muted-foreground">Total Podcasts</div>
          <div class="mt-2 text-3xl font-bold text-foreground">--</div>
        </div>
        <div class="bg-card p-6 rounded-lg border border-border">
          <div class="text-sm font-medium text-muted-foreground">Published Posts</div>
          <div class="mt-2 text-3xl font-bold text-foreground">--</div>
        </div>
        <div class="bg-card p-6 rounded-lg border border-border">
          <div class="text-sm font-medium text-muted-foreground">Drafts</div>
          <div class="mt-2 text-3xl font-bold text-foreground">--</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex flex-wrap gap-4 mb-8">
        <NuxtLink
          to="/admin/posts"
          class="px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90"
        >
          Manage Posts
        </NuxtLink>
        <NuxtLink
          to="/admin/podcasts"
          class="px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90"
        >
          Manage Podcasts
        </NuxtLink>
        <NuxtLink
          to="/admin/media"
          class="px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90"
        >
          Media Library
        </NuxtLink>
      </div>

      <!-- Recent Activity -->
      <div class="bg-card p-6 rounded-lg border border-border">
        <h2 class="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
        <p class="text-muted-foreground">Recent posts and podcasts will appear here</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const auth = useAuth()

const logout = async () => {
  try {
    await auth.logout()
    await navigateTo('/admin/login')
  }
  catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>
