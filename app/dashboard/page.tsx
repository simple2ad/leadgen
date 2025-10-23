import { db } from '@/lib/db';
import { clients, leads } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { headers } from 'next/headers';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const headersList = await headers();
  const clientId = headersList.get('x-client-id');
  const clientUsername = headersList.get('x-client-username');
  const authStatus = headersList.get('x-auth-status');
  const authError = headersList.get('x-auth-error');
  const whopUserId = headersList.get('x-whop-user-id');

  // Debug: Get all headers for display
  const allHeaders = Object.fromEntries(headersList.entries());

  // Check if authentication failed
  if (authStatus === 'unauthorized') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-2">Please access this page through your Whop portal.</p>
            {authError && (
              <p className="text-sm text-red-500 mb-4">Error: {authError}</p>
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
                  <div><strong>x-client-id:</strong> {clientId || 'Not set'}</div>
                  <div><strong>x-client-username:</strong> {clientUsername || 'Not set'}</div>
                  <div><strong>x-whop-user-id:</strong> {whopUserId || 'Not set'}</div>
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
              
              <div>
                <h3 className="font-medium text-yellow-700 mb-2">Whop Token Headers Checked:</h3>
                <div className="bg-white border border-yellow-200 rounded p-3 text-sm">
                  <div><strong>x-whop-user-token:</strong> {headersList.get('x-whop-user-token') ? '✓ Found' : '✗ Not found'}</div>
                  <div><strong>authorization:</strong> {headersList.get('authorization') ? '✓ Found' : '✗ Not found'}</div>
                  <div><strong>x-whop-token:</strong> {headersList.get('x-whop-token') ? '✓ Found' : '✗ Not found'}</div>
                  <div><strong>whop-user-token:</strong> {headersList.get('whop-user-token') ? '✓ Found' : '✗ Not found'}</div>
                  <div><strong>x-user-token:</strong> {headersList.get('x-user-token') ? '✓ Found' : '✗ Not found'}</div>
                  <div><strong>whop-token:</strong> {headersList.get('whop-token') ? '✓ Found' : '✗ Not found'}</div>
                  <div><strong>x-whop-jwt:</strong> {headersList.get('x-whop-jwt') ? '✓ Found' : '✗ Not found'}</div>
                  <div><strong>whop-jwt:</strong> {headersList.get('whop-jwt') ? '✓ Found' : '✗ Not found'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if client info is missing (shouldn't happen if auth passed)
  if (!clientId || !clientUsername) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please access this page through your Whop portal.</p>
        </div>
      </div>
    );
  }

  // Fetch client data
  const client = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  if (client.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Client Not Found</h1>
          <p className="text-gray-600">Your account could not be found.</p>
        </div>
      </div>
    );
  }

  // Fetch leads for this client
  const clientLeads = await db
    .select()
    .from(leads)
    .where(eq(leads.clientId, clientId))
    .orderBy(desc(leads.createdAt));

  return (
    <DashboardClient 
      client={client[0]} 
      leads={clientLeads} 
    />
  );
}
