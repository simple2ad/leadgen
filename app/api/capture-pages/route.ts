import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { capturePages, clients } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    
    // Get Whop token
    let userToken = headersList.get('x-whop-user-token') || 
                    headersList.get('authorization')?.replace('Bearer ', '') ||
                    headersList.get('x-whop-token') ||
                    headersList.get('whop-user-token') ||
                    headersList.get('x-user-token') ||
                    headersList.get('whop-token') ||
                    headersList.get('x-whop-jwt') ||
                    headersList.get('whop-jwt');

    // Development mode bypass - for testing without authentication
    let clientId: string;
    if (process.env.NODE_ENV === 'development' && !userToken) {
      console.log('Development mode: Using test user');
      // Get or create a test client
      let testClients = await db
        .select()
        .from(clients)
        .where(eq(clients.username, 'test-user'))
        .limit(1);

      if (testClients.length === 0) {
        const newClient = await db
          .insert(clients)
          .values({
            whopUserId: 'dev-test-user',
            email: 'test@example.com',
            username: 'test-user',
          })
          .returning();
        testClients = newClient;
      }
      clientId = testClients[0].id;
    } else {
      // Validate JWT token for production
      if (!userToken) {
        return NextResponse.json(
          { success: false, error: 'No authentication token provided' },
          { status: 401 }
        );
      }

      const whopPublicKey = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAErz8a8vxvexHC0TLT91g7llOdDOsN
uYiGEfic4Qhni+HMfRBuUphOh7F3k8QgwZc9UlL0AHmyYqtbhL9NuJes6w==
-----END PUBLIC KEY-----`;
      const whopIssuer = "urn:whopcom:exp-proxy";
      const whopAppId = process.env.WHOP_APP_ID || 'app_l6lYmcWyVzxCzx';

      const decoded = jwt.verify(userToken, whopPublicKey, { 
        algorithms: ['ES256'],
        issuer: whopIssuer,
        audience: whopAppId
      }) as jwt.JwtPayload;

      const userId = decoded.sub;
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'No user ID found in JWT token' },
          { status: 401 }
        );
      }

      // Get client from database
      const clientRecords = await db
        .select()
        .from(clients)
        .where(eq(clients.whopUserId, userId))
        .limit(1);

      if (clientRecords.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Client not found' },
          { status: 404 }
        );
      }

      clientId = clientRecords[0].id;
    }

    // Parse request body
    const body = await request.json();
    const {
      name,
      slug,
      headline,
      subheadline,
      backgroundType,
      backgroundColor,
      backgroundGradient,
      backgroundImage,
      textColor,
      buttonColor,
      buttonTextColor,
      fontFamily,
      captureName,
      capturePhone
    } = body;

    // Validate required fields
    if (!name || !slug || !headline) {
      return NextResponse.json(
        { success: false, error: 'Name, slug, and headline are required' },
        { status: 400 }
      );
    }

    // Check if slug is already taken by this client
    const existingPage = await db
      .select()
      .from(capturePages)
      .where(and(
        eq(capturePages.clientId, clientId),
        eq(capturePages.slug, slug)
      ))
      .limit(1);

    if (existingPage.length > 0) {
      return NextResponse.json(
        { success: false, error: 'This URL slug is already taken. Please choose a different one.' },
        { status: 400 }
      );
    }

    // Create the capture page
    const [newPage] = await db
      .insert(capturePages)
      .values({
        clientId,
        name,
        slug,
        headline,
        subheadline,
        backgroundType,
        backgroundColor,
        backgroundGradient,
        backgroundImage,
        textColor,
        buttonColor,
        buttonTextColor,
        fontFamily,
        captureName: captureName || false,
        capturePhone: capturePhone || false,
        isActive: false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      page: newPage,
      url: `https://leadgen-saas.vercel.app/c/${clientId}/${slug}`
    });

  } catch (error) {
    console.error('Error creating capture page:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
