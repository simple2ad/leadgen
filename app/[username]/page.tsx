import { db } from '@/lib/db';
import { clients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import LeadCaptureForm from './LeadCaptureForm';

interface PageProps {
  params: {
    username: string;
  };
}

export default async function CapturePage({ params }: PageProps) {
  const { username } = params;

  // Fetch client info based on username
  const client = await db
    .select()
    .from(clients)
    .where(eq(clients.username, username))
    .limit(1);

  if (client.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join {client[0].username}'s List
          </h1>
          <p className="text-gray-600">
            Enter your email below to get updates and exclusive content.
          </p>
        </div>
        
        <LeadCaptureForm username={username} />
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </div>
    </div>
  );
}
