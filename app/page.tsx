export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              LeadGen SaaS
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Multi-tenant lead generation system powered by Whop authentication
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                For Leads
              </h3>
              <p className="text-blue-700 mb-4">
                Access client-specific lead capture forms
              </p>
              <div className="text-sm text-blue-600">
                Visit: /[username] (e.g., /test-user)
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-green-900 mb-4">
                For Clients
              </h3>
              <p className="text-green-700 mb-4">
                Access your private dashboard via Whop
              </p>
              <div className="text-sm text-green-600">
                Visit: /dashboard (Whop authentication required)
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <a 
                href="/test-user"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Test Lead Capture Form
              </a>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Example lead capture page: /test-user</p>
              <p>Each client gets their own unique URL</p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              How It Works
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <div className="font-semibold">1. Client Onboarding</div>
                <p>Clients access via Whop customer portal</p>
              </div>
              <div>
                <div className="font-semibold">2. Lead Capture</div>
                <p>Unique URLs for each client's lead forms</p>
              </div>
              <div>
                <div className="font-semibold">3. Dashboard</div>
                <p>Private dashboard to view captured leads</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
