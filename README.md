# Detour Japan

A self-generating blog about lesser-known Japan destinations. Posts are automatically created using AI and await your approval before publishing.

## Quick Start

### 1. Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `detour-japan`
3. Make it **Public** (required for free GitHub Pages)
4. Don't initialize with README (we have one)

### 2. Push This Code

```bash
cd detour-japan
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/detour-japan.git
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repo → Settings → Pages
2. Source: **GitHub Actions**
3. Save

### 4. Add API Keys as Secrets

Go to your repo → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Secret Name | Where to Get It |
|-------------|-----------------|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `UNSPLASH_ACCESS_KEY` | [unsplash.com/developers](https://unsplash.com/developers) |
| `RESEND_API_KEY` | [resend.com](https://resend.com) (optional, for email alerts) |
| `NOTIFICATION_EMAIL` | Your email address (optional) |

### 5. Update CMS Config

Edit `public/admin/config.yml`:

```yaml
backend:
  repo: YOUR_USERNAME/detour-japan  # Change this line
```

### 6. Set Up CMS Authentication

The admin dashboard needs GitHub OAuth to let you edit content. Choose one:

**Option A: Use Netlify for hosting (Easiest)**
- Move hosting to Netlify (free) instead of GitHub Pages
- Enable Netlify Identity in your Netlify site settings
- Change backend in config.yml to `git-gateway`

**Option B: GitHub OAuth App (For GitHub Pages)**
1. Go to GitHub → Settings → Developer settings → OAuth Apps → New
2. Set callback URL to: `https://YOUR_USERNAME.github.io/detour-japan/admin/`
3. Deploy a small OAuth server (like [netlify-cms-oauth-provider-node](https://github.com/vencax/netlify-cms-github-oauth-provider))

**Option C: Edit files directly on GitHub (Simplest)**
- Skip the CMS dashboard
- Edit markdown files directly in GitHub's web interface
- Drafts appear in `src/content/drafts/`, move to `posts/` to publish

### 7. Test It!

1. Go to Actions tab in your repo
2. Click "Generate Blog Post"
3. Click "Run workflow"
4. Wait ~1 minute for it to complete
5. Check `src/content/drafts/` for your new post!

## Your Workflow

1. **Automatic**: New posts generated Mon & Thu at 9 AM UTC
2. **You get**: Email notification (if configured)
3. **You visit**: `https://YOUR_USERNAME.github.io/detour-japan/admin/`
4. **You review**: Read, edit if needed
5. **You publish**: Move from drafts to posts, click save

## Project Structure

```
detour-japan/
├── src/content/
│   ├── posts/      # Published articles
│   └── drafts/     # AI-generated, awaiting review
├── public/admin/   # CMS dashboard
├── scripts/        # Content generation
└── .github/        # Automation
```

## Local Development

```bash
npm install
npm run dev        # Start dev server at localhost:4321
npm run generate   # Manually generate a post (needs .env)
npm run build      # Build for production
```

## Costs

| Service | Monthly Cost |
|---------|-------------|
| GitHub Pages | Free |
| Claude API (~8 posts) | ~$0.40 |
| Unsplash | Free |
| Resend (emails) | Free |

## Customization

- **Colors**: Edit `src/styles/global.css`
- **Layout**: Edit files in `src/layouts/`
- **Post schedule**: Edit `.github/workflows/generate-post.yml` cron times
- **Content style**: Edit the prompt in `scripts/generate-post.js`

## Troubleshooting

**Posts not generating?**
- Check Actions tab for error logs
- Verify API keys are set correctly in Secrets

**CMS not loading?**
- Ensure repo name in `config.yml` matches your actual repo
- GitHub OAuth can take a few minutes to propagate

**Site not deploying?**
- Check that Pages is set to "GitHub Actions" source
- Look at the deploy workflow logs

---

Built with [Astro](https://astro.build) and [Decap CMS](https://decapcms.org)
