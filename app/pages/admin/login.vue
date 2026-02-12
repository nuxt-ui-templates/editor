<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="bg-card rounded-lg border border-border p-8 shadow-sm">
        <h1 class="text-2xl font-bold text-foreground mb-2 text-center">Blog Admin</h1>
        <p class="text-muted-foreground text-center mb-8">Sign in to your account</p>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-foreground mb-1">
              Email Address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-foreground mb-1">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            :disabled="auth.isLoading"
            class="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50"
          >
            {{ auth.isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <div v-if="auth.error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          {{ auth.error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const email = ref('')
const password = ref('')
const auth = useAuth()

const handleLogin = async () => {
  try {
    await auth.login(email.value, password.value)
    await navigateTo('/admin')
  }
  catch (error) {
    console.error('Login failed:', error)
  }
}
</script>
