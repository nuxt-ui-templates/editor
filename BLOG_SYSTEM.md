# Blog & Podcast System

A modern, full-stack blogging and podcast management system built with **Nuxt 4**, **Cloudflare D1**, and **R2 Storage**.

## Features

### Content Management
- **Posts**: Create, edit, and publish blog posts with rich text editor
- **Podcasts**: Manage podcast episodes with YouTube integration
- **Tags**: Categorize content with flexible tagging system
- **Series**: Group related content into collections

### Admin Dashboard
- Intuitive admin interface at `/admin`
- Real-time content editing with TipTap editor (from existing project)
- Image upload to Cloudflare R2 with CDN delivery
- Draft/Published workflow with status tracking

### Public Blog
- Modern blog homepage at `/blog`
- Individual post and podcast detail pages
- Tag-based filtering
- Series navigation
- YouTube video embedding for podcasts
- AI-generated summaries for podcast episodes

### Infrastructure
- **Cloudflare D1**: SQLite database with 25M read requests/day free tier
- **Cloudflare R2**: Image storage with unlimited bandwidth
- **JWT Authentication**: Secure admin access
- **Drizzle ORM**: Type-safe database queries

## Project Structure

```
/
├── app/
│   ├── pages/
│   │   ├── admin/              # Admin dashboard
│   │   │   ├── login.vue       # Admin login
│   │   │   ├── index.vue       # Dashboard home
│   │   │   ├── posts/          # Post management
│   │   │   ├── podcasts/       # Podcast management
│   │   │   └── media/          # Image library
│   │   ├── blog/               # Public blog pages
│   │   │   ├── index.vue       # Blog homepage
│   │   │   ├── posts/          # Post detail pages
│   │   │   └── podcasts/       # Podcast detail pages
│   │   └── index.vue           # Home (existing editor)
│   ├── composables/
│   │   ├── useAuth.ts          # Auth state management
│   │   └── useAdminPosts.ts    # Post CRUD operations
│   └── middleware/
│       └── admin-auth.ts       # Auth protection
│
├── server/
│   ├── api/
│   │   ├── auth/               # Login/logout endpoints
│   │   ├── posts/              # Post CRUD endpoints
│   │   ├── podcasts/           # Podcast CRUD endpoints
│   │   ├── tags/               # Tag endpoints
│   │   ├── series/             # Series endpoints
│   │   └── images/             # Image upload endpoint
│   ├── db/
│   │   ├── schema.ts           # Drizzle ORM schema
│   │   └── queries.ts          # Database queries
│   ├── utils/
│   │   ├── db.ts               # Database initialization
│   │   ├── jwt.ts              # JWT utilities
│   │   ├── r2.ts               # R2 storage utilities
│   │   └── validation.ts       # Input validation
│   └── middleware/
│       └── auth.ts             # Request authentication
│
├── scripts/
│   └── 01-init-database.sql    # Database schema
│
├── wrangler.toml               # Cloudflare config
├── drizzle.config.ts           # Drizzle ORM config
└── nuxt.config.ts              # Nuxt config
```

## Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Create local D1 database
wrangler d1 create blog-db-local --local

# Run database migration locally
wrangler d1 execute blog-db-local --file=./scripts/01-init-database.sql --local

# Start dev server
npm run dev
```

The app will be available at `http://localhost:3000`

### Admin Access

1. Navigate to `http://localhost:3000/admin/login`
2. Create a user in the database (see deployment guide)
3. Login with your credentials

### Public Blog

Access the public blog at `http://localhost:3000/blog`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh JWT token

