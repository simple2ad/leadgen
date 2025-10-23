'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CapturePageProps {
  params: {
    slug: string;
  };
}

export default function ShortCapturePage({ params }: CapturePageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function resolveCapturePage() {
      try {
        // Fetch the capture page data to get the client ID
        const response = await fetch(`/api/capture-pages/resolve/${params.slug}`);
        
        if (!response.ok) {
          throw new Error('Capture page not found');
        }
        
        const data = await response.json();
        
        // Redirect to the full URL with client ID
        router.replace(`/c/${data.clientId}/${params.slug}`);
      } catch (err) {
        console.error('Error resolving capture page:', err);
        setIsLoading(false);
      }
    }

    resolveCapturePage();
  }, [params.slug, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading capture page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600">The capture page you're looking for doesn't exist.</p>
      </div>
    </div>
  );
}
