# LeadGen SaaS - Multi-Tenant Lead Generation System

A multi-tenant lead generation SaaS application with Whop authentication, built with Next.js 14, TypeScript, and Drizzle ORM.

## Features

- **Multi-tenant Architecture**: Each client gets their own unique lead capture page
- **Whop Authentication**: Secure authentication via Whop SDK (no login page needed)
- **Lead Capture Pages**: Customizable lead capture forms for each client
- **Protected Dashboard**: Client dashboard to view captured leads
- **Webhook Integration**: Real-time notifications via webhooks (Zapier compatible)
- **Auto-provisioning**: Automatic client creation when accessing via Whop

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Whop SDK
- **Deployment**: Vercel-ready

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/leadgen"

# Whop Configuration
WHOP_API_KEY="your_whop_api_key_here"
WHOP_CLIENT_ID="your_whop_client_id_here"
WHOP_CLIENT_SECRET="your_whop_client_secret_here"

# App Configuration
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"
SECURITY_HASH_SECRET="your_security_hash_secret"
```

### 3. Database Setup

1. Create a PostgreSQL database
2. Push the schema to your database:

```bash
npm run db:push
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## User Flows

### Lead Capture Flow

1. **Lead visits capture page**: `/[username]` (e.g., `/john-doe`)
2. **Submit email**: Simple form with email field
3. **Redirect to thank you page**: `/[username]/thank-you`
4. **Lead stored in database**: Associated with the client

### Client Dashboard Flow

1. **Client accesses via Whop**: Clicks link from Whop customer portal
2. **Authentication**: Middleware validates Whop session
3. **Auto-provisioning**: Creates client account if doesn't exist
4. **Dashboard access**: View leads and manage settings

## Database Schema

### Clients Table
- `id` (uuid, primary key)
- `whop_user_id` (text, unique) - Whop user identifier
- `email` (text) - Client email
- `username` (varchar) - Unique username for capture page
- `webhook_url` (text) - Webhook URL for lead notifications
- `created_at` (timestamp)

### Leads Table
- `id` (uuid, primary key)
- `email` (text) - Lead email address
- `client_id` (uuid) - Foreign key to clients table
- `created_at` (timestamp)

## Webhook Integration

The system supports webhook integration for real-time lead notifications. When a new lead is captured:

- **POST request** sent to client's webhook URL
- **Payload** includes lead and client information
- **Zapier compatible** - Use "Webhooks by Zapier" trigger

### Webhook Payload Example

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

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on git push

### Environment Variables for Production

Ensure all environment variables from `.env.example` are set in your production environment.

## API Endpoints

### Public Routes
- `GET /[username]` - Lead capture page
- `GET /[username]/thank-you` - Thank you page

### Protected Routes
- `GET /dashboard` - Client dashboard (Whop authentication required)

### Server Actions
- `submitLead` - Handle lead form submissions
- `updateWebhookUrl` - Update client webhook settings

## Security Features

- **Whop Authentication**: All dashboard access requires valid Whop session
- **Middleware Protection**: Automatic session validation for protected routes
- **Input Validation**: Server-side validation for all form submissions
- **Duplicate Prevention**: Prevents duplicate lead submissions
- **Security Hash**: Basic security hash for form submissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
