import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from './lib/db';
import { clients } from './lib/db/schema';
import { eq } from 'drizzle-orm';

export async function middleware(request: NextRequest) {
  // Only protect the dashboard route
  if (!request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  try {
    // Get Whop session token from headers or query params
    const whopToken = request.headers.get('x-whop-token') || 
                      request.nextUrl.searchParams.get('token');

    if (!whopToken) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Validate Whop token using Whop SDK
    const whopResponse = await fetch('https://api.whop.com/api/v2/me', {
      headers: {
        'Authorization': `Bearer ${whopToken}`,
      },
    });

    if (!whopResponse.ok) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
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
    const response = NextResponse.next();
    response.headers.set('x-client-id', client[0].id);
    response.headers.set('x-client-username', client[0].username);

    return response;

  } catch (error) {
    console.error('Whop authentication error:', error);
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
