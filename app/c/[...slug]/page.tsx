'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CapturePageProps {
  params: {
    slug: string[];
  };
}

interface CapturePageData {
  id: string;
  name: string;
  slug: string;
  headline: string;
  subheadline: string;
  backgroundType: 'gradient' | 'solid' | 'image';
  backgroundColor: string;
  backgroundGradient: string;
  backgroundImage: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  fontFamily: string;
  captureName: boolean;
  capturePhone: boolean;
}

export default function CapturePage({ params }: CapturePageProps) {
  const router = useRouter();
  const [pageData, setPageData] = useState<CapturePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadCapturePage() {
      try {
        setIsLoading(true);
        
        // Handle different URL formats:
        // - /c/slug (short URL)
        // - /c/clientId/slug (full URL)
        
        let clientId: string | null = null;
        let slug: string;
        
        if (params.slug.length === 1) {
          // Short URL format: /c/slug
          slug = params.slug[0];
          
          // Resolve slug to get client ID
          const resolveResponse = await fetch(`/api/capture-pages/resolve/${slug}`);
          if (!resolveResponse.ok) {
            throw new Error('Capture page not found');
          }
          const resolveData = await resolveResponse.json();
          clientId = resolveData.clientId;
        } else if (params.slug.length === 2) {
          // Full URL format: /c/clientId/slug
          clientId = params.slug[0];
          slug = params.slug[1];
        } else {
          throw new Error('Invalid URL format');
        }

        if (!clientId) {
          throw new Error('Could not resolve capture page');
        }

        // Fetch the capture page data
        const response = await fetch(`/api/capture-pages/${clientId}/${slug}`);
        
        if (!response.ok) {
          throw new Error('Capture page not found');
        }
        
        const data = await response.json();
        setPageData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load capture page');
      } finally {
        setIsLoading(false);
      }
    }

    loadCapturePage();
  }, [params.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      if (!pageData) return;

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: pageData?.captureName ? name : undefined,
          phone: pageData?.capturePhone ? phone : undefined,
          username: pageData?.slug, // Use slug as username for now
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Thank you! You have been added to the list.');
        setEmail('');
        setName('');
        setPhone('');
      } else {
        setMessage(result.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPageStyles = () => {
    if (!pageData) return {};

    const styles: React.CSSProperties = {
      fontFamily: pageData.fontFamily,
      color: pageData.textColor,
    };

    if (pageData.backgroundType === 'gradient') {
      styles.background = pageData.backgroundGradient;
    } else if (pageData.backgroundType === 'solid') {
      styles.backgroundColor = pageData.backgroundColor;
    } else if (pageData.backgroundType === 'image' && pageData.backgroundImage) {
      styles.backgroundImage = `url(${pageData.backgroundImage})`;
      styles.backgroundSize = 'cover';
      styles.backgroundPosition = 'center';
    }

    return styles;
  };

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

  if (error || !pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600">The capture page you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={getPageStyles()}>
      <div className="max-w-md w-full text-center">
        <h1 
          className="text-3xl font-bold mb-4"
          style={{ color: pageData.textColor, fontFamily: pageData.fontFamily }}
        >
          {pageData.headline}
        </h1>
        <p 
          className="text-lg mb-8"
          style={{ color: pageData.textColor, fontFamily: pageData.fontFamily }}
        >
          {pageData.subheadline}
        </p>
        
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {pageData.captureName && (
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            
            {pageData.capturePhone && (
              <div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: pageData.buttonColor,
                color: pageData.buttonTextColor,
                fontFamily: pageData.fontFamily
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Join Now'}
            </button>
          </form>
          
          {message && (
            <p className={`mt-4 text-sm ${
              message.includes('Thank you') ? 'text-green-600' : 'text-red-600'
            }`}>
              {message}
            </p>
          )}
        </div>
        
        <p 
          className="mt-6 text-sm opacity-75"
          style={{ color: pageData.textColor, fontFamily: pageData.fontFamily }}
        >
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
}
