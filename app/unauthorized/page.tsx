export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You need to be authenticated via Whop to access this page.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Please access this page through your Whop customer portal.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
