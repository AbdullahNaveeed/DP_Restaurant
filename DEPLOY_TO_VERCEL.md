# Deploying to GitHub and Vercel

This guide explains how to deploy this Next.js App Router project to Vercel with a production MongoDB database.

## 1. Create and push GitHub repository

```bash
git remote add origin <github-repo-url>
git push -u origin main
```

If starting from scratch:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <github-repo-url>
git push -u origin main
```

## 2. Create MongoDB Atlas database

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. In Network Access, allow Vercel egress (or `0.0.0.0/0` with strong credentials).
4. Copy connection string:
   - `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/restaurant?retryWrites=true&w=majority`

## 3. Import project into Vercel

1. Open Vercel -> New Project -> Import Git Repository.
2. Select your GitHub repo.
3. Keep default Next.js settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`

## 4. Configure required environment variables in Vercel

Set these for **Production** (and Preview if needed):

- `MONGODB_URI` (required)
- `JWT_SECRET` (required)
- `NEXT_PUBLIC_APP_URL` (required, e.g. `https://dprestaurantwebsite.vercel.app`)
- `MONGODB_MIN_POOL_SIZE` (optional, e.g. `1`)
- `MONGODB_MAX_POOL_SIZE` (optional, e.g. `10`)
- `REDIS_URL` (optional)

Then redeploy.

## 5. Verify production APIs after deploy

Use browser/devtools or curl:

1. `GET /api/menu`
2. `POST /api/menu` (admin auth required)
3. `POST /api/orders`
4. `GET /api/orders` (admin auth required)
5. `PATCH /api/orders/:id` with `{"status":"Preparing"}` then `{"status":"Delivered"}`

Expected behavior:
- Admin can create menu items without "Database unavailable".
- New menu items appear on `/menu` immediately.
- New orders persist to MongoDB and appear in admin orders.
- Status transitions are enforced: `Pending -> Preparing -> Delivered`.

## 6. Troubleshooting checklist

If you still see "Database unavailable" in production:

1. Confirm `MONGODB_URI` is set in Vercel Production environment.
2. Confirm Atlas network access allows Vercel.
3. Confirm DB username/password in URI are correct.
4. Trigger redeploy after env changes.
5. Check Vercel Function logs for Mongo connection errors.

## Notes

- This app now expects a real database in production and will return `503` if DB is unavailable.
- Do not commit real secrets; use Vercel environment variables.
