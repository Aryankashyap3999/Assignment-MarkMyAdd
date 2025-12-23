# Deployment Guide - RBAC Configuration Tool

This guide will walk you through deploying the RBAC Configuration Tool to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier available at vercel.com)
- PostgreSQL database (we'll use a cloud provider)
- Google Gemini API key (optional, for AI feature)

## Step 1: Database Setup (PostgreSQL)

### Option A: Using Vercel Postgres (Recommended)

1. Go to https://vercel.com/docs/storage/postgres
2. Follow the setup instructions
3. Copy the `DATABASE_URL` from your Vercel dashboard

### Option B: Using Neon Database (Free Alternative)

1. Go to https://neon.tech
2. Sign up and create a new project
3. Copy the connection string as `DATABASE_URL`

### Option C: Using AWS RDS

1. Create a PostgreSQL instance on AWS RDS
2. Get the connection string in format: `postgresql://user:password@host:port/dbname`

## Step 2: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit: RBAC Configuration Tool"
git branch -M main
git remote add origin https://github.com/yourusername/rbac-tool.git
git push -u origin main
```

## Step 3: Deploy to Vercel

### Method 1: Using Vercel Dashboard (Easiest)

1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Configure project settings:
   - **Framework**: Next.js
   - **Root Directory**: ./ (default)
5. Add Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Generate a strong random string (e.g., `openssl rand -base64 32`)
   - `NEXT_PUBLIC_API_URL`: `https://yourdomain.vercel.app` (your Vercel URL)
   - `NEXT_PUBLIC_GEMINI_API_KEY`: (optional) Your Gemini API key
6. Click "Deploy"
7. Wait for deployment to complete

### Method 2: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add production environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_GEMINI_API_KEY

# Deploy to production
vercel --prod
```

## Step 4: Run Database Migrations

After deployment, you need to run Prisma migrations. Vercel will automatically run the build script, which includes `prisma generate`, but you need to manually run the migrations:

### Option 1: Using Vercel Postgres Integration

If using Vercel Postgres, the migrations run automatically during build.

### Option 2: Manual Migration

```bash
# Locally, with production DATABASE_URL:
DATABASE_URL="your-production-url" npx prisma migrate deploy

# Or use Vercel CLI to run commands in production:
vercel env pull
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

## Step 5: Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update `NEXT_PUBLIC_API_URL` to your custom domain

## Step 6: Setup API Key for Gemini (Optional - for AI Feature)

1. Go to https://ai.google.dev/
2. Click "Get API Key"
3. Create a new API key for your Vercel project
4. Add `NEXT_PUBLIC_GEMINI_API_KEY` environment variable in Vercel

## Step 7: Create Test Data

After deployment, you can create test data:

1. Visit your Vercel deployment URL
2. Sign up with test email: `admin@example.com`, password: `password123`
3. Create roles and permissions via the UI

## Troubleshooting

### Database Connection Error

**Problem**: `error: connect ENOTFOUND`

**Solution**:
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running and accessible
- Ensure your IP is whitelisted (if using cloud provider)

### Prisma Migration Error

**Problem**: `error: Migration 'xxx' failed`

**Solution**:
```bash
# Reset database (CAUTION: deletes all data)
npx prisma migrate reset --force

# Or manually run migrations
npx prisma migrate deploy
```

### Authentication Not Working

**Problem**: Login returns 401 errors

**Solution**:
- Ensure `JWT_SECRET` is set in environment variables
- Check token format in Authorization header: `Bearer <token>`
- Verify `DATABASE_URL` is accessible

### API Routes Returning 404

**Problem**: API endpoints not found

**Solution**:
- Rebuild and redeploy: `vercel --prod`
- Check that Next.js built successfully
- Verify API routes are in `src/app/api/` directory

### Environment Variables Not Loading

**Problem**: `process.env.VARIABLE_NAME` is undefined

**Solution**:
- For public variables, prefix with `NEXT_PUBLIC_`
- Redeploy after adding environment variables
- Use `vercel env pull` to test locally

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for JWT signing (min 32 chars) |
| `JWT_EXPIRY` | No | Token expiry (default: "7d") |
| `NEXT_PUBLIC_API_URL` | Yes | Public API URL (e.g., vercel deployment URL) |
| `NEXT_PUBLIC_GEMINI_API_KEY` | No | Google Gemini API key (for AI feature) |

## Monitoring & Logs

### View Vercel Logs

```bash
# Using Vercel CLI
vercel logs

# Or through dashboard: Settings → Deployments → View Logs
```

### View Database Logs

- Neon: https://console.neon.tech
- Vercel Postgres: Vercel Dashboard → Storage
- AWS RDS: AWS Console

## Scaling Recommendations

1. **Database**: Start with free tier, upgrade as needed
2. **Serverless Functions**: Vercel handles auto-scaling
3. **Caching**: Implement Redis for session caching (optional)
4. **Database Optimization**: Add indexes on frequently queried columns

## Security Checklist

- [ ] `JWT_SECRET` is strong and unique
- [ ] Database credentials are secure
- [ ] No credentials in version control
- [ ] Use HTTPS only
- [ ] Enable database encryption
- [ ] Regular backups enabled
- [ ] Rate limiting implemented
- [ ] Input validation in place

## Post-Deployment

1. Test all features on production
2. Monitor error logs
3. Set up alerts for failures
4. Plan database backups
5. Document any custom configurations
6. Create admin user accounts

## Support

For issues with:
- **Vercel**: https://vercel.com/help
- **Prisma**: https://prisma.io/docs/
- **Next.js**: https://nextjs.org/docs

## Quick Reference: Deploy Command

```bash
# Build and deploy
npm run build
vercel --prod
```

## Database Connection String Examples

### Neon
```
postgresql://neon_user:password@ep-database.us-east-1.neon.tech/dbname?sslmode=require
```

### AWS RDS
```
postgresql://admin:password@rbac-tool.cfgwmvnefwx.us-east-1.rds.amazonaws.com:5432/rbac_db
```

### Local Development
```
postgresql://postgres:password@localhost:5432/rbac_tool
```

## Rollback Instructions

```bash
# Rollback to previous deployment
vercel rollback

# Or select specific deployment
vercel --prod --target=production
```
