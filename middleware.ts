import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only protect the dashboard route
  if (!request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // For now, let the dashboard page handle Whop authentication
  // Whop authentication happens client-side through their SDK
  // The dashboard page will handle redirecting to unauthorized if needed
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
