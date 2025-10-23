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

  // Check if authentication failed
  if (authStatus === 'unauthorized') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-2">Please access this page through your Whop portal.</p>
          {authError && (
            <p className="text-sm text-red-500">Error: {authError}</p>
          )}
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
