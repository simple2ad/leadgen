'use client';

import { useState, useEffect } from 'react';

interface CapturePageSettings {
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

interface SavedPage {
  id: string;
  name: string;
  slug: string;
  url: string;
  createdAt: string;
}

export default function CaptureBuilderPage() {
  const [settings, setSettings] = useState<CapturePageSettings>({
    name: 'My Capture Page',
    slug: 'my-capture-page',
    headline: 'Join Our Exclusive List',
    subheadline: 'Get updates and exclusive content delivered to your inbox',
    backgroundType: 'gradient',
    backgroundColor: '#ffffff',
    backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundImage: '',
    textColor: '#333333',
    buttonColor: '#3b82f6',
    buttonTextColor: '#ffffff',
    fontFamily: 'Inter',
    captureName: false,
    capturePhone: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [savedPage, setSavedPage] = useState<SavedPage | null>(null);
  const [slugError, setSlugError] = useState('');
  const [viewMode, setViewMode] = useState<'builder' | 'templates'>('builder');

  // Template definitions
  const templates = [
    {
      id: 'modern-gradient',
      name: 'Modern Gradient',
      description: 'Clean design with vibrant gradient background',
      settings: {
        name: 'Modern Gradient Page',
        slug: 'modern-gradient',
        headline: 'Join Our Community',
        subheadline: 'Be the first to get updates and exclusive content',
        backgroundType: 'gradient' as const,
        backgroundColor: '#ffffff',
        backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundImage: '',
        textColor: '#ffffff',
        buttonColor: '#ffffff',
        buttonTextColor: '#667eea',
        fontFamily: 'Inter',
        captureName: false,
        capturePhone: false,
      }
    },
    {
      id: 'minimal-dark',
      name: 'Minimal Dark',
      description: 'Elegant dark theme with clean typography',
      settings: {
        name: 'Minimal Dark Page',
        slug: 'minimal-dark',
        headline: 'Stay Connected',
        subheadline: 'Get notified about new updates and features',
        backgroundType: 'solid' as const,
        backgroundColor: '#1f2937',
        backgroundGradient: '',
        backgroundImage: '',
        textColor: '#f9fafb',
        buttonColor: '#3b82f6',
        buttonTextColor: '#ffffff',
        fontFamily: 'Inter',
        captureName: true,
        capturePhone: false,
      }
    },
    {
      id: 'professional-light',
      name: 'Professional Light',
      description: 'Professional business-focused design',
      settings: {
        name: 'Professional Page',
        slug: 'professional',
        headline: 'Get Business Insights',
        subheadline: 'Join industry leaders getting exclusive market insights',
        backgroundType: 'solid' as const,
        backgroundColor: '#f8fafc',
        backgroundGradient: '',
        backgroundImage: '',
        textColor: '#1e293b',
        buttonColor: '#0f766e',
        buttonTextColor: '#ffffff',
        fontFamily: 'Georgia',
        captureName: true,
        capturePhone: true,
      }
    }
  ];

  const loadTemplate = (template: typeof templates[0]) => {
    setSettings(template.settings);
    setViewMode('builder');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    setSlugError('');

    try {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(settings.slug)) {
        setSlugError('URL slug can only contain lowercase letters, numbers, and hyphens');
        setIsSaving(false);
        return;
      }

      const response = await fetch('/api/capture-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (!result.success) {
        if (result.error.includes('already taken')) {
          setSlugError(result.error);
        } else {
          setSaveMessage(result.error);
        }
      } else {
        setSaveMessage('Capture page saved successfully!');
        setSavedPage({
          id: result.page.id,
          name: result.page.name,
          slug: result.page.slug,
          url: result.url,
          createdAt: result.page.createdAt,
        });
      }
    } catch (error) {
      console.error('Error saving capture page:', error);
      setSaveMessage('Error saving capture page. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof CapturePageSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPreviewStyles = () => {
    const styles: React.CSSProperties = {
      fontFamily: settings.fontFamily,
      color: settings.textColor,
    };

    if (settings.backgroundType === 'gradient') {
      styles.background = settings.backgroundGradient;
    } else if (settings.backgroundType === 'solid') {
      styles.backgroundColor = settings.backgroundColor;
    } else if (settings.backgroundType === 'image' && settings.backgroundImage) {
      styles.backgroundImage = `url(${settings.backgroundImage})`;
      styles.backgroundSize = 'cover';
      styles.backgroundPosition = 'center';
    }

    return styles;
  };

  const fontOptions = [
    'Inter', 'Arial', 'Georgia', 'Times New Roman', 'Helvetica', 'Verdana',
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway',
    'Merriweather', 'Playfair Display', 'Source Sans Pro', 'Nunito',
    'Work Sans', 'Quicksand', 'Rubik', 'Oswald'
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Capture Page Builder</h1>
          <p className="text-gray-600 mt-2">Create and customize your lead capture pages</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setViewMode('builder')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'builder' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Builder
            </button>
            <button
              onClick={() => setViewMode('templates')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'templates' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Templates
            </button>
          </div>
        </div>

        {viewMode === 'builder' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Settings Panel */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Page Settings</h2>
                <button
                  onClick={() => setViewMode('templates')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Templates
                </button>
              </div>
            
              <div className="space-y-6">
                {/* Basic Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Page Name
                      </label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={settings.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value.toLowerCase())}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          slugError ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="my-capture-page"
                      />
                      {slugError && (
                        <p className="text-red-600 text-sm mt-1">{slugError}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Only lowercase letters, numbers, and hyphens allowed
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Headline
                      </label>
                      <input
                        type="text"
                        value={settings.headline}
                        onChange={(e) => handleInputChange('headline', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subheadline
                      </label>
                      <textarea
                        value={settings.subheadline}
                        onChange={(e) => handleInputChange('subheadline', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
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
                            checked={settings.captureName}
                            onChange={(e) => handleInputChange('captureName', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Capture Full Name</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.capturePhone}
                            onChange={(e) => handleInputChange('capturePhone', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Capture Phone Number</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save Capture Page'}
                  </button>
                  {saveMessage && (
                    <p className={`text-sm text-center mt-2 ${
                      saveMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {saveMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Live Preview</h2>
              
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="min-h-[500px] flex items-center justify-center p-8"
                  style={getPreviewStyles()}
                >
                  <div className="max-w-md w-full text-center">
                    <h1 
                      className="text-3xl font-bold mb-4"
                      style={{ color: settings.textColor, fontFamily: settings.fontFamily }}
                    >
                      {settings.headline}
                    </h1>
                    <p 
                      className="text-lg mb-8"
                      style={{ color: settings.textColor, fontFamily: settings.fontFamily }}
                    >
                      {settings.subheadline}
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
                        {settings.captureName && (
                          <div>
                            <input
                              type="text"
                              placeholder="Full Name"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}
                        {settings.capturePhone && (
                          <div>
                            <input
                              type="tel"
                              placeholder="Phone Number"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}
                        <button
                          type="submit"
                          className="w-full py-3 px-4 rounded-lg font-medium transition-colors"
                          style={{
                            backgroundColor: settings.buttonColor,
                            color: settings.buttonTextColor,
                            fontFamily: settings.fontFamily
                          }}
                        >
                          Join Now
                        </button>
                      </form>
                    </div>
                    
                    <p 
                      className="mt-6 text-sm opacity-75"
                      style={{ color: settings.textColor, fontFamily: settings.fontFamily }}
                    >
                      We respect your privacy. Unsubscribe at any time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Templates View */
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Choose a Template</h2>
              <button
                onClick={() => setViewMode('builder')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Back to Builder
              </button>
            </div>
            
            <p className="text-gray-600 mb-8">
              Start with a professionally designed template and customize it to match your brand.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg shadow-md"></div>
                      <p className="mt-2 text-sm text-gray-600">Template Preview</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    <button
                      onClick={() => loadTemplate(template)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Use This Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Page Section */}
        {savedPage && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Capture Page</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Capture Page URL
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-50 p-3 rounded border">
                    <code className="text-sm break-all">{savedPage.url}</code>
                  </div>
                  <button
                    onClick={() => window.open(savedPage.url, '_blank')}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
                  >
                    Preview Page
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Share this URL to start collecting leads with your custom capture page
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <strong>Page Name:</strong> {savedPage.name}
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <strong>URL Slug:</strong> {savedPage.slug}
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <strong>Created:</strong> {new Date(savedPage.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
