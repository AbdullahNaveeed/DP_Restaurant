# Deploying to GitHub and Vercel

This guide describes how to push this project to GitHub and deploy it to Vercel.

## 1. Create a GitHub repository

1. Go to https://github.com and sign in.
2. Click **New repository**.
3. Choose a name (e.g. `restaurant-website`), visibility, and create the repo.

## 2. Push project to GitHub

Run these commands in your project root (replace `<github-repo-url>` with the repository HTTPS URL):

```bash
git remote add origin <github-repo-url>
git push -u origin main
```

If you need the full sequence from scratch:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <github-repo-url>
git push -u origin main
```

## 3. Connect GitHub repo to Vercel

1. Login to https://vercel.com
2. Click **New Project** → **Import Git Repository** and select your GitHub repo.
3. Vercel will detect this is a Next.js project. Keep the default build settings:
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add the environment variables listed in `.env.example` (use the production values):
   - `MONGODB_URI`
   - `REDIS_URL` (if used)
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL`
   - Optional pool settings: `MONGODB_MIN_POOL_SIZE`, `MONGODB_MAX_POOL_SIZE`
5. Click **Deploy**.

## 4. Automatic Deployments

Every push to the connected GitHub branch (`main`) will trigger a new deployment on Vercel.

## 5. Local build & verification

To verify locally before pushing:

```bash
npm install
npm run build
npm start
```

`npm run build` runs `next build` and `npm start` runs `next start` (production server).

## Notes

- `.env.example` is provided; do NOT commit any real secrets. Use Vercel's dashboard to set production env vars.
- `.gitignore` includes `.env*`, `.next/`, `node_modules/`, and `.vercel/`.
- The project uses MongoDB (MONGODB_URI) and optional Redis (REDIS_URL). If you don't provide them, the app falls back to local `temp_init/fallback-orders.json` for some routes.

If you want, I can create the GitHub repo for you (requires scopes/token), or push to a repo URL you provide.