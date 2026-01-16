# Project: Detour Japan - Self-Generating Travel Blog

## Quick Reference
- **Location:** C:\Users\Neil\detour-japan
- **Live site:** https://detourjapan.github.io
- **GitHub repos:**
  - https://github.com/detourjapan/detourjapan.github.io (production)
  - https://github.com/sbbledsoe/detour-japan (backup)
- **GitHub username:** sbbledsoe
- **Email:** bbbledsoe360@gmail.com

## Tech Stack
- Astro (static site generator)
- GitHub Pages (hosting)
- GitHub Actions (auto-generates posts Tue 9 AM UTC)
- Claude API (content generation via claude-sonnet-4-20250514)
- Unsplash API (copyright-free images)
- Leaflet.js + Esri tiles (maps with English labels)
- Resend (email notifications)
- Decap CMS (admin dashboard at /admin)

## Auto-Generation Workflow
Posts are automatically generated and **published directly** (no draft approval step):
1. GitHub Action runs Tue at 9 AM UTC (or manual trigger)
2. Script selects a prefecture (prioritizes least-visited)
3. Claude generates 800-1000 word literary essay with 2-3 image placeholders
4. Unsplash provides hero image + 2-3 inline images for attractions/destinations
5. Claude extracts map locations with coordinates
6. Post saved to `src/content/posts/` with `draft: false`
7. Email notification sent confirming publication

**Key files:**
- `.github/workflows/generate-post.yml` - GitHub Action workflow
- `scripts/generate-post.js` - Main generation script

## Writing Style Guidelines
- Literary, multi-paragraph prose (magazine-style essays)
- No listicle formats or bullet points
- No travel times from major cities
- No specific prices/costs in yen
- 800-1000 words per post

## SEO Features (Added Jan 2026)
- `/sitemap.xml` - Dynamic sitemap for Google
- `/rss.xml` - RSS feed for syndication
- `/robots.txt` - Search crawler guidance
- JSON-LD Article schema on blog posts
- Full Open Graph & Twitter card meta tags
- Canonical URLs on all pages

## Git Remotes
- `origin` → sbbledsoe/detour-japan (backup)
- `detourjapan` → detourjapan/detourjapan.github.io (production)

Push to both: `git push origin main && git push detourjapan main`

## Content Structure
- `src/content/posts/` - Published blog posts
- `src/content/drafts/` - Draft posts (legacy, no longer used)
- `src/pages/` - Astro pages (index, about, post template)
- `src/layouts/` - Base layout with SEO meta tags
- `src/components/` - Map component
- `public/admin/` - Decap CMS configuration

## Environment Variables (GitHub Secrets)
- `ANTHROPIC_API_KEY` - Claude API
- `UNSPLASH_ACCESS_KEY` - Unsplash API
- `RESEND_API_KEY` - Email notifications
- `NOTIFICATION_EMAIL` - Where to send notifications

## Status
Fully deployed and operational. Auto-publishing enabled.