### Posts (Protected: POST/PATCH/DELETE)
- `GET /api/posts` - List published posts (paginated)
- `POST /api/posts` - Create new post
- `GET /api/posts/[id]` - Get post detail
- `PATCH /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post

### Podcasts (Protected: POST/PATCH/DELETE)
- `GET /api/podcasts` - List published podcasts
- `POST /api/podcasts` - Create new podcast
- `GET /api/podcasts/[id]` - Get podcast detail
- `PATCH /api/podcasts/[id]` - Update podcast
- `DELETE /api/podcasts/[id]` - Delete podcast
- `POST /api/podcasts/[id]/analyze` - Trigger AI analysis

### Tags
- `GET /api/tags` - List all tags

### Series
- `GET /api/series` - List all series

### Images
- `POST /api/images/upload` - Upload image to R2
- `DELETE /api/images/[id]` - Delete image

## Database Schema

### Users
- `id` - UUID
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `name` - Display name
- `role` - admin | editor | author
- `is_active` - Account status
- `created_at`, `updated_at` - Timestamps

### Posts
- `id` - UUID
- `title`, `slug` - Post title and URL slug
- `description` - Excerpt
- `content` - Full post content
- `featured_image_url` - Hero image
- `author_id` - Foreign key to users
- `status` - draft | published | archived
- `reading_time_minutes` - Estimated reading time
- `series_id` - Optional series grouping
- `published_at`, `created_at`, `updated_at` - Timestamps

### Podcasts
- Similar to Posts, plus:
- `episode_number` - Episode number
- `duration_seconds` - Episode duration
- `youtube_url`, `youtube_video_id` - YouTube integration
- `transcript` - Episode transcript
- `ai_analysis` - AI-generated summary

### Tags
- `id` - UUID
- `name` - Tag name
- `slug` - URL slug
- `description` - Tag description

### Series
- `id` - UUID
- `title`, `slug` - Series title and slug
- `description` - Series description
- `featured_image_url` - Series image
- `created_by` - Foreign key to users
- `is_active` - Active status

### Images
- `id` - UUID
- `filename` - Original filename
- `r2_key` - R2 storage path
- `r2_url` - Public R2 URL
- `alt_text` - Accessibility text
- `mime_type` - File type
- `file_size` - File size in bytes
- `uploaded_by` - Foreign key to users

## Customization

### Add Custom Fields

To add custom fields to posts/podcasts:

1. Update schema in `server/db/schema.ts`
2. Generate migration: `wrangler d1 migrations create blog-db field-name`
3. Update API validation in `server/utils/validation.ts`
4. Update UI forms in admin pages

### Integrate Your AI Agent

Update the podcast analysis endpoint (`server/api/podcasts/[id]/analyze.ts`):

```typescript
// Call your AI service
const analysis = await $fetch(
  process.env.AI_AGENT_ENDPOINT,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.AI_AGENT_API_KEY}`
    },
    body: {
      podcast_id: id,
      transcript: podcast.transcript,
      title: podcast.title,
      description: podcast.description
    }
  }
)
```

### Extend Admin Dashboard

The admin dashboard uses Nuxt UI components. Add new management pages:

```vue
<!-- app/pages/admin/custom.vue -->
<template>
  <div>
    <!-- Your custom admin section -->
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin-auth'
})
</script>
```

## Performance Considerations

### Database Indexing
Indexes are automatically created on:
- User emails
- Post slugs and status
- Published timestamps
- Author IDs

### Caching Strategy
- Published posts cached for 1 hour
- Images cached for 1 year on R2
- List pages paginated (20 items default)

### Image Optimization
- All images stored on R2 with CDN
- Automatic cache headers (1 year for immutable)
- Consider adding image resizing middleware

## Security

- JWT tokens stored in HTTP-only cookies
- Passwords hashed with bcrypt
- SQL injection prevented with Drizzle ORM
- CORS protection via Nuxt Nitro
- Environment variables not exposed to client

## Future Enhancements

- Comment system for posts
- Newsletter subscription management
- Advanced search with filters
- Social media sharing buttons
- Analytics dashboard
- Email notifications
- Content scheduling
- Multi-language support
- Content versioning/history

## Support

For deployment issues, see [DEPLOYMENT.md](./DEPLOYMENT.md)

For questions about the editor, see the existing project documentation.
