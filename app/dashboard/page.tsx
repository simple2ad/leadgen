import { db } from '@/lib/db';
import { clients, leads } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { headers } from 'next/headers';
import DashboardClient from './DashboardClient';
import jwt from 'jsonwebtoken';

export default async function DashboardPage() {
  const headersList = await headers();
  
  // Get Whop token directly from headers (bypassing middleware)
  let userToken = headersList.get('x-whop-user-token') || 
                  headersList.get('authorization')?.replace('Bearer ', '') ||
                  headersList.get('x-whop-token') ||
                  headersList.get('whop-user-token') ||
                  headersList.get('x-user-token') ||
                  headersList.get('whop-token') ||
                  headersList.get('x-whop-jwt') ||
                  headersList.get('whop-jwt');

  // Debug: Get all headers for display
  const allHeaders = Object.fromEntries(headersList.entries());

  // Development mode bypass (check for dev token or no token in dev)
  if (process.env.NODE_ENV === 'development' && !userToken) {
    console.log('Development mode: Using test user');
    
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

    // Fetch leads for this client
    const clientLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.clientId, client[0].id))
      .orderBy(desc(leads.createdAt));

    return (
      <DashboardClient 
        client={client[0]} 
        leads={clientLeads} 
      />
    );
  }

  // Validate JWT token
  if (!userToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">No Whop authentication token provided.</p>
        </div>
      </div>
    );
  }

  try {
    // Whop JWT Configuration (from your PHP code)
    const whopPublicKey = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAErz8a8vxvexHC0TLT91g7llOdDOsN
uYiGEfic4Qhni+HMfRBuUphOh7F3k8QgwZc9UlL0AHmyYqtbhL9NuJes6w==
-----END PUBLIC KEY-----`;
    const whopIssuer = "urn:whopcom:exp-proxy";
    const whopAppId = process.env.WHOP_APP_ID || 'app_l6lYmcWyVzxCzx';

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

    console.log('JWT validation successful, user ID:', userId);

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
      console.log('Created new client:', client[0]);
    }

    // Fetch leads for this client
    const clientLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.clientId, client[0].id))
      .orderBy(desc(leads.createdAt));

    return (
      <DashboardClient 
        client={client[0]} 
        leads={clientLeads} 
      />
    );

  } catch (jwtError) {
    console.error('JWT validation error in dashboard:', jwtError);
    const errorMessage = jwtError instanceof Error ? jwtError.message : 'Unknown error';
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Failed</h1>
            <p className="text-gray-600 mb-2">JWT validation error occurred.</p>
            <p className="text-sm text-red-500 mb-4">Error: {errorMessage}</p>
          </div>
          
          {/* Debug Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-4">JWT Debug Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-yellow-700 mb-2">Token Information:</h3>
                <div className="bg-white border border-yellow-200 rounded p-3 text-sm">
                  <div><strong>Token Length:</strong> {userToken?.length}</div>
                  <div><strong>Token Prefix:</strong> {userToken?.substring(0, 50)}...</div>
                  <div><strong>Error:</strong> {errorMessage}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-yellow-700 mb-2">JWT Configuration:</h3>
                <div className="bg-white border border-yellow-200 rounded p-3 text-sm">
                  <div><strong>Algorithm:</strong> ES256</div>
                  <div><strong>Issuer:</strong> urn:whopcom:exp-proxy</div>
                  <div><strong>Audience:</strong> {process.env.WHOP_APP_ID || 'app_l6lYmcWyVzxCzx'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
