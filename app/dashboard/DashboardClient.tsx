'use client';

import { useState } from 'react';
import { Client, Lead } from '@/lib/db';
import { updateWebhookUrl, updateUsername, updateFieldSettings } from './actions';

interface DashboardClientProps {
  client: Client;
  leads: Lead[];
}

export default function DashboardClient({ client, leads }: DashboardClientProps) {
  const [webhookUrl, setWebhookUrl] = useState(client.webhookUrl || '');
  const [username, setUsername] = useState(client.username || '');
  const [captureName, setCaptureName] = useState(client.captureName || false);
  const [capturePhone, setCapturePhone] = useState(client.capturePhone || false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      // Update username if changed
      if (username !== client.username) {
        const usernameResult = await updateUsername(username);
        if (!usernameResult.success) {
          setSaveMessage(usernameResult.error || 'Failed to update username.');
          setIsSaving(false);
          return;
        }
      }

      // Update field settings
      const fieldResult = await updateFieldSettings(captureName, capturePhone);
      if (!fieldResult.success) {
        setSaveMessage(fieldResult.error || 'Failed to update field settings.');
        setIsSaving(false);
        return;
      }

      // Update webhook URL
      const webhookResult = await updateWebhookUrl(webhookUrl);
      if (!webhookResult.success) {
        setSaveMessage(webhookResult.error || 'Failed to update webhook URL.');
        setIsSaving(false);
        return;
      }

      setSaveMessage('Settings saved successfully!');
    } catch (error) {
      setSaveMessage('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const capturePageUrl = `https://leadgen-saas.vercel.app/${username}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {client.username}!</h1>
          <p className="text-gray-600 mt-2">Manage your leads and capture page settings.</p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Capture Page Settings */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Capture Page Settings</h2>
            <div className="space-y-4">
              {/* Username/URL */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Username (URL)
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your-username"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This will change your capture page URL
                </p>
              </div>

              {/* Field Configuration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capture Additional Fields
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={captureName}
                      onChange={(e) => setCaptureName(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Capture Full Name</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={capturePhone}
                      onChange={(e) => setCapturePhone(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Capture Phone Number</span>
                  </label>
                </div>
              </div>

              {/* Capture Page URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Capture Page URL
                </label>
                <div className="bg-gray-50 p-3 rounded border">
                  <code className="text-sm break-all">{capturePageUrl}</code>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Share this URL to start collecting leads
                </p>
              </div>
            </div>
          </div>

          {/* Webhook Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Webhook Integration</h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Set up a webhook URL to receive real-time notifications when you get new leads.
              </p>
              <div>
                <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <input
                  type="url"
                  id="webhookUrl"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-zapier-webhook-url.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mb-8">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving Settings...' : 'Save All Settings'}
          </button>
          {saveMessage && (
            <p className={`text-sm mt-2 text-center ${
              saveMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'
            }`}>
              {saveMessage}
            </p>
          )}
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Leads ({leads.length})</h2>
          </div>
          <div className="overflow-x-auto">
            {leads.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    {captureName && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                    )}
                    {capturePhone && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Captured
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lead.email}
                      </td>
                      {captureName && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.name || '-'}
                        </td>
                      )}
                      {capturePhone && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.phone || '-'}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No leads yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Share your capture page URL to start collecting leads.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Zapier Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Zapier Integration Instructions</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <p>To integrate with Zapier:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Create a new Zap in Zapier</li>
              <li>Choose "Webhooks by Zapier" as the trigger</li>
              <li>Select "Catch Hook" as the trigger event</li>
              <li>Copy the webhook URL provided by Zapier</li>
              <li>Paste it in the Webhook URL field above and save</li>
              <li>Test the webhook by submitting a lead on your capture page</li>
              <li>Complete your Zap setup with the desired actions</li>
            </ol>
            <p className="mt-2">
              Each new lead will send a POST request to your webhook with lead and client information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
