import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from './lib/db';
import { clients } from './lib/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export async function middleware(request: NextRequest) {
  // Add security headers for iframe compatibility
  const response = NextResponse.next();
  
  // Allow cross-origin requests for iframe communication
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-whop-user-token');
  
  // Only protect the dashboard route
  if (!request.nextUrl.pathname.startsWith('/dashboard')) {
    return response;
  }

  try {
    // Get Whop JWT token from headers (following your PHP implementation)
    const headersList = request.headers;
    
    // Debug: Log all headers to see what Whop is sending
    console.log('=== WHOP AUTH DEBUG ===');
    console.log('All headers:', Object.fromEntries(headersList.entries()));
    
    let userToken = headersList.get('x-whop-user-token') || 
                    headersList.get('authorization')?.replace('Bearer ', '') ||
                    request.nextUrl.searchParams.get('token') ||
                    request.nextUrl.searchParams.get('whop-dev-user-token');

    console.log('Extracted userToken:', userToken ? 'Token found (length: ' + userToken.length + ')' : 'No token found');

    // Check for other common Whop header names (from your PHP code)
    if (!userToken) {
      const possibleHeaders = [
        'x-whop-token',
        'whop-user-token', 
        'x-user-token',
        'whop-token',
        'x-whop-jwt',
        'whop-jwt'
      ];
      
      for (const headerName of possibleHeaders) {
        const value = headersList.get(headerName);
        if (value) {
          userToken = value;
          console.log('Found token in header:', headerName);
          break;
        }
      }
    }

    // For development/testing, allow bypass
    if (process.env.NODE_ENV === 'development' && !userToken) {
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

    if (!userToken) {
      console.log('No Whop JWT token found');
      // Instead of redirecting, set auth status header and let dashboard handle it
      response.headers.set('x-auth-status', 'unauthorized');
      response.headers.set('x-auth-error', 'No Whop JWT token provided');
      return response;
    }

    // Whop JWT Configuration (from your PHP code)
    const whopPublicKey = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAErz8a8vxvexHC0TLT91g7llOdDOsN
uYiGEfic4Qhni+HMfRBuUphOh7F3k8QgwZc9UlL0AHmyYqtbhL9NuJes6w==
-----END PUBLIC KEY-----`;
    const whopIssuer = "urn:whopcom:exp-proxy";
    const whopAppId = process.env.WHOP_APP_ID || 'app_l6lYmcWyVzxCzx';

    try {
      // Verify and decode the JWT with ES256 algorithm
      const decoded = jwt.verify(userToken, whopPublicKey, { 
        algorithms: ['ES256'],
        issuer: whopIssuer,
        audience: whopAppId
      }) as jwt.JwtPayload;

      // Extract user ID from subject
      const userId = decoded.sub;
      if (!userId) {
        throw new Error('No user ID found in JWT token');
      }

      // Use Whop API to get user details (optional, but good for validation)
      const whopApiKey = process.env.WHOP_API_KEY;
      if (whopApiKey) {
        try {
          const whopResponse = await fetch(`https://api.whop.com/api/v2/memberships/${userId}`, {
            headers: {
              'Authorization': `Bearer ${whopApiKey}`,
            },
          });

          if (whopResponse.ok) {
            const userData = await whopResponse.json();
            console.log('Whop user data:', userData);
          }
        } catch (apiError) {
          console.log('Whop API call failed, continuing with JWT validation only:', apiError);
        }
      }

      // Check if client exists in our database
      let client = await db
        .select()
        .from(clients)
        .where(eq(clients.whopUserId, userId))
        .limit(1);

      // Auto-provision new client if they don't exist
      if (client.length === 0) {
        // Generate a unique username based on user ID
        const username = `user_${userId.slice(0, 8)}`;
        
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
            whopUserId: userId,
            email: null, // We don't have email from JWT, can get from API if needed
            username: finalUsername,
          })
          .returning();

        client = newClient;
      }

      // Add client info to request headers for the dashboard page
      response.headers.set('x-client-id', client[0].id);
      response.headers.set('x-client-username', client[0].username);
      response.headers.set('x-whop-user-id', userId);

      return response;

    } catch (jwtError) {
      console.error('JWT validation error:', jwtError);
      const errorMessage = jwtError instanceof Error ? jwtError.message : 'Unknown error';
      console.log('JWT Error details:', {
        errorMessage,
        tokenLength: userToken?.length,
        tokenPrefix: userToken?.substring(0, 50) + '...'
      });
      response.headers.set('x-auth-status', 'unauthorized');
      response.headers.set('x-auth-error', `JWT validation failed: ${errorMessage}`);
      return response;
    }

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
