# LeadGen SaaS - Setup Guide

## Quick Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/leadgen"
WHOP_API_KEY="your_whop_api_key_here"
WHOP_CLIENT_ID="your_whop_client_id_here"
WHOP_CLIENT_SECRET="your_whop_client_secret_here"
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"
SECURITY_HASH_SECRET="your_security_hash_secret"
```

### 3. Database Setup
```bash
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

## Architecture Overview

### Core Components

1. **Authentication Middleware** (`middleware.ts`)
   - Protects `/dashboard` routes
   - Validates Whop sessions
   - Auto-provisions new clients

2. **Lead Capture System**
   - Dynamic routes: `/[username]`
   - Server-rendered capture pages
   - Thank you pages: `/[username]/thank-you`

3. **Client Dashboard** (`/dashboard`)
   - Protected by Whop authentication
   - View leads in real-time
   - Webhook configuration

4. **Database Schema**
   - `clients` table with Whop integration
   - `leads` table with client relationships

### Key Features Implemented

✅ **Multi-tenant Architecture** - Each client gets unique capture pages  
✅ **Whop Authentication** - No login page needed, secure session validation  
✅ **Lead Capture Forms** - Clean, high-converting email capture  
✅ **Protected Dashboard** - Client-only access to leads and settings  
✅ **Webhook Integration** - Real-time notifications for new leads  
✅ **Zapier Compatibility** - Easy integration with automation tools  
✅ **Auto-provisioning** - Automatic client creation via Whop  
✅ **Security Features** - Input validation, duplicate prevention, security hashes  

### File Structure
```
├── app/
│   ├── [username]/           # Dynamic lead capture pages
│   │   ├── page.tsx          # Capture page
│   │   ├── LeadCaptureForm.tsx
│   │   ├── actions.ts        # Lead submission logic
│   │   └── thank-you/page.tsx
│   ├── dashboard/            # Protected client area
│   │   ├── page.tsx          # Dashboard server component
│   │   ├── DashboardClient.tsx
│   │   └── actions.ts        # Webhook management
│   ├── unauthorized/page.tsx # Access denied page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── lib/
│   └── db/
│       ├── schema.ts        # Database schema
│       └── index.ts         # Database connection
├── middleware.ts            # Whop authentication
└── Configuration files
```

### Usage Examples

#### Lead Capture
- Visit: `http://localhost:3000/john-doe`
- Submit email → Redirect to thank you page
- Lead stored in database with client association

#### Client Dashboard
- Access via Whop customer portal
- View all captured leads
- Configure webhook URLs
- Get Zapier integration instructions

#### Webhook Payload
```json
{
  "event": "new_lead",
  "lead": {
    "id": "lead-uuid",
    "email": "lead@example.com",
    "createdAt": "2025-10-22T14:30:00Z"
  },
  "client": {
    "id": "client-uuid",
    "username": "john-doe",
    "email": "client@example.com"
  }
}
```

## Production Deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Environment Variables for Production
- All variables from `.env.example`
- Production database URL
- Production Whop credentials
- Secure secrets

## Support & Troubleshooting

### Common Issues
1. **Database Connection**: Ensure DATABASE_URL is correct
2. **Whop Authentication**: Verify API keys and client credentials
3. **Build Errors**: Check TypeScript compilation and dependencies

### Testing
Run the test script to verify setup:
```bash
node test-setup.js
```

The project is now ready for development and deployment!
