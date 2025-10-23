import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from './lib/db';
import { clients } from './lib/db/schema';
import { eq } from 'drizzle-orm';

export async function middleware(request: NextRequest) {
  // Add security headers for iframe compatibility
  const response = NextResponse.next();
  
  // Allow embedding in iframes from Whop domains and Vercel
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.whop.com https://*.vercel.app https://vercel.com"
  );
  
  // Allow cross-origin requests for iframe communication
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-whop-token');
  
  // Only protect the dashboard route
  if (!request.nextUrl.pathname.startsWith('/dashboard')) {
    return response;
  }

  try {
    // Get Whop session token from headers or query params
    // Whop typically sends authentication via headers when in iframe
    const whopToken = request.headers.get('x-whop-token') || 
                      request.headers.get('authorization')?.replace('Bearer ', '') ||
                      request.nextUrl.searchParams.get('token');

    // For development/testing, allow bypass
    if (process.env.NODE_ENV === 'development' && !whopToken) {
      console.log('Development mode: Bypassing Whop authentication');
      
      // Create or get a test client
      let client = await db
        .select()
        .from(clients)
        .where(eq(clients.username, 'test-user'))
        .limit(1);

      if (client.length === 0) {
        const newClient = await db
          .insert(clients)
          .values({
            whopUserId: 'dev-test-user',
            email: 'test@example.com',
            username: 'test-user',
          })
          .returning();
        client = newClient;
      }

      response.headers.set('x-client-id', client[0].id);
      response.headers.set('x-client-username', client[0].username);
      return response;
    }

    if (!whopToken) {
      console.log('No Whop token found');
      // Instead of redirecting, set auth status header and let dashboard handle it
      response.headers.set('x-auth-status', 'unauthorized');
      response.headers.set('x-auth-error', 'No Whop token provided');
      return response;
    }

    // Validate Whop token using Whop API
    const whopResponse = await fetch('https://api.whop.com/api/v2/me', {
      headers: {
        'Authorization': `Bearer ${whopToken}`,
      },
    });

    if (!whopResponse.ok) {
      console.log('Whop API response not OK:', whopResponse.status);
      // Instead of redirecting, set auth status header and let dashboard handle it
      response.headers.set('x-auth-status', 'unauthorized');
      response.headers.set('x-auth-error', `Whop API error: ${whopResponse.status}`);
      return response;
    }

    const whopUser = await whopResponse.json();

    // Check if client exists in our database
    let client = await db
      .select()
      .from(clients)
      .where(eq(clients.whopUserId, whopUser.id))
      .limit(1);

    // Auto-provision new client if they don't exist
    if (client.length === 0) {
      // Generate a unique username based on email or whop user id
      const username = whopUser.email?.split('@')[0] || 
                      `user_${whopUser.id.slice(0, 8)}`;
      
      // Ensure username is unique
      let finalUsername = username;
      let counter = 1;
      
      while (true) {
        const existing = await db
          .select()
          .from(clients)
          .where(eq(clients.username, finalUsername))
          .limit(1);
        
        if (existing.length === 0) break;
        finalUsername = `${username}${counter}`;
        counter++;
      }

      // Create new client
      const newClient = await db
        .insert(clients)
        .values({
          whopUserId: whopUser.id,
          email: whopUser.email,
          username: finalUsername,
        })
        .returning();

      client = newClient;
    }

    // Add client info to request headers for the dashboard page
    response.headers.set('x-client-id', client[0].id);
    response.headers.set('x-client-username', client[0].username);

    return response;

  } catch (error) {
    console.error('Whop authentication error:', error);
    // Instead of redirecting, set auth status header and let dashboard handle it
    response.headers.set('x-auth-status', 'unauthorized');
    response.headers.set('x-auth-error', 'Authentication error occurred');
    return response;
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
