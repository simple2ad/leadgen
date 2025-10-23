'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Client } from '@/lib/db';

interface SettingsClientProps {
  client: Client;
}

export default function SettingsClient({ client }: SettingsClientProps) {
  const router = useRouter();
  const [notifyOnNewLeads, setNotifyOnNewLeads] = useState(client.notifyOnNewLeads || false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const response = await fetch(`/api/dashboard/settings?clientId=${client.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notifyOnNewLeads,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setSaveMessage(result.error || 'Failed to update settings.');
      } else {
        setSaveMessage('Settings saved successfully!');
      }
    } catch (error) {
      setSaveMessage('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    setTestMessage('');
    setDebugInfo(null);

    try {
      const startTime = Date.now();
      const response = await fetch(`/api/dashboard/test-notification?clientId=${client.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const endTime = Date.now();
      const result = await response.json();

      // Capture debug information
      const debugData = {
        timestamp: new Date().toISOString(),
        responseTime: `${endTime - startTime}ms`,
        status: response.status,
        statusText: response.statusText,
        url: `/api/dashboard/test-notification?clientId=${client.id}`,
        request: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        response: result,
        clientInfo: {
          id: client.id,
          whopUserId: client.whopUserId,
          notifyOnNewLeads: client.notifyOnNewLeads,
        }
      };

      setDebugInfo(debugData);

      if (!result.success) {
        setTestMessage(result.error || 'Failed to send test notification.');
      } else {
        setTestMessage('Test notification sent successfully! Check your Whop messages.');
      }
    } catch (error) {
      const debugData = {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        clientInfo: {
          id: client.id,
          whopUserId: client.whopUserId,
          notifyOnNewLeads: client.notifyOnNewLeads,
        }
      };
      setDebugInfo(debugData);
      setTestMessage('An error occurred while sending test notification.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">Configure your notification preferences.</p>
            </div>
            <button
              onClick={handleBackToDashboard}
              className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h2>
          
          <div className="space-y-6">
            {/* Notify on New Leads */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-900">Notify me on new leads</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Receive notifications when new leads are captured
                </p>
              </div>
              <button
                onClick={() => setNotifyOnNewLeads(!notifyOnNewLeads)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  notifyOnNewLeads ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={notifyOnNewLeads}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifyOnNewLeads ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving Settings...' : 'Save Settings'}
              </button>
              {saveMessage && (
                <p className={`text-sm text-center mt-3 ${
                  saveMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {saveMessage}
                </p>
              )}
            </div>

            {/* Test Notification Button */}
            <div className="pt-4 border-t border-gray-200">
              <div className="space-y-3">
                <h3 className="text-base font-medium text-gray-900">Test Notifications</h3>
                <p className="text-sm text-gray-500">
                  Send a test notification to verify your notification settings are working correctly.
                </p>
                <button
                  onClick={handleTestNotification}
                  disabled={isTesting}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTesting ? 'Sending Test...' : 'Send Test Notification'}
                </button>
                {testMessage && (
                  <p className={`text-sm text-center mt-3 ${
                    testMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {testMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Debug Information Section */}
        {debugInfo && (
          <div className="bg-yellow-50 rounded-lg p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-yellow-900">Debug Information</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-yellow-700 transition-colors"
                >
                  {showDebug ? 'Hide Details' : 'Show Details'}
                </button>
                <button
                  onClick={() => setDebugInfo(null)}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-yellow-800">Timestamp:</strong>
                  <div className="text-yellow-700">{debugInfo.timestamp}</div>
                </div>
                {debugInfo.responseTime && (
                  <div>
                    <strong className="text-yellow-800">Response Time:</strong>
                    <div className="text-yellow-700">{debugInfo.responseTime}</div>
                  </div>
                )}
                {debugInfo.status && (
                  <div>
                    <strong className="text-yellow-800">Status:</strong>
                    <div className={`font-mono ${debugInfo.status >= 400 ? 'text-red-600' : 'text-green-600'}`}>
                      {debugInfo.status} {debugInfo.statusText}
                    </div>
                  </div>
                )}
                {debugInfo.url && (
                  <div>
                    <strong className="text-yellow-800">API Endpoint:</strong>
                    <div className="text-yellow-700 font-mono text-xs">{debugInfo.url}</div>
                  </div>
                )}
              </div>

              {showDebug && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Full Response:</h4>
                  <pre className="bg-white border border-yellow-200 rounded p-3 text-xs overflow-x-auto text-yellow-800">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}

              {debugInfo.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <h4 className="text-sm font-medium text-red-800 mb-1">Error:</h4>
                  <p className="text-red-700 text-sm">{debugInfo.error}</p>
                </div>
              )}

              {debugInfo.response?.debug && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">API Debug Info:</h4>
                  <pre className="text-blue-700 text-xs overflow-x-auto">
                    {JSON.stringify(debugInfo.response.debug, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Coming Soon Section */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-900">More Settings Coming Soon</h3>
              <p className="text-sm text-blue-800 mt-1">
                We're working on adding more notification and customization options. Stay tuned for updates!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
