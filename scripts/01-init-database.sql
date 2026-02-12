-- Blog System Database Schema for Cloudflare D1
-- This script creates all necessary tables for the blogging system

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  bio TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'author' CHECK(role IN ('admin', 'editor', 'author')),
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (cast((julianday('now')) * 86400.0 as integer)),
  updated_at INTEGER DEFAULT (cast((julianday('now')) * 86400.0 as integer)),
  last_login_at INTEGER
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_active_idx ON users(is_active);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at INTEGER DEFAULT (cast((julianday('now')) * 86400.0 as integer))
);

CREATE INDEX IF NOT EXISTS tags_slug_idx ON tags(slug);

-- Series table (for organizing related posts/podcasts)
CREATE TABLE IF NOT EXISTS series (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  featured_image_url TEXT,
  featured_image_alt TEXT,
  created_by TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (cast((julianday('now')) * 86400.0 as integer)),
  updated_at INTEGER DEFAULT (cast((julianday('now')) * 86400.0 as integer)),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS series_slug_idx ON series(slug);
CREATE INDEX IF NOT EXISTS series_active_idx ON series(is_active);
CREATE INDEX IF NOT EXISTS series_created_by_idx ON series(created_by);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  featured_image_alt TEXT,
  author_id TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  reading_time_minutes INTEGER,
  view_count INTEGER DEFAULT 0,
  series_id TEXT,
  published_at INTEGER,
  created_at INTEGER DEFAULT (cast((julianday('now')) * 86400.0 as integer)),
  updated_at INTEGER DEFAULT (cast((julianday('now')) * 86400.0 as integer)),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
CREATE INDEX IF NOT EXISTS posts_author_idx ON posts(author_id);
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts(published_at);
CREATE INDEX IF NOT EXISTS posts_series_idx ON posts(series_id);

-- Post Tags junction table (many-to-many)
CREATE TABLE IF NOT EXISTS post_tags (
  post_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS post_tags_post_idx ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS post_tags_tag_idx ON post_tags(tag_id);

-- Podcasts table
CREATE TABLE IF NOT EXISTS podcasts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  episode_number INTEGER,
  duration_seconds INTEGER,
  youtube_url TEXT,
  youtube_video_id TEXT,
  featured_image_url TEXT,
  featured_image_alt TEXT,
  transcript TEXT,
  ai_analysis TEXT,
  author_id TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  view_count INTEGER DEFAULT 0,
  series_id TEXT,
  published_at INTEGER,
  created_at INTEGER DEFAULT (cast((julianday('now')) * 86400.0 as integer)),
  updated_at INTEGER DEFAULT (cast((julianday('now')) * 86400.0 as integer)),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS podcasts_slug_idx ON podcasts(slug);
CREATE INDEX IF NOT EXISTS podcasts_status_idx ON podcasts(status);
CREATE INDEX IF NOT EXISTS podcasts_author_idx ON podcasts(author_id);
CREATE INDEX IF NOT EXISTS podcasts_published_idx ON podcasts(published_at);
CREATE INDEX IF NOT EXISTS podcasts_series_idx ON podcasts(series_id);

-- Podcast Tags junction table (many-to-many)
CREATE TABLE IF NOT EXISTS podcast_tags (
  podcast_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (podcast_id, tag_id),
  FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS podcast_tags_podcast_idx ON podcast_tags(podcast_id);
CREATE INDEX IF NOT EXISTS podcast_tags_tag_idx ON podcast_tags(tag_id);

-- Images table (for tracking R2 uploads)
CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  r2_url TEXT NOT NULL,
  alt_text TEXT,
  mime_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by TEXT NOT NULL,
  created_at INTEGER DEFAULT (cast((julianday('now')) * 86400.0 as integer)),
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS images_r2_key_idx ON images(r2_key);
CREATE INDEX IF NOT EXISTS images_uploaded_by_idx ON images(uploaded_by);
