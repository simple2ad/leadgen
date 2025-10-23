export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Page - Success!</h1>
          <p className="text-gray-600 mb-6">
            This is a static test page to verify that any page can be linked within your application.
          </p>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">What this page demonstrates:</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ Static page routing works</li>
                <li>✓ Styling and Tailwind CSS works</li>
                <li>✓ No authentication required</li>
                <li>✓ Can be linked from anywhere</li>
                <li>✓ Responsive design</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Test URLs:</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <div><strong>This page:</strong> /test</div>
                <div><strong>Home page:</strong> /</div>
                <div><strong>Lead capture:</strong> /[username]</div>
                <div><strong>Dashboard:</strong> /dashboard</div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <a 
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
