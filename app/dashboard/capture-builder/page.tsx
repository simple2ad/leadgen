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
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedPages, setSavedPages] = useState<any[]>([]);

  // Update preview when settings change
  useEffect(() => {
    console.log('Settings updated:', settings);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('Saving capture page:', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to saved pages list
      const newPage = {
        ...settings,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMjAwIiB5Mj0iMTIwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzY2N2VlYSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM3NjRiYTIiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8dGV4dCB4PSIxMDAiIHk9IjYwIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DYXB0dXJlIFBhZ2UgUHJldmlldzwvdGV4dD4KPC9zdmc+'
      };
      
      setSavedPages(prev => [newPage, ...prev]);
      alert('Capture page saved successfully!');
    } catch (error) {
      console.error('Error saving capture page:', error);
      alert('Error saving capture page');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof CapturePageSettings, value: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Capture Page Builder</h1>
          <p className="text-gray-600 mt-2">Create and customize your lead capture pages</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Page Settings</h2>
            
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
                      Slug (URL)
                    </label>
                    <input
                      type="text"
                      value={settings.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="my-capture-page"
                    />
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
                </div>
              </div>

              {/* Background Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Background</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Type
                    </label>
                    <select
                      value={settings.backgroundType}
                      onChange={(e) => handleInputChange('backgroundType', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="gradient">Gradient</option>
                      <option value="solid">Solid Color</option>
                      <option value="image">Image</option>
                    </select>
                  </div>

                  {settings.backgroundType === 'gradient' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gradient
                      </label>
                      <input
                        type="text"
                        value={settings.backgroundGradient}
                        onChange={(e) => handleInputChange('backgroundGradient', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      />
                    </div>
                  )}

                  {settings.backgroundType === 'solid' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Background Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={settings.backgroundColor}
                          onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={settings.backgroundColor}
                          onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {settings.backgroundType === 'image' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Background Image URL
                      </label>
                      <input
                        type="url"
                        value={settings.backgroundImage}
                        onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Color Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Colors & Fonts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.textColor}
                        onChange={(e) => handleInputChange('textColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        value={settings.textColor}
                        onChange={(e) => handleInputChange('textColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.buttonColor}
                        onChange={(e) => handleInputChange('buttonColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        value={settings.buttonColor}
                        onChange={(e) => handleInputChange('buttonColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button Text Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.buttonTextColor}
                        onChange={(e) => handleInputChange('buttonTextColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        value={settings.buttonTextColor}
                        onChange={(e) => handleInputChange('buttonTextColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Family
                    </label>
                    <select
                      value={settings.fontFamily}
                      onChange={(e) => handleInputChange('fontFamily', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Arial">Arial</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Verdana">Verdana</option>
                    </select>
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

        {/* Saved Pages Section */}
        {savedPages.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Capture Pages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedPages.map((page) => (
                <div key={page.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="h-32 bg-gray-200 flex items-center justify-center">
                    {page.thumbnail ? (
                      <img 
                        src={page.thumbnail} 
                        alt={page.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500">No Preview</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{page.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{page.slug}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(page.createdAt).toLocaleDateString()}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Page
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
