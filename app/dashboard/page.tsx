import { db } from '@/lib/db';
import { clients, leads } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { headers } from 'next/headers';
import DashboardClient from './DashboardClient';
import jwt from 'jsonwebtoken';

export default async function DashboardPage() {
  const headersList = await headers();
  const userToken = headersList.get('x-whop-user-token');
  const devMode = headersList.get('x-dev-mode');
  const authStatus = headersList.get('x-auth-status');
  const authError = headersList.get('x-auth-error');

  // Debug: Get all headers for display
  const allHeaders = Object.fromEntries(headersList.entries());

  // Check if authentication failed from middleware
  if (authStatus === 'unauthorized') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-2">Please access this page through your Whop portal.</p>
            {authError && (
              <div className="mb-4">
                <p className="text-sm text-red-500 mb-2">Error: {authError}</p>
                {authError.includes('JWT validation failed') && (
                  <div className="text-xs text-red-400 bg-red-50 p-2 rounded border border-red-200">
                    <strong>JWT Issue Detected:</strong> This could be due to:
                    <ul className="list-disc list-inside mt-1 ml-2">
                      <li>Invalid JWT token format</li>
                      <li>Wrong public key or algorithm</li>
                      <li>Token expired or malformed</li>
                      <li>Issuer/audience mismatch</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Debug Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-4">Debug Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-yellow-700 mb-2">Authentication Headers:</h3>
                <div className="bg-white border border-yellow-200 rounded p-3 text-sm">
                  <div><strong>x-auth-status:</strong> {authStatus || 'Not set'}</div>
                  <div><strong>x-auth-error:</strong> {authError || 'Not set'}</div>
                  <div><strong>x-whop-user-token:</strong> {userToken ? '✓ Found' : '✗ Not found'}</div>
                  <div><strong>x-dev-mode:</strong> {devMode || 'Not set'}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-yellow-700 mb-2">All Headers (First 10):</h3>
                <div className="bg-white border border-yellow-200 rounded p-3 text-sm max-h-60 overflow-y-auto">
                  {Object.entries(allHeaders).slice(0, 10).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-100 py-1">
                      <strong>{key}:</strong> {value}
                    </div>
                  ))}
                  {Object.keys(allHeaders).length > 10 && (
                    <div className="text-gray-500 italic mt-2">
                      ... and {Object.keys(allHeaders).length - 10} more headers
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Development mode bypass
  if (devMode === 'true') {
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
