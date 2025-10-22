import { db } from '@/lib/db';
import { clients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    username: string;
  };
}

export default async function ThankYouPage({ params }: PageProps) {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thank You!
          </h1>
          <p className="text-gray-600">
            You've successfully joined {client[0].username}'s list. 
            Keep an eye on your inbox for updates and exclusive content.
          </p>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            What's next?
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✓ Check your email for a confirmation</li>
            <li>✓ Look out for valuable content</li>
            <li>✓ Unsubscribe anytime</li>
          </ul>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Powered by LeadGen SaaS
          </p>
        </div>
      </div>
    </div>
  );
}
