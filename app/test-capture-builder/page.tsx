'use client';

import { useState } from 'react';

export default function TestCaptureBuilder() {
  const [headline, setHeadline] = useState('Join Our Exclusive List');
  const [subheadline, setSubheadline] = useState('Get updates and exclusive content delivered to your inbox');
  const [backgroundColor, setBackgroundColor] = useState('#667eea');
  const [textColor, setTextColor] = useState('#ffffff');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Capture Page Builder - Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subheadline
                </label>
                <textarea
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Live Preview</h2>
            
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="min-h-[400px] flex items-center justify-center p-8"
                style={{ backgroundColor, color: textColor }}
              >
                <div className="max-w-md w-full text-center">
                  <h1 className="text-3xl font-bold mb-4">
                    {headline}
                  </h1>
                  <p className="text-lg mb-8">
                    {subheadline}
                  </p>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <form className="space-y-4">
                      <div>
                        <input
                          type="email"
                          placeholder="Enter your email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Join Now
                      </button>
                    </form>
                  </div>
                  
                  <p className="mt-6 text-sm opacity-75">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Capture Page Builder Test</h3>
          <p className="text-green-700">
            This test page demonstrates the live editing functionality of the capture page builder.
            Changes made in the settings panel are immediately reflected in the preview panel.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-100 p-3 rounded">
              <strong>Headline:</strong> Editable text field
            </div>
            <div className="bg-green-100 p-3 rounded">
              <strong>Subheadline:</strong> Editable text area
            </div>
            <div className="bg-green-100 p-3 rounded">
              <strong>Colors:</strong> Live color pickers
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
