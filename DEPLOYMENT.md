# Cloudflare Deployment Guide

This blogging system is configured for deployment on **Cloudflare Pages** with **D1 Database** and **R2 Storage**.

## Prerequisites

1. **Cloudflare Account** - [Sign up free](https://dash.cloudflare.com/sign-up)
2. **Git Repository** - GitHub, GitLab, or Gitea
3. **Domain** - (optional, Cloudflare provides `*.pages.dev` domain)

## Setup Steps

### 1. Create Cloudflare Resources

#### A. Create D1 Database
```bash
# Login to Wrangler
wrangler login

# Create D1 database
wrangler d1 create blog-db

# This will output a database ID - save it
```

#### B. Create R2 Bucket
```bash
# Create R2 bucket
wrangler r2 bucket create blog-images
```

#### C. Generate R2 API Token
1. Go to Cloudflare Dashboard → Account Settings → API Tokens
2. Create custom token with:
   - Permissions: `Object Read & Write` on `blog-images` bucket
   - TTL: As needed for your workflow
3. Save credentials: Access Key ID and Secret Access Key

### 2. Update Environment Variables

Copy `.env.example` to `.env.production` and fill in values:

```bash
# Cloudflare D1
D1_DATABASE_ID=your_database_id_from_step_1

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_ACCESS_KEY_SECRET=your_access_key_secret
R2_BUCKET_NAME=blog-images

# Authentication
JWT_SECRET=your-random-secret-key-min-32-chars-long

# AI Agent Service
AI_AGENT_ENDPOINT=https://your-ai-agent-service.com/analyze
AI_AGENT_API_KEY=your_ai_agent_api_key

# Environment
ENVIRONMENT=production
```

### 3. Update wrangler.toml

Replace placeholders in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "blog-db"
database_id = "YOUR_D1_DATABASE_ID"  # ← Replace this

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "blog-images"

[env.production]
vars = { ENVIRONMENT = "production" }
```

### 4. Initialize Database

Run migrations on your D1 database:

```bash
# Apply migrations
wrangler d1 execute blog-db --file=./scripts/01-init-database.sql --remote

# Or for local development
wrangler d1 execute blog-db --file=./scripts/01-init-database.sql --local
```

### 5. Deploy to Cloudflare Pages

#### Option A: GitHub Integration (Recommended)

1. Push code to GitHub
2. Go to Cloudflare Dashboard → Pages
3. Click "Create a project" → "Connect to Git"
4. Select your repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** 18 or higher
6. Add environment variables from `.env.production`
7. Click "Save and Deploy"

#### Option B: Manual Deployment

```bash
# Build locally
npm run build

# Deploy
wrangler pages deploy dist
```

### 6. Create Admin User

After deployment, create an admin user:

```bash
# Use Wrangler to connect to remote D1
wrangler d1 shell blog-db --remote

# Insert user (use hashed password in production)
INSERT INTO users (id, email, password_hash, name, role, is_active)
VALUES ('user-id', 'admin@example.com', 'hashed-password', 'Admin', 'admin', 1);
```

For password hashing, use bcrypt:
```bash
# Generate bcrypt hash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));"
```

## Post-Deployment

### 1. Verify D1 Connection

Test database connectivity:
- Visit `/admin` and check if you can login
- Create a test post/podcast

### 2. Test R2 Upload

1. Go to `/admin/media`
2. Upload an image
3. Verify it appears in Cloudflare R2 bucket

### 3. Configure Custom Domain (Optional)

1. Cloudflare Dashboard → Pages → Your Project
2. Click "Custom Domains"
3. Add your domain and configure DNS

## Database Migrations

To add new database migrations:

1. Modify schema in `server/db/schema.ts`
2. Generate migration:
```bash
wrangler d1 migrations create blog-db migration-name
```

3. Execute migration:
```bash
wrangler d1 execute blog-db --file=./migrations/0002-migration-name.sql --remote
```

## Monitoring & Logs

View deployment logs:

```bash
# View Pages logs
wrangler pages deployment list
wrangler pages deployment view <DEPLOYMENT_ID>

# View D1 logs
wrangler d1 insights blog-db
```

## Performance Optimization

### D1 Free Tier Limits
- 25 million read requests/day
- 100,000 write requests/day
- For high-traffic sites, upgrade to D1 Pro

### R2 Free Tier
- 1 GB storage included
- $0.015/GB for additional storage
- Unlimited bandwidth

### Caching Strategy

The app implements caching:
- Published posts cached for 1 hour
- Images cached for 1 year
- Pagination: 20 items per page

## Troubleshooting

### D1 Connection Issues

```bash
# Test D1 connection
wrangler d1 query blog-db "SELECT 1;" --remote

# Check bindings
wrangler d1 info blog-db
```

### R2 Upload Failures

Verify credentials:
```bash
# List R2 buckets
wrangler r2 bucket list

# Test upload
wrangler r2 cp local-file.jpg r2://blog-images/test.jpg
```

### Build Failures

```bash
# Clear cache and rebuild
rm -rf .nuxt dist node_modules
npm install
npm run build
```

## Production Checklist

- [ ] D1 database created and migrated
- [ ] R2 bucket created with correct permissions
- [ ] Environment variables added to Cloudflare
- [ ] Admin user created
- [ ] JWT_SECRET is cryptographically secure
- [ ] Email notifications configured (if needed)
- [ ] Custom domain configured
- [ ] SSL/TLS verified
- [ ] Monitoring/logging setup
- [ ] Backup strategy in place
- [ ] Database indexes optimized

## Support & Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [D1 Documentation](https://developers.cloudflare.com/d1/)
- [R2 Documentation](https://developers.cloudflare.com/r2/)
- [Nuxt 4 Deployment](https://nuxt.com/docs/getting-started/deployment)
