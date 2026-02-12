// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxthub/core',
    'nuxt-csurf'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  ui: {
    experimental: {
      componentDetection: true
    }
  },

  runtimeConfig: {
    // Private keys only accessible server-side
    jwtSecret: process.env.JWT_SECRET,
    d1DatabaseId: process.env.D1_DATABASE_ID,
    r2AccountId: process.env.R2_ACCOUNT_ID,
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
    r2AccessKeySecret: process.env.R2_ACCESS_KEY_SECRET,
    r2BucketName: process.env.R2_BUCKET_NAME || 'blog-images',
    aiAgentEndpoint: process.env.AI_AGENT_ENDPOINT,
    aiAgentApiKey: process.env.AI_AGENT_API_KEY,

    // Public keys accessible client-side
    public: {
      partykitHost: process.env.NUXT_PUBLIC_PARTYKIT_HOST || '',
      environment: process.env.ENVIRONMENT || 'development'
    }
  },

  compatibilityDate: '2025-01-15',

  // Nitro configuration for Cloudflare Pages
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/sitemap.xml', '/robots.txt']
    },
    storage: {
      // Use Cloudflare KV for caching
      cache: {
        driver: 'cloudflare-kv-binding'
      }
    }
  },

  hub: {
    blob: true
  },

  vite: {
    optimizeDeps: {
      include: [
        '@nuxt/ui > prosemirror-state',
        'yjs',
        'y-partykit/provider'
      ]
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
