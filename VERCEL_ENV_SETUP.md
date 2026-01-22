# Quick Reference: Vercel Environment Setup

## Step 1: Generate AUTH_SECRET

Run this in your terminal:
```bash
openssl rand -base64 32
```

Copy the output - you'll need it for Vercel.

## Step 2: Add to Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these **3 variables**:

### Variable 1: DATABASE_URL
- **Key**: `DATABASE_URL`
- **Value**: `$POSTGRES_PRISMA_URL`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### Variable 2: AUTH_SECRET
- **Key**: `AUTH_SECRET`
- **Value**: `<paste your generated secret from Step 1>`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### Variable 3: AUTH_URL
- **Key**: `AUTH_URL`
- **Value** (Production): `https://your-app-name.vercel.app`
- **Environments**: ✅ Production

For Preview environment (optional):
- **Key**: `AUTH_URL`
- **Value**: Use Vercel's automatic preview URL
- **Environments**: ✅ Preview

## Step 3: Login Credentials (After Deployment)

Once deployed and database seeded, login with:

**Admin Account:**
- Email: `admin@meghcomm.store`
- Password: `admin123456`

**Standard User Account:**
- Email: `user@meghcomm.store`
- Password: `user123456`

---

## File: .env.vercel

I've created `.env.vercel` in your project root - it contains all the environment variable templates for easy reference.

**Note**: This file is for your reference only. Vercel doesn't auto-import .env files - you must manually add variables through the Vercel dashboard.
