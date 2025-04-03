import React from 'react';

function About() {
  return (
    <div className="p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">About</h1>
          <p className="text-sm text-gray-600 mt-1">App Information</p>
        </div>

        {/* App Info Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              📱
            </div>
            <div className="ml-4">
              <h2 className="font-semibold">App Name</h2>
              <p className="text-sm text-gray-500">Version 1.0.0</p>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-3">Features</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-xl mr-3">🎯</span>
              <div>
                <p className="font-medium">Mobile-First Design</p>
                <p className="text-sm text-gray-500">Optimized for mobile viewing</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xl mr-3">⚡</span>
              <div>
                <p className="font-medium">Fast Performance</p>
                <p className="text-sm text-gray-500">Quick loading times</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xl mr-3">🛡️</span>
              <div>
                <p className="font-medium">Secure</p>
                <p className="text-sm text-gray-500">Your data is protected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-3">Contact</h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Email: support@example.com</p>
            <p className="text-sm text-gray-600">Phone: (555) 123-4567</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About; 