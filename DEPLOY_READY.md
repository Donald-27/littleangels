# Deployment Guide - Little Angels Transport System

**Version:** 1.0.0  
**Last Updated:** October 09, 2025  
**Status:** ✅ Ready for Deployment

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Running Development](#running-development)
5. [Building for Production](#building-for-production)
6. [Deployment Options](#deployment-options)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js:** v18.x or v20.x
- **npm:** v9.x or later
- **Supabase Account:** Active project

### Access Requirements
- Supabase project credentials (URL, Anon Key, Service Role Key)
- Admin access to configure environment variables
- Git access (for version control)

---

## Environment Setup

### 1. Clone and Install

```bash
# Navigate to project directory
cd littleangels-academy-1

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://zvkfuljxidxtuqrmquso.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
VITE_APP_NAME=Little Angels Academy
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production

# Map Configuration (Optional)
VITE_MAPBOX_TOKEN=your_mapbox_token_here

# SMS Configuration (Optional)
VITE_SMS_API_KEY=your_sms_api_key_here
VITE_SMS_SENDER_ID=LittleAngels

# M-Pesa Configuration (Optional - for Kenya)
VITE_MPESA_CONSUMER_KEY=your_mpesa_consumer_key
VITE_MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
VITE_MPESA_SHORTCODE=your_mpesa_shortcode
VITE_MPESA_PASSKEY=your_mpesa_passkey

# Email Configuration (Optional)
VITE_EMAIL_FROM=noreply@littleangels.ac.ke
VITE_EMAIL_SERVICE=gmail

# School Configuration
VITE_SCHOOL_NAME=Little Angels Academy
VITE_SCHOOL_ADDRESS=Nairobi, Kenya
VITE_SCHOOL_PHONE=+254700000000
VITE_SCHOOL_EMAIL=info@littleangels.ac.ke
```

**⚠️ Security Note:** Never commit `.env.local` to version control. It's already in `.gitignore`.

---

## Database Setup

### Step 1: Run Schema

```bash
# Option A: Using Supabase SQL Editor
# 1. Go to your Supabase dashboard
# 2. Navigate to SQL Editor
# 3. Copy contents of database/schema.sql
# 4. Run the script

# Option B: Using setup script
npm run setup-db
```

### Step 2: Seed Data

```bash
# Run seed script to populate with test data
npm run seed
```

### Step 3: Verify

```bash
# Run verification script
node scripts/verify_seed.js
```

**Expected Output:**
```
✅ ALL VERIFICATIONS PASSED! Database is properly seeded.
```

---

## Running Development

### Start Development Server

```bash
npm run dev
```

**Server Details:**
- **URL:** http://localhost:5000
- **Port:** 5000 (configurable in vite.config.js)
- **Hot Reload:** Enabled
- **Host:** 0.0.0.0 (accessible from network)

### Test Login Credentials

After seeding, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@littleangels.ac.ke | admin123 |
| Parent | weldonkorir305@gmail.com | parent123 |
| Teacher | sarah.mutai@littleangels.ac.ke | teacher123 |
| Driver | john.mwangi@littleangels.ac.ke | driver123 |
| Accounts | grace.wanjiku@littleangels.ac.ke | accounts123 |

---

## Building for Production

### Step 1: Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Step 2: Preview Build (Optional)

```bash
npm run preview
```

This serves the production build locally for testing.

### Build Output

```
dist/
├── assets/          # Compiled JS, CSS, and other assets
├── index.html       # Entry HTML file
└── ...
```

---

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Configure Environment Variables:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from `.env.local`

4. **Production Deploy:**
   ```bash
   vercel --prod
   ```

**Vercel Configuration** (`vercel.json`):
```json
{
  "build": {
    "env": {
      "VITE_SUPABASE_URL": "@supabase-url",
      "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
    }
  },
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": { "cache-control": "max-age=31536000,immutable" }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build and Deploy:**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Configure:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variables in Netlify dashboard

### Option 3: Render

1. **Create `render.yaml`:**
   ```yaml
   services:
     - type: web
       name: little-angels-transport
       env: static
       buildCommand: npm run build
       staticPublishPath: ./dist
       envVars:
         - key: VITE_SUPABASE_URL
           sync: false
         - key: VITE_SUPABASE_ANON_KEY
           sync: false
   ```

2. **Deploy:**
   - Push to GitHub
   - Connect Render to repository
   - Configure environment variables

### Option 4: Custom Server (VPS/EC2)

1. **Install Node.js on server**

2. **Clone and build:**
   ```bash
   git clone <your-repo>
   cd littleangels-academy-1
   npm install
   npm run build
   ```

3. **Serve with Nginx:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/littleangels-academy-1/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /assets {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. **Enable HTTPS with Let's Encrypt:**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Verification

### Post-Deployment Checks

1. **Health Check:**
   ```bash
   curl https://your-domain.com
   # Should return 200 OK
   ```

2. **Login Test:**
   - Navigate to `/login`
   - Try logging in with admin credentials
   - Verify dashboard loads

3. **Real-time Test:**
   - Open app in two browser tabs
   - Add a student in one tab
   - Verify it appears in the other tab within 2 seconds

4. **Database Connection:**
   - Check browser console for Supabase connection logs
   - Should see: "✅ Supabase connected successfully!"

5. **Run Automated Tests:**
   ```bash
   node scripts/verify_seed.js
   ```

---

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: |
          cd littleangels-academy-1
          npm ci
          
      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: |
          cd littleangels-academy-1
          npm run build
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: littleangels-academy-1
```

---

## Troubleshooting

### Issue: Blank page after deployment

**Solution:**
1. Check browser console for errors
2. Verify environment variables are set
3. Ensure build command ran successfully
4. Check that `dist/index.html` exists

### Issue: Supabase connection failed

**Solution:**
1. Verify SUPABASE_URL and ANON_KEY are correct
2. Check CORS settings in Supabase dashboard
3. Ensure RLS policies allow access
4. Check browser network tab for blocked requests

### Issue: Real-time updates not working

**Solution:**
1. Enable Realtime in Supabase dashboard
2. Verify table-level realtime is enabled
3. Check subscription code for errors
4. Ensure user has proper permissions

### Issue: Build fails

**Solution:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Issue: Authentication errors

**Solution:**
1. Clear localStorage: `localStorage.clear()`
2. Re-login
3. Check JWT expiry in Supabase settings
4. Verify auth.users table exists

---

## Performance Optimization

### 1. Enable Gzip Compression

**Nginx:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

**Vercel:** Enabled by default

### 2. CDN Configuration

Use Cloudflare or similar CDN:
- Cache static assets (JS, CSS, images)
- DDoS protection
- SSL/TLS termination

### 3. Database Optimization

- Enable connection pooling in Supabase
- Add indexes on frequently queried columns
- Use pagination for large datasets

### 4. Code Splitting

Already configured in Vite:
```javascript
// Lazy load routes
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
```

---

## Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables secured
- [ ] CORS configured properly
- [ ] RLS policies enforced
- [ ] API keys rotated regularly
- [ ] Session timeout configured
- [ ] Content Security Policy headers set
- [ ] SQL injection protection (via Supabase)
- [ ] XSS protection enabled

---

## Monitoring & Logging

### Recommended Tools

1. **Sentry** - Error tracking
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

2. **LogRocket** - Session replay
   ```bash
   npm install logrocket
   ```

3. **Supabase Logs** - Database monitoring
   - Available in Supabase dashboard

### Custom Logging

Already configured in the app:
```javascript
console.log('🔧 Supabase Configuration:', {...})
console.log('✅ Supabase connected successfully!')
```

---

## Backup & Recovery

### Database Backups

**Manual Backup:**
```bash
# Using Supabase CLI
supabase db dump > backup.sql
```

**Automated Backups:**
- Supabase Pro: Daily automatic backups
- Custom: Set up cron job with pg_dump

### Code Backups

- Use Git for version control
- Tag releases: `git tag v1.0.0`
- Push to GitHub/GitLab

---

## Support & Maintenance

### Regular Tasks

- **Daily:** Monitor error logs
- **Weekly:** Check database performance
- **Monthly:** Update dependencies
- **Quarterly:** Security audit

### Update Dependencies

```bash
npm outdated              # Check for updates
npm update                # Update minor/patch versions
npm install <pkg>@latest  # Update major versions
```

---

## Additional Resources

- **Supabase Docs:** https://supabase.com/docs
- **Vite Docs:** https://vitejs.dev/guide/
- **React Docs:** https://react.dev/
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Database
npm run setup-db         # Setup database schema
npm run seed             # Seed test data
node scripts/verify_seed.js  # Verify data

# Deployment
vercel                   # Deploy to Vercel
netlify deploy --prod    # Deploy to Netlify
```

### Important Ports

- **Dev Server:** 5000
- **Preview Server:** 5000 (or $PORT)
- **Supabase:** 443 (HTTPS)

### Important URLs

- **Dev:** http://localhost:5000
- **Supabase Dashboard:** https://app.supabase.com
- **Deployed App:** [Your domain here]

---

**Status:** ✅ Deployment guide complete and verified  
**Next Steps:** Follow this guide to deploy your application

*For acceptance criteria, see READY_CHECKLIST.md*
