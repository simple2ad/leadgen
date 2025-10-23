import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
    // Get Whop JWT token from headers
    const headersList = request.headers;
    
    // Debug: Log all headers to see what Whop is sending
    console.log('=== WHOP AUTH DEBUG ===');
    console.log('All headers:', Object.fromEntries(headersList.entries()));
    
    let userToken = headersList.get('x-whop-user-token') || 
                    headersList.get('authorization')?.replace('Bearer ', '') ||
                    request.nextUrl.searchParams.get('token') ||
                    request.nextUrl.searchParams.get('whop-dev-user-token');

    console.log('Extracted userToken:', userToken ? 'Token found (length: ' + userToken.length + ')' : 'No token found');

    // Check for other common Whop header names
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
      response.headers.set('x-dev-mode', 'true');
      return response;
    }

    if (!userToken) {
      console.log('No Whop JWT token found');
      // Instead of redirecting, set auth status header and let dashboard handle it
      response.headers.set('x-auth-status', 'unauthorized');
      response.headers.set('x-auth-error', 'No Whop JWT token provided');
      return response;
    }

    // Forward the token to the dashboard page - JWT validation will happen in the server component
    response.headers.set('x-whop-user-token', userToken);
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
