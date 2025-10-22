# Vercel Deployment Guide

## Database Choice: Vercel Postgres

For this lead generation system, we're using **Vercel Postgres** because:

- ✅ **Serverless SQL database** - Perfect for multi-tenant SaaS
- ✅ **Seamless integration** with Next.js and Vercel Functions
- ✅ **Automatic scaling** - Handles traffic spikes automatically
- ✅ **Built on Neon** - PostgreSQL-compatible with great performance
- ✅ **Easy setup** - Direct integration in Vercel dashboard

## Why Not Other Vercel Databases?

- ❌ **Vercel KV** (Redis-like): Not suitable for relational data like clients and leads
- ❌ **Vercel Blob**: For file storage, not structured data
- ❌ **Edge Config**: For configuration, not application data

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with your GitHub account
3. Click "Add New..." → "Project"
4. Import your GitHub repository

### 2. Set Up Vercel Postgres

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **"Create Database"** → **"Postgres"**
3. Name your database (e.g., `leadgen-db`)
4. Choose a region closest to your users
5. Click **"Create"**

### 3. Configure Environment Variables

In your Vercel project **Settings** → **Environment Variables**:

```env
# Database (auto-populated by Vercel Postgres)
POSTGRES_URL="your_vercel_postgres_url"

# Whop Configuration
WHOP_API_KEY="your_whop_api_key_here"
WHOP_CLIENT_ID="your_whop_client_id_here"
WHOP_CLIENT_SECRET="your_whop_client_secret_here"

# App Configuration
NEXTAUTH_SECRET="generate_a_secure_secret_here"
NEXTAUTH_URL="https://your-app.vercel.app"
SECURITY_HASH_SECRET="generate_another_secure_secret_here"
```

### 4. Push Database Schema

**Option A: Using Vercel CLI**
```bash
npm install -g vercel
vercel link
npx drizzle-kit push
```

**Option B: Using Drizzle Studio**
```bash
npx drizzle-kit studio
```

### 5. Deploy

Vercel will automatically deploy when you push to your connected GitHub repository.

## Environment Configuration

### Local Development
```env
DATABASE_URL="postgresql://username:password@localhost:5432/leadgen"
```

### Production (Vercel)
```env
POSTGRES_URL="postgresql://user:pass@ep-cool-cloud-123456.us-east-1.aws.neon.tech/dbname"
```

The application automatically uses `POSTGRES_URL` when available, falling back to `DATABASE_URL` for local development.

## Vercel Postgres Benefits for This Project

### Multi-tenant Performance
- **Connection pooling** - Handles multiple client requests efficiently
- **Automatic scaling** - Grows with your user base
- **Serverless** - No database management required

### Security
- **SSL encryption** - All connections are secure
- **VPC isolation** - Database runs in isolated environment
- **Automatic backups** - Data protection built-in

### Integration
- **Edge-ready** - Works with Vercel's edge network
- **Fast queries** - Optimized for serverless functions
- **Real-time** - Supports real-time lead notifications

## Monitoring and Analytics

After deployment, monitor your application:

1. **Vercel Analytics** - View performance metrics
2. **Postgres Metrics** - Monitor database performance
3. **Function Logs** - Debug serverless functions

## Cost Optimization

Vercel Postgres offers:
- **Free tier** - Great for development and small projects
- **Pay-as-you-go** - Scales with your usage
- **No hidden costs** - Transparent pricing

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `POSTGRES_URL` is set in Vercel
   - Check database region matches your deployment

2. **Schema Push Failures**
   - Ensure you're using the latest Drizzle version
   - Check database permissions

3. **Authentication Issues**
   - Verify Whop credentials are correct
   - Check NEXTAUTH_URL matches your domain

Your multi-tenant lead generation system is now optimized for Vercel Postgres deployment!
